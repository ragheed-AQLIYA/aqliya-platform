/** Diagnostic booking — set NEXT_PUBLIC_BOOKING_URL for Cal.com / Calendly. */
export const BOOKING_EMAIL = "ragheed@aqliya.com";

export function getBookingUrl(locale: "ar" | "en" = "ar"): string {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (url) return url;
  return locale === "en"
    ? "/en/contact?interest=diagnostic"
    : "/contact?interest=diagnostic";
}

export function isExternalBooking(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
