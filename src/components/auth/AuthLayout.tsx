"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 sticky top-0 h-screen">
        {/* Animated orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-blue-500/[0.15] blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-violet-500/[0.12] blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute top-[60%] left-[50%] w-[200px] h-[200px] rounded-full bg-emerald-500/[0.08] blur-[80px]" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col w-full p-10">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>bolt</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">ZECB</span>
            </Link>
          </motion.div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.15 }} className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
                  Build profitable SaaS<br />
                  <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">in 72 hours.</span>
                </h1>
                <p className="text-slate-400 mt-4 max-w-sm leading-relaxed">
                  From idea to live product — automated build pipeline, real customers, zero employees.
                </p>
              </div>

              {/* Mini product preview */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease, delay: 0.3 }} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm max-w-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs text-slate-500 font-mono">zecb pipeline</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Schema validation", done: true },
                    { label: "Infrastructure provisioning", done: true },
                    { label: "Data source config", done: true },
                    { label: "Marketing site generation", active: true },
                    { label: "Launch approval", done: false },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${step.done ? "bg-emerald-500/20" : step.active ? "bg-blue-500/20" : "bg-white/5"}`}>
                        {step.done ? <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 12 }}>check</span>
                          : step.active ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="material-symbols-outlined text-blue-400 inline-block" style={{ fontSize: 10 }}>autorenew</motion.span>
                          : <span className="w-1 h-1 rounded-full bg-slate-600" />}
                      </div>
                      <span className={`text-xs ${step.done ? "text-slate-500" : step.active ? "text-blue-300" : "text-slate-600"}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: "0%" }} animate={{ width: "72%" }} transition={{ duration: 2, ease, delay: 0.5 }} className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">Step 8 of 11 · 72%</div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex gap-8">
            {[
              { value: "< 72h", label: "Build time" },
              { value: "€0.50", label: "Per build cost" },
              { value: "11", label: "Automated steps" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-slate-50/50">
        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-6 pb-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>bolt</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">ZECB</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.1 }} className="w-full max-w-[420px]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
              <p className="text-slate-500 mt-2 text-sm">{subtitle}</p>
            </div>
            {children}
            {/* Trust signal */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-100">
              <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 16 }}>lock</span>
              <span className="text-xs text-slate-400">Encrypted & stored in the EU</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
