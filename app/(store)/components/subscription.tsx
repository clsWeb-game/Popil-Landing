"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import SubscriptionCard from "./SubscriptionCard";
import { toast } from "sonner";

export default function Subscription() {
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const {
    plans,
    mySubscription,
    loading,
    error,
    refetchMySubscription,
  } = useSubscription();

  const {
    purchase,
    purchasing,
    error: purchaseError,
    clearError,
  } = useRazorpayCheckout();

  const currentPlanId = mySubscription?.subscription?.plan?.id ?? null;
  const currentPlanSlug = mySubscription?.subscription?.plan?.slug ?? null;
  const currentEndsAt = mySubscription?.subscription?.endsAt ?? null;
  const subStatus = mySubscription?.subscription?.status ?? null;

  const currentPlanInVisibleList =
    currentPlanId != null &&
    plans.some((p) => String(p._id) === String(currentPlanId));
  const showHiddenPlanNote =
    currentPlanId != null &&
    !currentPlanInVisibleList &&
    subStatus != null &&
    subStatus !== "free";
  const hasActiveDailyPass =
    currentPlanSlug === "daily-pass" &&
    typeof currentEndsAt === "string" &&
    !Number.isNaN(Date.parse(currentEndsAt)) &&
    new Date(currentEndsAt).getTime() > Date.now();

  const handleSubscribe = async (planId: string) => {
    clearError();
    setProcessingPlanId(planId);
    const planName = plans.find((p) => String(p._id) === String(planId))?.name;
    try {
      await purchase(planId);
      await refetchMySubscription();
      toast.success(planName ? `Subscribed to ${planName}` : "Subscription successful");
    } catch (err: any) {
      if (err?.message === "dismissed") return;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Subscription failed";
      toast.error(msg);
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <section className="w-full bg-background px-4 py-16 md:px-8 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <header className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-xl font-semibold text-white md:text-4xl lg:text-[36px]">
            Subscription Plan
          </h2>
          <p className="mt-3 text-[12px] text-white/55 md:text-[20px]">
            Everything you need to know about the product and billing.
          </p>
        </header>

        {purchaseError && (
          <div className="mx-auto mb-8 max-w-lg rounded-xl bg-red-500/10 px-5 py-3 text-center text-sm text-red-400">
            {purchaseError}
          </div>
        )}

        {showHiddenPlanNote && mySubscription?.subscription?.plan?.name && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center text-sm text-white/80">
            You&apos;re on{" "}
            <span className="font-semibold text-white">
              {mySubscription.subscription.plan.name}
            </span>
            . This plan isn&apos;t offered to new subscribers right now; your
            access stays the same.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 items-stretch justify-items-center gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6 auto-rows-fr">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[520px] w-full max-w-[360px] animate-pulse rounded-[28px] bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-white/60">Failed to load subscription plans.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-white/60">
            <p>No subscription plans are available for purchase right now.</p>
            {showHiddenPlanNote && mySubscription?.subscription?.plan?.name ? (
              <p className="max-w-md text-sm text-white/45">
                Your current membership is unchanged.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch justify-items-center gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6 auto-rows-fr">
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan._id}
                plan={plan}
                isCurrentPlan={String(plan._id) === String(currentPlanId)}
                purchasing={purchasing && processingPlanId === plan._id}
                disabled={
                  (purchasing && processingPlanId !== plan._id) ||
                  (plan.slug === "daily-pass" && hasActiveDailyPass)
                }
                onSubscribe={() => handleSubscribe(plan._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
