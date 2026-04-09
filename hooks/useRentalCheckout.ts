"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

type ContentType = "Movies" | "Series";

type CreateRentalOrderResponse = {
  status: "success" | "fail";
  checkoutType: "order";
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  content: {
    id: string;
    name: string;
    rentalPrice: number;
    durationHours: number;
  };
  userPrefill: {
    name: string;
    email: string;
    contact: string;
  };
};

type VerifyRentalResponse = {
  status: "success" | "fail";
  message: string;
  data: Record<string, unknown>;
};

type RazorpayPaymentResult = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
};

export function useRentalCheckout() {
  const [renting, setRenting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(false);

  const rentMovie = useCallback(
    (
      contentId: string,
      contentType: ContentType = "Movies"
    ): Promise<VerifyRentalResponse> => {
      if (activeRef.current) {
        return Promise.reject(new Error("A rental is already in progress."));
      }

      activeRef.current = true;
      setRenting(true);
      setError(null);

      return new Promise<VerifyRentalResponse>(async (resolve, reject) => {
        const cleanup = () => {
          activeRef.current = false;
          setRenting(false);
        };

        try {
          const { data: createRes } =
            await axios.post<CreateRentalOrderResponse>(
              `${API_BASE}/user/rental/createOrder`,
              { contentId, contentType },
              { headers: authHeaders() }
            );

          if (createRes.status !== "success") {
            throw new Error("Failed to create rental order.");
          }

          if (typeof window.Razorpay === "undefined") {
            throw new Error(
              "Razorpay SDK not loaded. Please refresh the page and try again."
            );
          }

          const options: Record<string, unknown> = {
            key: createRes.keyId,
            order_id: createRes.orderId,
            amount: createRes.amount,
            currency: createRes.currency,
            name: "Popil",
            description: `Rent: ${createRes.content.name} (${createRes.content.durationHours}h)`,
            prefill: {
              name: createRes.userPrefill.name,
              email: createRes.userPrefill.email,
              contact: createRes.userPrefill.contact,
            },
            theme: { color: "#FEA500" },
            handler: async (response: RazorpayPaymentResult) => {
              try {
                const { data: verifyRes } =
                  await axios.post<VerifyRentalResponse>(
                    `${API_BASE}/user/rental/verifyPayment`,
                    {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                    { headers: authHeaders() }
                  );

                cleanup();
                resolve(verifyRes);
              } catch (verifyErr: unknown) {
                const e = verifyErr as { response?: { data?: { message?: string } }; message?: string };
                const msg =
                  e?.response?.data?.message ||
                  e?.message ||
                  "Payment verification failed.";
                setError(msg);
                cleanup();
                reject(new Error(msg));
              }
            },
            modal: {
              ondismiss: () => {
                cleanup();
                reject(new Error("dismissed"));
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err: unknown) {
          const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "Could not start rental payment.";
          const status = e?.response?.status;
          setError(msg);
          activeRef.current = false;
          setRenting(false);
          reject(Object.assign(new Error(msg), { status }));
        }
      });
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { rentMovie, renting, error, clearError };
}
