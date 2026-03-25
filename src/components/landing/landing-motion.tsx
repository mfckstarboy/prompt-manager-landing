"use client";

import {
  createContext,
  type CSSProperties,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type MotionVariant = "fade" | "fade-up" | "soft-scale" | "slide-left" | "slide-right";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  variant?: MotionVariant;
}>;

type MotionGroupContextValue = {
  reducedMotion: boolean;
  stagger: number;
  visible: boolean;
};

const MotionGroupContext = createContext<MotionGroupContextValue | null>(null);

export const landingMotionVariants: MotionVariant[] = [
  "fade",
  "fade-up",
  "soft-scale",
  "slide-left",
  "slide-right",
];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useReveal(once: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (!once) {
          setVisible(false);
        }
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.18,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once, prefersReducedMotion]);

  return { prefersReducedMotion, ref, visible };
}

function getMotionStyle(delay: number, duration: number) {
  return {
    "--motion-delay": `${delay}ms`,
    "--motion-duration": `${duration}ms`,
  } as CSSProperties;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 560,
  once = true,
  variant = "fade-up",
}: RevealProps) {
  const { prefersReducedMotion, ref, visible } = useReveal(once);

  return (
    <div
      ref={ref}
      className={className}
      data-motion={variant}
      data-motion-visible={prefersReducedMotion || visible}
      style={getMotionStyle(delay, duration)}
    >
      {children}
    </div>
  );
}

type RevealGroupProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  stagger?: number;
  variant?: MotionVariant;
}>;

export function RevealGroup({
  children,
  className,
  delay = 0,
  duration = 620,
  once = true,
  stagger = 90,
  variant = "fade-up",
}: RevealGroupProps) {
  const { prefersReducedMotion, ref, visible } = useReveal(once);

  return (
    <MotionGroupContext.Provider
      value={{
        reducedMotion: prefersReducedMotion,
        stagger,
        visible: prefersReducedMotion || visible,
      }}
    >
      <div
        ref={ref}
        className={className}
        data-motion={variant}
        data-motion-visible={prefersReducedMotion || visible}
        style={getMotionStyle(delay, duration)}
      >
        {children}
      </div>
    </MotionGroupContext.Provider>
  );
}

type RevealItemProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  duration?: number;
  index: number;
  variant?: MotionVariant;
}>;

export function RevealItem({
  children,
  className,
  delay = 0,
  duration = 540,
  index,
  variant = "fade-up",
}: RevealItemProps) {
  const context = useContext(MotionGroupContext);

  if (!context) {
    throw new Error("RevealItem must be used within a RevealGroup.");
  }

  const resolvedDelay = delay + index * context.stagger;

  return (
    <div
      className={className}
      data-motion={variant}
      data-motion-visible={context.visible}
      style={getMotionStyle(resolvedDelay, duration)}
    >
      {children}
    </div>
  );
}
