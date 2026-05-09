"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

import { AuthNav, type AuthNavUser } from "@/components/auth/AuthNav";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
const fadeIn: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, ease } } };
const scaleIn: Variants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } } };
const stagger = (d = 0, s = 0.08): Variants => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });
const inView = { once: true, amount: 0.2 } as const;

export function Landing({ user }: { user: AuthNavUser }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100"
      >
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>bolt</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">ZECB</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <AuthNav user={user} />
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.04),transparent_50%)]" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.1, 0.12)}
          className="relative max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Now with AI-powered idea generation</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Build SaaS products<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">in 72 hours</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            From idea to live product — automated build pipeline, real paying customers, zero employees needed.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 inline-flex items-center justify-center gap-2"
            >
              Start Building Free
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <a
              href="#how-it-works"
              className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors inline-flex items-center justify-center gap-2"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Hero visual */}
          <motion.div variants={scaleIn} className="mt-16 relative">
            <div className="bg-slate-950 rounded-2xl p-1 shadow-2xl shadow-slate-900/20">
              <div className="bg-slate-900 rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-3 text-sm text-slate-500 font-mono">ZECB Build Pipeline</span>
                </div>
                <div className="flex items-center justify-between gap-3 sm:gap-6">
                  {[
                    { icon: "auto_awesome", label: "Idea", sub: "AI Generated", color: "from-violet-500 to-purple-600" },
                    { icon: "edit_note", label: "BuildSpec", sub: "Configured", color: "from-blue-500 to-indigo-600" },
                    { icon: "rocket_launch", label: "Live SaaS", sub: "Deployed", color: "from-emerald-500 to-teal-600" },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3 sm:gap-6 flex-1">
                      <div className="flex-1 text-center">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                          <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>{step.icon}</span>
                        </div>
                        <div className="text-white font-semibold text-sm">{step.label}</div>
                        <div className="text-slate-500 text-xs">{step.sub}</div>
                      </div>
                      {i < 2 && (
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                          className="flex-none"
                        >
                          <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 20 }}>chevron_right</span>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social proof stats */}
      <section className="py-16 px-6 border-y border-slate-100 bg-slate-50/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          variants={stagger(0, 0.1)}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "< 72h", label: "Build Time" },
            { value: "€0.50", label: "Per Build Cost" },
            { value: "11", label: "Automated Steps" },
            { value: "0", label: "Employees Needed" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Building SaaS is broken
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              The old way is slow, expensive, and unpredictable.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.1, 0.1)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "person_search", title: "Hiring takes months", body: "Finding talent is a full-time job. By the time you hire, the window has closed." },
              { icon: "restart_alt", title: "Starting from scratch", body: "Writing auth, billing, and database code from zero wastes your engineering time." },
              { icon: "payments", title: "High burn rate", body: "Salaries consume your budget before you've validated a single feature." },
              { icon: "hub", title: "No distribution", body: "Great products die in silence. Builders spend 99% building, 1% selling." },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: 22 }}>{item.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How it works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Four steps from idea to live product with paying customers.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.1, 0.12)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "auto_awesome", title: "Generate Ideas", body: "Tell the AI your target market. It generates 3 validated business ideas with unit economics.", color: "from-violet-500 to-purple-600" },
              { step: "02", icon: "edit_note", title: "Configure Product", body: "Pick your idea, customize data sources, alert rules, pricing tiers, and branding.", color: "from-blue-500 to-indigo-600" },
              { step: "03", icon: "settings_suggest", title: "Auto Build", body: "The pipeline runs 11 automated steps in ~15 minutes. Schema, infra, UI, tests — everything.", color: "from-cyan-500 to-blue-600" },
              { step: "04", icon: "rocket_launch", title: "Launch & Grow", body: "Approve the launch. Real customers sign up, set alerts, and pay you monthly.", color: "from-emerald-500 to-teal-600" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative">
                <span className="text-xs font-bold text-slate-300 absolute top-4 right-4">STEP {item.step}</span>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>{item.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to ship
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Every product ships with enterprise-grade infrastructure built in.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.05, 0.06)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "group", title: "Multi-tenant", body: "Each product supports unlimited customers with isolated data and plan limits." },
              { icon: "payments", title: "Stripe Billing", body: "Subscriptions, invoices, and customer portal — connected out of the box." },
              { icon: "database", title: "Data Pipelines", body: "7 connector types: API, web scrape, RSS, email, CSV, Sheets, PDF watch." },
              { icon: "notifications_active", title: "Smart Alerts", body: "8 alert types including threshold, change rate, anomaly, and AI semantic match." },
              { icon: "space_dashboard", title: "Customer Dashboard", body: "Every product gets a polished dashboard for your customers to monitor data." },
              { icon: "auto_awesome", title: "AI Workflows", body: "Idea generation, content creation, and outreach — all powered by LLMs." },
              { icon: "verified_user", title: "GDPR Compliant", body: "27 compliance checks, consent ledger, and auto-generated legal pages." },
              { icon: "monitoring", title: "Cost Tracking", body: "Every AI action logged with cost in EUR. Full audit trail for unit economics." },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 22 }}>{f.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500">
              Start free. Scale as you grow.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.1, 0.12)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "€99", tag: "For solo explorers", features: ["1 SaaS product", "Standard templates", "Community support", "Basic analytics"], popular: false },
              { name: "Growth", price: "€299", tag: "For serial builders", features: ["5 SaaS products", "All templates", "Outreach engine", "Priority support", "Custom branding"], popular: true },
              { name: "Scale", price: "€899", tag: "For venture studios", features: ["Unlimited products", "Custom blueprints", "White-label engine", "Dedicated manager", "API access"], popular: false },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.popular
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-800 md:-mt-4 md:-mb-4"
                    : "bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </span>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.tag}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className={`material-symbols-outlined ${plan.popular ? "text-blue-400" : "text-emerald-500"}`} style={{ fontSize: 18 }}>check_circle</span>
                      <span className={plan.popular ? "text-slate-300" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Start Free Trial
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          variants={stagger(0.05, 0.1)}
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 sm:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
          <div className="relative">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to build your first SaaS?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Stop recruiting. Stop managing. Start building the future of software.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-white/10 transition-shadow"
              >
                Launch Your Product
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>bolt</span>
              </div>
              <span className="font-bold text-slate-900">ZECB</span>
            </div>
            <p className="text-slate-500 text-sm text-center md:text-left max-w-xs">
              The autonomous platform for building and scaling SaaS companies without employees.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { label: "Privacy Policy", href: "/legal/datenschutz" },
              { label: "Terms of Service", href: "/legal/agb" },
              { label: "Impressum", href: "/legal/impressum" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="text-slate-500 hover:text-slate-900 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-100 text-center md:text-left">
          <p className="text-slate-400 text-sm">
            © 2026 ZECB — Zero-Employee Company Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
