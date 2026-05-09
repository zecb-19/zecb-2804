"use client";

import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import Link from "next/link";

import { AuthNav, type AuthNavUser } from "@/components/auth/AuthNav";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const fadeIn: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, ease } } };
const scaleIn: Variants = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } } };
const slideLeft: Variants = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } } };
const slideRight: Variants = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } } };
const stagger = (d = 0, s = 0.08): Variants => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });
const inView = { once: true, amount: 0.15 } as const;
const cardSpring = { type: "spring" as const, stiffness: 300, damping: 20 };
const lift = { whileHover: { y: -8, scale: 1.02, transition: cardSpring } };

export function Landing({ user }: { user: AuthNavUser }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Scroll progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 z-[60] origin-left" style={{ scaleX }} />

      {/* Navigation */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease }} className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-900/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>bolt</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">ZECB</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {["Features", "How it Works", "Pricing", "FAQ"].map((item) => (
              <motion.a key={item} whileHover={{ y: -1, color: "#0f172a" }} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="transition-colors">{item}</motion.a>
            ))}
          </div>
          <AuthNav user={user} />
        </div>
      </motion.nav>

      {/* ━━━ HERO ━━━ */}
      <section className="pt-28 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-[15%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.07] blur-[120px]" />
          <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -25, 0], y: [0, 20, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute top-40 right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.05] blur-[100px]" />
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 6 }} className="absolute bottom-0 left-[40%] w-[600px] h-[300px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        </div>
        <motion.div initial="hidden" animate="visible" variants={stagger(0.1, 0.14)} className="relative max-w-5xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100/60 mb-10 shadow-sm">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-700 to-violet-700 bg-clip-text text-transparent">Now with AI-powered idea generation</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-[76px] font-bold text-slate-900 tracking-[-0.03em] leading-[1.05] mb-8">
            Build SaaS products{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">in 72 hours</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            From idea to live product — automated build pipeline, real paying customers, zero employees needed.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/auth/signup" className="bg-gradient-to-b from-slate-800 to-slate-900 text-white px-9 py-4 rounded-2xl text-base font-semibold shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-shadow inline-flex items-center justify-center gap-2.5">
                Start Building Free
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</motion.span>
              </Link>
            </motion.div>
            <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="#how-it-works" className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-base font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all inline-flex items-center justify-center gap-2">
              See How It Works
            </motion.a>
          </motion.div>

          {/* Hero pipeline visual */}
          <motion.div variants={scaleIn} className="mt-20 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-1 shadow-2xl">
              <div className="bg-slate-900 rounded-xl p-6 sm:p-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-4 text-sm text-slate-500 font-mono tracking-wide">zecb build pipeline</span>
                </div>
                <div className="flex items-center justify-between gap-4 sm:gap-8">
                  {[
                    { icon: "auto_awesome", label: "Idea", sub: "AI Generated", color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/30" },
                    { icon: "edit_note", label: "BuildSpec", sub: "Configured", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/30" },
                    { icon: "rocket_launch", label: "Live SaaS", sub: "Deployed", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/30" },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-4 sm:gap-8 flex-1">
                      <motion.div whileHover={{ scale: 1.08, rotate: -3 }} transition={{ type: "spring", stiffness: 300 }} className="flex-1 text-center">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3 shadow-xl ${step.shadow}`}>
                          <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>{step.icon}</span>
                        </div>
                        <div className="text-white font-bold text-sm sm:text-base">{step.label}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{step.sub}</div>
                      </motion.div>
                      {i < 2 && (
                        <div className="flex-none flex flex-col items-center gap-1">
                          <motion.span animate={{ x: [0, 5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }} className="material-symbols-outlined text-blue-400/60" style={{ fontSize: 20 }}>chevron_right</motion.span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_50%)]" />
        <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.12)} className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { value: "< 72h", label: "Build Time", icon: "schedule" },
            { value: "€0.50", label: "Per Build Cost", icon: "savings" },
            { value: "11", label: "Automated Steps", icon: "settings_suggest" },
            { value: "0", label: "Employees Needed", icon: "group_off" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-blue-400" style={{ fontSize: 24 }}>{s.icon}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ━━━ PROBLEM ━━━ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4">The Problem</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Building SaaS is broken</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">The old way is slow, expensive, and unpredictable.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.1, 0.1)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "person_search", title: "Hiring takes months", body: "Finding talent is a full-time job. By the time you hire, the window has closed.", color: "from-red-500 to-rose-600" },
              { icon: "restart_alt", title: "Starting from scratch", body: "Writing auth, billing, and database code from zero wastes your engineering time.", color: "from-orange-500 to-amber-600" },
              { icon: "payments", title: "High burn rate", body: "Salaries consume your budget before you've validated a single feature.", color: "from-rose-500 to-pink-600" },
              { icon: "hub", title: "No distribution", body: "Great products die in silence. Builders spend 99% building, 1% selling.", color: "from-red-600 to-red-700" },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} {...lift} className="relative group cursor-default">
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm`} />
                <div className="relative p-6 bg-white border border-slate-200 rounded-2xl group-hover:border-transparent group-hover:shadow-xl transition-all">
                  <motion.div whileHover={{ rotate: -8, scale: 1.15 }} transition={cardSpring} className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>{item.icon}</span>
                  </motion.div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="py-28 px-6 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.04),transparent_50%)]" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">How It Works</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Four steps to launch</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">From idea to live product with paying customers.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.1, 0.15)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "auto_awesome", title: "Generate Ideas", body: "Tell the AI your target market. It generates 3 validated ideas with unit economics.", color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20" },
              { step: "02", icon: "edit_note", title: "Configure Product", body: "Pick your idea, customize data sources, alert rules, pricing, and branding.", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
              { step: "03", icon: "settings_suggest", title: "Auto Build", body: "11 automated steps in ~15 minutes. Schema, infra, UI, tests — everything.", color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20" },
              { step: "04", icon: "rocket_launch", title: "Launch & Grow", body: "Approve the launch. Real customers sign up, set alerts, and pay you monthly.", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} {...lift} className="relative group cursor-default">
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.color} rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300 blur-sm`} />
                <div className="relative bg-white border border-slate-200 rounded-2xl p-7 group-hover:border-transparent group-hover:shadow-xl transition-all overflow-hidden">
                  <motion.div className="absolute top-4 right-5 text-[72px] font-black text-slate-100 leading-none select-none group-hover:text-slate-200/80 transition-colors" whileHover={{ scale: 1.1, rotate: -5 }}>{item.step}</motion.div>
                  <motion.div whileHover={{ rotate: -6, scale: 1.12 }} transition={cardSpring} className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-xl ${item.shadow} relative`}>
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 26 }}>{item.icon}</span>
                  </motion.div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 relative">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed relative">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4">Features</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Everything you need to ship</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">Enterprise-grade infrastructure, built into every product.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.05, 0.06)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "group", title: "Multi-tenant", body: "Unlimited customers with isolated data and plan limits.", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: "payments", title: "Stripe Billing", body: "Subscriptions, invoices, and customer portal — out of the box.", color: "text-violet-600", bg: "bg-violet-50" },
              { icon: "database", title: "Data Pipelines", body: "7 connectors: API, web scrape, RSS, email, CSV, Sheets, PDF.", color: "text-cyan-600", bg: "bg-cyan-50" },
              { icon: "notifications_active", title: "Smart Alerts", body: "8 alert types: threshold, change rate, anomaly, semantic match.", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: "space_dashboard", title: "Customer Dashboard", body: "Polished monitoring dashboard for your customers.", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: "auto_awesome", title: "AI Workflows", body: "Idea generation, content creation, outreach — all LLM-powered.", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: "verified_user", title: "GDPR Compliant", body: "27 checks, consent ledger, auto-generated legal pages.", color: "text-teal-600", bg: "bg-teal-50" },
              { icon: "monitoring", title: "Cost Tracking", body: "Every AI action logged with cost. Full audit trail.", color: "text-rose-600", bg: "bg-rose-50" },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -6, transition: cardSpring }} className="relative group cursor-default">
                <div className={`absolute -inset-0.5 rounded-2xl ${f.bg} opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-md`} />
                <div className="relative p-6 bg-white border border-slate-200 rounded-2xl group-hover:border-transparent group-hover:shadow-xl transition-all">
                  <motion.div whileHover={{ rotate: -8, scale: 1.15 }} transition={cardSpring} className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
                    <span className={`material-symbols-outlined ${f.color}`} style={{ fontSize: 22 }}>{f.icon}</span>
                  </motion.div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
                  <motion.div className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" initial={false}>
                    <span className={f.color}>Learn more</span>
                    <span className={`material-symbols-outlined ${f.color}`} style={{ fontSize: 14 }}>arrow_forward</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ USE CASES ━━━ */}
      <section className="py-28 px-6 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">Use Cases</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight">What can you build?</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mx-auto">Real monitoring products — each built in under 72 hours.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.08, 0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "shopping_cart", title: "Price Monitor", desc: "Track competitor prices on marketplaces. Alert sellers when prices drop.", tag: "E-Commerce", color: "from-blue-500 to-indigo-600" },
              { icon: "account_balance", title: "Funding Radar", desc: "Monitor funding databases. Alert SMBs when matching grants open.", tag: "Finance", color: "from-emerald-500 to-teal-600" },
              { icon: "gavel", title: "Regulatory Watch", desc: "Track legal changes. Get alerts before compliance deadlines.", tag: "Legal", color: "from-amber-500 to-orange-600" },
              { icon: "local_shipping", title: "Supplier Tracker", desc: "Monitor certifications, ESG disclosures, and delivery performance.", tag: "Supply Chain", color: "from-violet-500 to-purple-600" },
              { icon: "trending_up", title: "SEO Rank Tracker", desc: "Track rankings. Alert on position changes and competitor moves.", tag: "Marketing", color: "from-cyan-500 to-blue-600" },
              { icon: "description", title: "Contract Watcher", desc: "Extract dates from contracts. Alert before renewals expire.", tag: "Operations", color: "from-rose-500 to-pink-600" },
            ].map((uc) => (
              <motion.div key={uc.title} variants={fadeUp} whileHover={{ y: -8, scale: 1.03, transition: cardSpring }} className="relative group cursor-default">
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${uc.color} rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm`} />
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div whileHover={{ rotate: -6, scale: 1.12 }} transition={cardSpring} className={`w-11 h-11 rounded-xl bg-gradient-to-br ${uc.color} flex items-center justify-center shadow-lg`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>{uc.icon}</span>
                    </motion.div>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium group-hover:bg-white/20 transition-colors">{uc.tag}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{uc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{uc.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Build this <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ PRODUCT SCREENS ━━━ */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(139,92,246,0.05),transparent_50%)]" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider mb-4">Product Tour</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 mb-5 tracking-tight">See it in action</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">Every step designed for speed and clarity.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.12, 0.15)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 01 — Idea Generation */}
            <motion.div variants={scaleIn} className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-8 overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[48px] font-black text-white/5 leading-none">01</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>auto_awesome</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-xl mb-2">AI Idea Generation</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">3 validated ideas with unit economics and pricing.</p>
                <div className="space-y-2 mt-auto">
                  {["Price Monitor for Amazon Sellers", "Funding Radar for SMBs", "Supplier Compliance Watch"].map((idea, i) => (
                    <div key={idea} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-500"}`}>{i + 1}</div>
                      <span className="text-sm text-slate-300 flex-1">{idea}</span>
                      <span className="text-xs text-slate-500 font-mono">€{[49, 29, 39][i]}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Step 02 — BuildSpec */}
            <motion.div variants={scaleIn} className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-8 overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[48px] font-black text-white/5 leading-none">02</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>edit_note</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-xl mb-2">BuildSpec Configuration</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">Configure every aspect of your product.</p>
                <div className="space-y-2.5 mt-auto">
                  {[
                    { label: "Data Sources", value: "HTTP API, Web Scrape", icon: "database" },
                    { label: "Alert Rules", value: "Threshold, Change Rate", icon: "tune" },
                    { label: "Pricing", value: "Free / €19 / €49", icon: "payments" },
                    { label: "Channels", value: "Email, Slack, Webhook", icon: "notifications" },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <span className="material-symbols-outlined text-blue-400/60" style={{ fontSize: 16 }}>{field.icon}</span>
                      <span className="text-xs text-slate-500 w-20">{field.label}</span>
                      <span className="text-xs text-slate-300 font-mono">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Step 03 — Build Pipeline */}
            <motion.div variants={scaleIn} className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-8 overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[48px] font-black text-white/5 leading-none">03</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>rocket_launch</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-xl mb-2">Automated Build Pipeline</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">11 steps, ~15 minutes, fully automated.</p>
                <div className="space-y-1.5 mt-auto">
                  {[
                    { label: "Schema validation", done: true },
                    { label: "Infrastructure", done: true },
                    { label: "Data source config", done: true },
                    { label: "Alert wiring", active: true },
                    { label: "Marketing site", done: false },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2.5 py-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.done ? "bg-emerald-500/20" : step.active ? "bg-cyan-500/20" : "bg-white/5"}`}>
                        {step.done ? <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 14 }}>check</span>
                          : step.active ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="material-symbols-outlined text-cyan-400 inline-block" style={{ fontSize: 12 }}>autorenew</motion.span>
                          : <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                      </div>
                      <span className={`text-xs ${step.done ? "text-slate-400" : step.active ? "text-cyan-300 font-medium" : "text-slate-600"}`}>{step.label}</span>
                    </div>
                  ))}
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: "0%" }} whileInView={{ width: "65%" }} viewport={{ once: true }} transition={{ duration: 1.5, ease }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Step 7 of 11 · 65%</div>
                </div>
              </div>
            </motion.div>

            {/* Step 04 — Customer Dashboard */}
            <motion.div variants={scaleIn} className="group relative h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-8 overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[48px] font-black text-white/5 leading-none">04</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>space_dashboard</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-xl mb-2">Live Customer Dashboard</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">Your customers monitor data and get alerts.</p>
                <div className="grid grid-cols-3 gap-2 mb-3 mt-auto">
                  {[
                    { label: "Sources", val: "3", color: "text-blue-400" },
                    { label: "Rules", val: "7", color: "text-violet-400" },
                    { label: "Alerts", val: "12", color: "text-amber-400" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-center">
                      <div className={`text-lg font-bold ${kpi.color}`}>{kpi.val}</div>
                      <div className="text-[10px] text-slate-500">{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[
                    { rule: "Price drop > 10%", status: "triggered", time: "2m ago" },
                    { rule: "New competitor listing", status: "watching", time: "15m ago" },
                    { rule: "Supplier cert expired", status: "triggered", time: "1h ago" },
                  ].map((alert) => (
                    <div key={alert.rule} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
                      <span className={`w-1.5 h-1.5 rounded-full ${alert.status === "triggered" ? "bg-amber-400" : "bg-emerald-400"}`} />
                      <span className="text-xs text-slate-300 flex-1">{alert.rule}</span>
                      <span className="text-[10px] text-slate-500">{alert.time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                  <span className="text-[10px] text-slate-500">Last check: 30s ago</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Live</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ COMPARISON ━━━ */}
      <section className="py-28 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">Comparison</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Why ZECB?</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={scaleIn}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="grid grid-cols-4 text-sm font-bold border-b border-slate-100">
                <div className="p-5 text-slate-400"></div>
                <div className="p-5 text-slate-400 text-center">Hire a Team</div>
                <div className="p-5 text-slate-400 text-center">No-Code</div>
                <div className="p-5 text-center bg-gradient-to-b from-slate-900 to-slate-800 text-white">ZECB</div>
              </div>
              {[
                { label: "Time to launch", old: "3-6 months", nocode: "2-4 weeks", zecb: "72 hours" },
                { label: "Upfront cost", old: "€50,000+", nocode: "€500-2k", zecb: "€0.50" },
                { label: "Monthly cost", old: "€15,000+", nocode: "€200-500", zecb: "€99-299" },
                { label: "AI-powered ideas", old: "No", nocode: "No", zecb: "Yes" },
                { label: "Auto marketing", old: "No", nocode: "No", zecb: "Yes" },
                { label: "GDPR compliance", old: "Manual", nocode: "Partial", zecb: "Built-in" },
                { label: "Employees needed", old: "3-10", nocode: "0-1", zecb: "0" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-4 text-sm ${i < 6 ? "border-b border-slate-50" : ""} hover:bg-blue-50/30 transition-colors group/row`}>
                  <div className="p-4 font-medium text-slate-900">{row.label}</div>
                  <div className="p-4 text-slate-400 text-center">{row.old}</div>
                  <div className="p-4 text-slate-400 text-center">{row.nocode}</div>
                  <div className="p-4 text-center bg-blue-50/50 font-bold text-slate-900 group-hover/row:bg-blue-100/60 transition-colors">{row.zecb}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ INTEGRATIONS ━━━ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-14">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">Integrations</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Works with your stack</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.03, 0.06)} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Stripe", icon: "payments" }, { name: "Slack", icon: "chat" }, { name: "SendGrid", icon: "forward_to_inbox" }, { name: "Postmark", icon: "mark_email_read" },
              { name: "Zapier", icon: "bolt" }, { name: "Make", icon: "settings_suggest" }, { name: "n8n", icon: "hub" }, { name: "Google", icon: "cloud" },
            ].map((int) => (
              <motion.div key={int.name} variants={fadeUp} whileHover={{ y: -4, scale: 1.05 }} className="flex flex-col items-center gap-2.5 p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all cursor-default">
                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 24 }}>{int.icon}</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{int.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ TRUST ━━━ */}
      <section className="py-28 px-6 bg-gradient-to-b from-emerald-950 to-slate-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-14">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">Security</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Enterprise-grade security</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-400">Built for the EU market with compliance at the core.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.05, 0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "shield", title: "GDPR / DSGVO", desc: "27 compliance checks, consent ledger, data portability, right to erasure." },
              { icon: "lock", title: "Encrypted", desc: "AES-256 at rest. Secrets via env vars, never logged." },
              { icon: "cloud", title: "EU Residency", desc: "PostgreSQL on AWS eu-north-1. Data never leaves Europe." },
              { icon: "verified_user", title: "Audit Trail", desc: "Every AI action logged with cost, model, and I/O." },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} whileHover={{ y: -8, scale: 1.04, transition: cardSpring }} className="relative group cursor-default">
                <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center group-hover:bg-white/[0.08] group-hover:border-emerald-500/30 transition-all backdrop-blur-sm">
                  <motion.div whileHover={{ rotate: 12, scale: 1.15 }} transition={cardSpring} className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                    <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 26 }}>{item.icon}</span>
                  </motion.div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section id="faq" className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-14">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4">FAQ</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">Questions? Answered.</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.04, 0.06)} className="space-y-3">
            {[
              { q: "Do I need coding skills?", a: "No. ZECB handles everything — from idea validation to a live product with paying customers. You configure via forms, not code." },
              { q: "How does the 72-hour build work?", a: "The Build Orchestrator runs 11 automated steps: schema validation, infrastructure, data connectors, alert wiring, onboarding UI, marketing site, and tests. You approve at step 11." },
              { q: "Is my data safe?", a: "Yes. All data is encrypted at rest, stored on AWS in the EU (eu-north-1), and never leaves Europe. We have 27 built-in GDPR compliance checks." },
              { q: "Can I cancel anytime?", a: "Absolutely. No lock-in contracts. Cancel from your Settings page and your subscription ends at the current billing period." },
              { q: "What happens to my products if I cancel?", a: "Your live products continue running. You lose access to the build engine and outreach tools, but existing customers aren't affected." },
              { q: "How much does the AI cost?", a: "Idea generation ~€0.05, full product build ~€0.50. Every AI action is logged with its exact cost in the Audit Trail." },
              { q: "Can my customers pay me?", a: "Yes. Every product ships with Stripe integration. Your customers subscribe directly to your pricing tiers." },
              { q: "What products can I build?", a: "Currently: Monitoring-SaaS — price trackers, compliance monitors, funding radars, and more. Workflow Automation and Data Enrichment templates coming in V2." },
            ].map((faq) => (
              <motion.details key={faq.q} variants={fadeUp} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <span className="font-semibold text-slate-900 pr-6 group-hover:text-blue-700 transition-colors">{faq.q}</span>
                  <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 group-open:bg-blue-100 flex items-center justify-center transition-colors flex-none">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-open:text-blue-600 group-open:rotate-45 transition-all duration-300" style={{ fontSize: 18 }}>add</span>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed -mt-1">{faq.a}</div>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section id="pricing" className="py-28 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0, 0.1)} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider mb-4">Pricing</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Simple, transparent pricing</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500">Start free. Scale as you grow.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.1, 0.15)} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {[
              { name: "Starter", price: "€99", tag: "For solo explorers", features: ["1 SaaS product", "Standard templates", "Community support", "Basic analytics"], popular: false },
              { name: "Growth", price: "€299", tag: "For serial builders", features: ["5 SaaS products", "All templates", "Outreach engine", "Priority support", "Custom branding"], popular: true },
              { name: "Scale", price: "€899", tag: "For venture studios", features: ["Unlimited products", "Custom blueprints", "White-label engine", "Dedicated manager", "API access"], popular: false },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeUp} whileHover={{ y: -10, scale: plan.popular ? 1.03 : 1.04, transition: cardSpring }} className={`rounded-2xl p-8 flex flex-col relative cursor-default group ${
                plan.popular
                  ? "bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 md:-my-6 md:py-12 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] transition-shadow"
                  : "bg-white border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              }`}>
                {plan.popular && (
                  <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-xl shadow-blue-500/30">
                    MOST POPULAR
                  </motion.span>
                )}
                <div className="mb-8">
                  <h3 className={`text-xl font-bold mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.tag}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                </div>
                <ul className="space-y-3.5 mb-10 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className={`material-symbols-outlined ${plan.popular ? "text-blue-400" : "text-emerald-500"}`} style={{ fontSize: 18 }}>check_circle</span>
                      <span className={plan.popular ? "text-slate-300" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/auth/signup" className={`block text-center py-4 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-white text-slate-900 hover:shadow-xl hover:shadow-white/10"
                      : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10"
                  }`}>
                    Start Free Trial
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section className="py-28 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.05, 0.12)} className="max-w-4xl mx-auto text-center relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-blue-500/10 rounded-[2rem] blur-3xl" />
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-14 sm:p-20 overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/15 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
            <div className="relative">
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Ready to build your first SaaS?</motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">Stop recruiting. Stop managing. Start building the future of software.</motion.p>
              <motion.div variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Link href="/auth/signup" className="inline-flex items-center gap-2.5 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-white/10 hover:shadow-white/20 transition-shadow">
                    Launch Your Product
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_forward</motion.span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>bolt</span>
              </div>
              <span className="font-bold text-slate-900">ZECB</span>
            </div>
            <p className="text-slate-500 text-sm text-center md:text-left max-w-xs">Build and scale SaaS companies without employees.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { label: "Privacy Policy", href: "/legal/datenschutz" },
              { label: "Terms of Service", href: "/legal/agb" },
              { label: "Impressum", href: "/legal/impressum" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="text-slate-400 hover:text-slate-900 transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-50 text-center md:text-left">
          <p className="text-slate-300 text-sm">© 2026 ZECB — Zero-Employee Company Builder</p>
        </div>
      </footer>
    </div>
  );
}
