"use client";

import type { Variants, Transition } from "framer-motion";

// Single ease curve used across the operator console — keeps motion coherent.
export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const T_FAST: Transition = { duration: 0.32, ease: easeOut };
export const T_NORMAL: Transition = { duration: 0.45, ease: easeOut };
export const T_SLOW: Transition = { duration: 0.7, ease: easeOut };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: T_NORMAL },
};

export const fadeUpSm: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: T_FAST },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: T_NORMAL },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.42, ease: easeOut },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: T_NORMAL },
};

export const stagger = (
  delayChildren = 0,
  staggerChildren = 0.06,
): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

export const cardHover = {
  whileHover: {
    y: -2,
    transition: { duration: 0.2, ease: easeOut },
  },
};

export const inViewOnce = { once: true, amount: 0.15 } as const;
