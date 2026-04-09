import type { SubscriptionPlan } from "@/types/subscription";

type SubscriptionCardProps = {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  purchasing: boolean;
  disabled?: boolean;
  onSubscribe: () => void;
};

function buildFeatures(plan: SubscriptionPlan): string[] {
  const e = plan.entitlements;
  return [
    `Max quality ${e.max_stream_quality}`,
    e.access_songs ? "Songs" : null,
    e.access_movies ? "Movies" : null,
    e.access_series ? "Series" : null,
    e.access_videos ? "Videos" : null,
    e.access_karaoke ? "Karaoke" : null,
    e.ads_required ? "With Ads" : "Ad-Free",
    e.clip_creation_access
      ? `Clips/day: ${e.clip_daily_limit}`
      : null,
  ].filter(Boolean) as string[];
}

function getPriceLabel(plan: SubscriptionPlan) {
  if (plan.slug === "free" || plan.price === 0) return null;
  if (plan.durationDays === 1) return "/day";
  return "/month";
}

export default function SubscriptionCard({
  plan,
  isCurrentPlan,
  purchasing,
  disabled = false,
  onSubscribe,
}: SubscriptionCardProps) {
  const highlighted = plan.entitlements.priority_content_access;
  const isFree = plan.slug === "free";
  const features = buildFeatures(plan);
  const visibleFeatures = features.slice(0, 3);
  const hasMoreFeatures = features.length > 3;
  const priceLabel = getPriceLabel(plan);

  return (
    <article
      className={`relative flex h-full w-full max-w-[360px] flex-col overflow-visible rounded-[28px] px-5 pb-5 bg-white ${
        isCurrentPlan ? "" : ""
      }`}
    >
      {/* Current plan badge */}
      {/* {isCurrentPlan && (
        <div className="absolute top-4 right-1.5 z-20 rounded-full bg-linear-to-r from-primary to-secondary px-2 py-1 text-xs font-semibold text-white">
          Your Plan
        </div>
      )} */}

      {/* Background SVG */}
      {/* <div
        className="absolute inset-0 z-0 p-5"
        style={{
          backgroundImage: "url(/background/priceCard.svg)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        aria-hidden
      /> */}

      <div className="absolute -top-[10%] -translate-x-1/2 left-1/2 z-5 p-4 rounded-full bg-[#1b1b1d]">
        <img src="/logo/cardIcon.svg" alt="Background" className="w-full h-full object-cover" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex h-full flex-col px-7 pt-30 pb-8">
        {/* Plan name and label */}
        <div className="text-left">
          <h3
            className={`text-xl font-semibold text-[36px] ${
              highlighted
                ? "text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary"
                : "text-neutral-900"
            }`}
          >
            {plan.name}
          </h3>
          <p className="text-xs text-neutral-600 text-[20px]">
            {plan.entitlements.ads_required ? "with Ads" : "Ad-Free"}
          </p>
        </div>

        {/* Price section */}
        {isFree ? (
          null
        ) : (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-neutral-900 md:justify-start md:gap-10">
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-semibold leading-none sm:text-[36px] md:text-[36px]">
                ₹{plan.price}
              </span>
            </div>
            {priceLabel && (
              <span className="text-sm font-medium text-neutral-600 md:text-base">
                {priceLabel}
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-6 flex justify-center">
          {isFree ? null : isCurrentPlan ? (
            <span className="w-full max-w-[230px] rounded-[18px] bg-linear-to-b from-primary to-secondary px-8 py-2.5 text-center text-sm font-semibold text-white md:max-w-xs md:py-3 md:text-base opacity-80 cursor-not-allowed">
              Current Plan
            </span>
          ) : (
            <button
              type="button"
              disabled={purchasing || disabled}
              onClick={onSubscribe}
              // className={
              //   highlighted
              //     ? "cursor-pointer w-full max-w-[230px] rounded-[18px] px-8 py-2.5 text-center text-sm font-semibold transition md:max-w-xs md:py-3 md:text-base bg-linear-to-b from-primary to-secondary hover:bg-linear-to-r=b hover:from-primary hover:to-primary text-white hover:shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed duration-500"
              //     : "cursor-pointer w-full max-w-[230px] rounded-[18px] border border-neutral-400 hover:border-primary bg-transparent px-8 py-2.5 text-center text-sm font-semibold text-neutral-900 hover:text-white transition hover:bg-primary md:max-w-xs md:py-3 md:text-base disabled:opacity-50 disabled:cursor-not-allowed duration-500"
              // }
              className = "cursor-pointer w-full max-w-[230px] rounded-[18px] border border-neutral-400 hover:border-primary bg-transparent px-8 py-2.5 text-center text-sm font-semibold text-neutral-900 hover:text-white transition hover:bg-primary md:max-w-xs md:py-3 md:text-base disabled:opacity-50 disabled:cursor-not-allowed duration-500"
            >
              {purchasing ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing…
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          )}
        </div>

        {/* Features list */}
        <ul className="mt-auto space-y-2.5 pt-8 text-center text-[12px] text-neutral-800 sm:text-[14px] md:pt-10 md:text-left md:text-[20px]">
          {visibleFeatures.map((line) => (
            <li
              key={line}
              className="flex justify-center gap-2 leading-relaxed md:justify-start"
            >
              <span
                className={`mt-0.5 shrink-0 font-bold text-base ${
                  highlighted ? "text-primary" : "text-neutral-900"
                }`}
                aria-hidden
              >
                ✓
              </span>
              <span className="text-neutral-900">{line}</span>
            </li>
          ))}
          {hasMoreFeatures ? (
            <li className="flex justify-center gap-2 leading-relaxed md:justify-start">
              <span
                className={`mt-0.5 shrink-0 font-bold text-base ${
                  highlighted ? "text-primary" : "text-neutral-900"
                }`}
                aria-hidden
              >
                and more ...
              </span>
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}
