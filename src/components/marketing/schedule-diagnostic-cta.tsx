import Link from "next/link";
import { getBookingUrl, isExternalBooking } from "@/lib/marketing/booking";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  variant?: "primary" | "outline";
  locale?: "ar" | "en";
};

export function ScheduleDiagnosticCta({
  label,
  className,
  variant = "primary",
  locale = "ar",
}: Props) {
  const href = getBookingUrl(locale);
  const text =
    label ??
    (locale === "en" ? "Schedule diagnostic session" : "احجز جلسة تشخيص");
  const classes = cn(
    variant === "primary" ? "btn-primary" : "btn-outline",
    "inline-flex h-11 items-center justify-center px-6 text-sm font-semibold",
    className,
  );

  if (isExternalBooking(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        data-event="click_schedule_diagnostic"
      >
        {text}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      data-event="click_schedule_diagnostic"
    >
      {text}
    </Link>
  );
}
