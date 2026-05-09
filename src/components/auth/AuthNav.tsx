"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useTransition } from "react";

import { signoutAction } from "@/app/actions/auth";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

export type AuthNavUser = { email: string; name: string } | null;

export function AuthNav({ user }: { user: AuthNavUser }) {
  const [signingOut, startSignout] = useTransition();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.3, 0.08)}
      className="flex items-center gap-3"
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            disabled={signingOut}
            onClick={() => startSignout(() => signoutAction())}
            className="text-sm font-semibold text-on-surface hover:text-primary transition-colors disabled:opacity-60"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </motion.button>
        </>
      ) : (
        <>
          <motion.div variants={fadeUp}>
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-on-surface hover:text-primary transition-colors"
            >
              Log In
            </Link>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link
              href="/auth/signup"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
            >
              Get Started
            </Link>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
