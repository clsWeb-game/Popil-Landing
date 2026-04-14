/**
 * Maps API `durationDays` to a short label for the price row (e.g. "/month", "/year").
 * Known presets from billing; unknown values get a reasonable derived label.
 */
export function formatSubscriptionDurationLabel(durationDays: number): string {
  const d = Math.round(Number(durationDays));
  if (!Number.isFinite(d) || d <= 0) return "";

  switch (d) {
    case 1:
      return "/day";
    case 7:
      return "/week";
    case 30:
      return "/month";
    case 90:
      return "/3 months";
    case 180:
      return "/6 months";
    case 365:
      return "/year";
    case 3650:
      return "/10 years";
    default:
      break;
  }

  if (d % 365 === 0) {
    const years = d / 365;
    return years === 1 ? "/year" : `/${years} years`;
  }

  if (d % 30 === 0) {
    const months = d / 30;
    return months === 1 ? "/month" : `/${months} months`;
  }

  if (d % 7 === 0) {
    const weeks = d / 7;
    return weeks === 1 ? "/week" : `/${weeks} weeks`;
  }

  return `/${d} days`;
}
