"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms applied only when motion is allowed. */
  delay?: number;
  as?: ElementType;
};

/**
 * Progressive-enhancement scroll reveal.
 *
 * SSR renders children fully visible (SEO + no-JS safe). After mount, if the
 * user has NOT requested reduced motion, elements start hidden and fade/slide
 * in when scrolled into view. Under `prefers-reduced-motion` nothing animates.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") return;

    const node = ref.current;
    if (!node) return;

    setAnimate(true);
    setVisible(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={animate ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        animate && "transition-all duration-700 ease-out will-change-transform",
        animate && !visible && "translate-y-4 opacity-0",
        animate && visible && "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
