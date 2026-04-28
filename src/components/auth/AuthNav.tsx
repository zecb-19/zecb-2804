"use client";

import { motion, type Variants } from "framer-motion";
import { useState, useTransition } from "react";

import { signoutAction } from "@/app/actions/auth";
import { AuthModal } from "./AuthModal";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

const buttonHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.2, ease: easeOut } },
  whileTap: { scale: 0.96 },
};

export type AuthNavUser = { email: string; name: string } | null;

export function AuthNav({ user }: { user: AuthNavUser }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signingOut, startSignout] = useTransition();

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.3, 0.08)}
        className="flex items-center gap-4"
      >
        {user ? (
          <>
            <motion.span
              variants={fadeUp}
              className="hidden sm:inline text-sm text-on-surface-variant"
            >
              {user.name || user.email}
            </motion.span>
            <motion.button
              variants={fadeUp}
              {...buttonHover}
              type="button"
              disabled={signingOut}
              onClick={() => startSignout(() => signoutAction())}
              className="text-sm font-semibold text-on-surface hover:text-primary transition-colors disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              variants={fadeUp}
              {...buttonHover}
              type="button"
              onClick={() => {
                setMode("signin");
                setOpen(true);
              }}
              className="text-sm font-semibold text-on-surface hover:text-primary transition-colors"
            >
              Log In
            </motion.button>
            <motion.button
              variants={fadeUp}
              {...buttonHover}
              type="button"
              onClick={() => {
                setMode("signup");
                setOpen(true);
              }}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            >
              Get Started
            </motion.button>
          </>
        )}
      </motion.div>
      <AuthModal open={open} initialMode={mode} onClose={() => setOpen(false)} />
    </>
  );
}
