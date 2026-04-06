"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import type {
  CreateRazorpayResponse,
  RazorpayPaymentResult,
  VerifyRazorpayResponse,
} from "@/types/subscription";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export function useRazorpayCheckout() {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(false);

  const purchase = useCallback(
    (planId: string): Promise<VerifyRazorpayResponse> => {
      if (activeRef.current) {
        return Promise.reject(new Error("A purchase is already in progress."));
      }

      activeRef.current = true;
      setPurchasing(true);
      setError(null);

      return new Promise<VerifyRazorpayResponse>(async (resolve, reject) => {
        const cleanup = () => {
          activeRef.current = false;
          setPurchasing(false);
        };

        try {
          const { data: createRes } = await axios.post<CreateRazorpayResponse>(
            `${API_BASE}/user/subscription/razorpay/subscription`,
            { planId },
            { headers: authHeaders() }
          );

          if (createRes.status !== "success") {
            throw new Error("Failed to initiate subscription.");
          }

          if (typeof window.Razorpay === "undefined") {
            throw new Error(
              "Razorpay SDK not loaded. Please refresh the page and try again."
            );
          }

          const options: Record<string, unknown> = {
            key: createRes.keyId,
            ...(createRes.checkoutType === "subscription"
              ? { subscription_id: createRes.subscriptionId }
              : { order_id: createRes.orderId }),
            ...(createRes.checkoutType === "order"
              ? { amount: createRes.amount, currency: createRes.currency }
              : {}),
            name: "Popil",
            description: `${createRes.plan.name} Plan`,
            prefill: {
              name: createRes.userPrefill.name,
              email: createRes.userPrefill.email,
              contact: createRes.userPrefill.contact,
            },
            theme: { color: "#FEA500" },
            handler: async (response: RazorpayPaymentResult) => {
              try {
                const { data: verifyRes } =
                  await axios.post<VerifyRazorpayResponse>(
                    `${API_BASE}/user/subscription/razorpay/verify`,
                    {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_subscription_id:
                        response.razorpay_subscription_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                    { headers: authHeaders() }
                  );

                cleanup();
                resolve(verifyRes);
              } catch (verifyErr: any) {
                const msg =
                  verifyErr?.response?.data?.message ||
                  verifyErr?.message ||
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
        } catch (err: any) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Could not start payment.";
          setError(msg);
          activeRef.current = false;
          setPurchasing(false);
          reject(new Error(msg));
        }
      });
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { purchase, purchasing, error, clearError };
}
