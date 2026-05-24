"use client";

import { useActionState, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  tenantSignupAction,
  tenantSigninAction,
  type TenantAuthState,
} from "@/app/actions/tenant-auth";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const inputCls =
  "w-full px-4 py-3.5 pl-12 rounded-xl bg-white/60 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm hover:border-slate-300 hover:bg-white/80";

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease, staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.25, ease },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

export function ProductAuthForm() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [signinState, signinAction, signinPending] = useActionState(
    tenantSigninAction,
    undefined as TenantAuthState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    tenantSignupAction,
    undefined as TenantAuthState,
  );

  if (signinState?.ok || signupState?.ok) {
    router.push(`/product/${slug}/dashboard`);
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 sticky top-0 h-screen">
        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[15%] w-[450px] h-[450px] rounded-full bg-blue-500/[0.12] blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, -25, 0], y: [0, 35, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500/[0.10] blur-[110px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-[55%] left-[45%] w-[250px] h-[250px] rounded-full bg-emerald-500/[0.06] blur-[90px]"
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col w-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 22 }}
              >
                monitoring
              </span>
            </div>
            <span className="text-white/90 font-bold text-lg tracking-tight">
              {slug}
            </span>
          </motion.div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.15 }}
              className="space-y-10"
            >
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
                  Monitor what
                  <br />
                  <span className="auth-gradient-text">matters most.</span>
                </h1>
                <p className="text-slate-400 mt-5 max-w-sm leading-relaxed text-[15px]">
                  Real-time data monitoring with intelligent alerts. Track APIs,
                  websites, feeds, and more — all from one dashboard.
                </p>
              </div>

              {/* Feature cards */}
              <div className="space-y-3 max-w-sm">
                {[
                  {
                    icon: "sensors",
                    label: "7 data source types",
                    desc: "APIs, web, RSS, CSV, Sheets, PDF, Email",
                  },
                  {
                    icon: "notification_important",
                    label: "Smart alerts",
                    desc: "Custom rules with multi-channel delivery",
                  },
                  {
                    icon: "speed",
                    label: "Real-time dashboard",
                    desc: "Live metrics and health monitoring",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-colors duration-300"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span
                        className="material-symbols-outlined text-blue-400"
                        style={{ fontSize: 18 }}
                      >
                        {feature.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90">
                        {feature.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {feature.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-6"
          >
            {[
              { icon: "shield", label: "DSGVO-compliant" },
              { icon: "lock", label: "EU data storage" },
              { icon: "encrypted", label: "End-to-end encrypted" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-slate-600"
                  style={{ fontSize: 14 }}
                >
                  {badge.icon}
                </span>
                <span className="text-[11px] text-slate-500">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50/80 via-white to-blue-50/20">
        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 22 }}
              >
                monitoring
              </span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">
                {slug}
              </h1>
              <p className="text-slate-500 text-xs">Monitoring-SaaS</p>
            </div>
          </motion.div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="w-full max-w-[440px]"
          >
            {/* Heading */}
            <div className="mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease }}
                >
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {mode === "signin" ? "Welcome back" : "Get started"}
                  </h2>
                  <p className="text-slate-500 mt-1.5 text-sm">
                    {mode === "signin"
                      ? "Sign in to access your monitoring dashboard"
                      : "Create your account to start monitoring"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Tabs with sliding indicator */}
            <div className="flex mb-8 bg-slate-100/80 rounded-xl p-1 relative">
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm"
                initial={false}
                animate={{
                  left: mode === "signin" ? "4px" : "50%",
                  right: mode === "signin" ? "50%" : "4px",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold relative z-10 transition-colors duration-200"
                style={{ color: mode === "signin" ? "#0f172a" : "#94a3b8" }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold relative z-10 transition-colors duration-200"
                style={{ color: mode === "signup" ? "#0f172a" : "#94a3b8" }}
              >
                Sign Up
              </button>
            </div>

            {/* Animated form switcher */}
            <AnimatePresence mode="wait">
              {mode === "signin" ? (
                <motion.form
                  key="signin"
                  action={signinAction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <input type="hidden" name="product_slug" value={slug} />

                  <motion.div variants={fieldVariants}>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Email
                    </label>
                    <div className="relative group">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200"
                        style={{ fontSize: 18 }}
                      >
                        mail
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@company.com"
                        className={inputCls}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Password
                    </label>
                    <div className="relative group">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200"
                        style={{ fontSize: 18 }}
                      >
                        lock
                      </span>
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="Enter your password"
                        className={inputCls}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <motion.button
                      type="submit"
                      disabled={signinPending}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none transition-shadow duration-300"
                    >
                      {signinPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                          />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Sign In
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            arrow_forward
                          </span>
                        </span>
                      )}
                    </motion.button>
                  </motion.div>

                  <AnimatePresence>
                    {signinState && !signinState.ok && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2"
                      >
                        <span
                          className="material-symbols-outlined text-red-400"
                          style={{ fontSize: 16 }}
                        >
                          error
                        </span>
                        {signinState.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  action={signupAction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <input type="hidden" name="product_slug" value={slug} />

                  <motion.div variants={fieldVariants}>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Name
                    </label>
                    <div className="relative group">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200"
                        style={{ fontSize: 18 }}
                      >
                        person
                      </span>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Your full name"
                        className={inputCls}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Email
                    </label>
                    <div className="relative group">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200"
                        style={{ fontSize: 18 }}
                      >
                        mail
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@company.com"
                        className={inputCls}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Password
                    </label>
                    <div className="relative group">
                      <span
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200"
                        style={{ fontSize: 18 }}
                      >
                        lock
                      </span>
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="Min. 8 characters"
                        className={inputCls}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 ml-1">
                      At least 8 characters
                    </p>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <motion.button
                      type="submit"
                      disabled={signupPending}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none transition-shadow duration-300"
                    >
                      {signupPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                          />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Create Account
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            arrow_forward
                          </span>
                        </span>
                      )}
                    </motion.button>
                  </motion.div>

                  <AnimatePresence>
                    {signupState && !signupState.ok && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2"
                      >
                        <span
                          className="material-symbols-outlined text-red-400"
                          style={{ fontSize: 16 }}
                        >
                          error
                        </span>
                        {signupState.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-200/80" />
                <span className="text-xs text-slate-400 font-medium">
                  Trusted by teams across Europe
                </span>
                <div className="flex-1 h-px bg-slate-200/80" />
              </div>

              <div className="flex items-center justify-center gap-5">
                {[
                  { icon: "lock", text: "Encrypted" },
                  { icon: "language", text: "EU stored" },
                  { icon: "verified_user", text: "DSGVO" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="material-symbols-outlined text-slate-300"
                      style={{ fontSize: 14 }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-xs text-slate-400">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
