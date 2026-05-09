"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATS = [
  { value: "< 72h", label: "Build time" },
  { value: "€0.50", label: "Per build cost" },
  { value: "11", label: "Automated steps" },
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated gradient orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-blue-500/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-violet-500/15 blur-[80px]"
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>bolt</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">ZECB</span>
            </Link>
          </motion.div>

          {/* Main copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold text-white leading-tight">
              Build profitable SaaS<br />
              <span className="text-blue-400">in 72 hours.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              From idea to live product — automated build pipeline,
              real customers, zero employees.
            </p>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-8"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header — shown only on small screens */}
        <div className="lg:hidden px-6 pt-6 pb-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>bolt</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">ZECB</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="text-slate-500 mt-2">{subtitle}</p>
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
