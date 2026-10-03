import type { Variants } from "framer-motion";

export const motionEase = [0.22, 1, 0.36, 1] as const;
export const revealViewport = { once: true, amount: 0.2 } as const;

export function motionVariants(reducedMotion: boolean | null) {
  const transition = { duration: reducedMotion ? 0 : 0.6, ease: motionEase };
  const up: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 30 },
    show: (index = 0) => ({ opacity: 1, y: 0, transition: { ...transition, delay: reducedMotion ? 0 : index * 0.12 } }),
  };
  const left: Variants = { hidden: { opacity: 0, x: reducedMotion ? 0 : -40 }, show: { opacity: 1, x: 0, transition } };
  const right: Variants = { hidden: { opacity: 0, x: reducedMotion ? 0 : 40 }, show: { opacity: 1, x: 0, transition } };
  const scale: Variants = { hidden: { opacity: 0, scale: reducedMotion ? 1 : 0.9 }, show: { opacity: 1, scale: 1, transition } };
  const fade: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition } };
  const word: Variants = { hidden: { y: reducedMotion ? 0 : "110%" }, show: { y: 0, transition } };
  const stagger = (gap = 0.12, delay = 0): Variants => ({
    hidden: {}, show: { transition: { staggerChildren: reducedMotion ? 0 : gap, delayChildren: reducedMotion ? 0 : delay } },
  });
  return { up, left, right, scale, fade, word, stagger };
}
