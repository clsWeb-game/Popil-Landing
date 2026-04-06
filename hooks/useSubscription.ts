"use client";

import { useFetch } from "./useFetch";
import type {
  SubscriptionPlan,
  SubscriptionPlansResponse,
  MySubscriptionResponse,
} from "@/types/subscription";

export function useSubscription() {
  const {
    data: plansRaw,
    loading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useFetch<SubscriptionPlansResponse>("/user/subscription/plans");

  const {
    data: mySubRaw,
    loading: mySubLoading,
    error: mySubError,
    refetch: refetchMySubscription,
  } = useFetch<MySubscriptionResponse>("/user/subscription/me");

  const rawPlans: SubscriptionPlan[] = plansRaw?.data ?? [];
  /** Hide plans with visibility === false (defense in depth; API should already filter). */
  const plans = rawPlans.filter((p) => p.visibility !== false);
  const mySubscription = mySubRaw ?? null;

  const loading = plansLoading || mySubLoading;
  const error = plansError || mySubError;

  return {
    plans,
    mySubscription,
    loading,
    error,
    refetchPlans,
    refetchMySubscription,
  };
}
