"use client";
 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/utils/auth";

import axios from "axios";

// Helper to build query string from params (optional)
function buildQuery(params?: Record<string, any>) {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) query.append(key, value.toString());
  });
  return query.toString() ? `?${query}` : "";
}

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface useFetchConfig {
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  manual?: boolean; // If true, only fetch on .run()
}

export function useFetch<T = any>(
  url: string,
  method: ApiMethod = "GET",
  config: useFetchConfig = {}
) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const finalUrl = `${baseURL}${url}${buildQuery(config.params)}`;

  const fetchData = async (
    overrideBody?: any,
    overrideParams?: Record<string, any>
  ): Promise<{ ok: true; data: T } | { ok: false; error: string }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.request<T>({
        url: `${baseURL}${url}${buildQuery(overrideParams ?? config.params)}`,
        method,
        headers: { ...(config.headers || {}), Authorization: token ? `Bearer ${token}` : "" },
        data: overrideBody ?? config.body,
        withCredentials: false,
      });
      setData(res.data);
      return { ok: true, data: res.data };
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      const serverMessage = err?.response?.data?.message as string | undefined;
      // Only treat as session expiry when user had a token (avoid login/register 401 clearing nothing)
      const isAuthFailure =
        !!token &&
        (status === 401 ||
          (typeof serverMessage === "string" &&
            /invalid token|expired|not authenticated/i.test(serverMessage)));
      if (isAuthFailure) {
        clearAuth();
        router.replace("/login");
      }
      const message = serverMessage || err?.message || "Request failed";
      setError(message);
      setData(null);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch immediately unless config.manual is set
  useEffect(() => {
    if (!config.manual) fetchData();
    // eslint-disable-next-line
  }, [finalUrl, method]);

  return {
    data,
    error,
    loading,
    run: fetchData, // manual trigger if needed
    refetch: fetchData,
  };
}
