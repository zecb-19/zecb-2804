/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeOut } },
};

const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: easeOut } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOut } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOut } },
};

const buttonHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.2, ease: easeOut } },
  whileTap: { scale: 0.96 },
};

const cardHover = {
  whileHover: { y: -4, transition: { duration: 0.25, ease: easeOut } },
};

const inViewOnce = { once: true, amount: 0.2 } as const;

export default function Home() {
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(heroProgress, [0, 1], [0, 80]);
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0.4]);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-0.5 bg-secondary z-[60] origin-left"
        style={{ scaleX: progressScaleX }}
      />

      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-variant shadow-sm"
      >
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto font-body-md">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
            className="text-xl font-bold tracking-tight text-primary"
          >
            Zero-Employee
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0.2, 0.06)}
            className="hidden md:flex items-center gap-8 text-sm font-medium"
          >
            {[
              { label: "Features", active: true },
              { label: "How it Works" },
              { label: "Templates" },
              { label: "Pricing" },
            ].map((item) => (
              <motion.a
                key={item.label}
                variants={fadeUp}
                href="#"
                className={
                  item.active
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary transition-colors"
                }
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0.3, 0.08)}
            className="flex items-center gap-4"
          >
            <motion.button
              variants={fadeUp}
              {...buttonHover}
              type="button"
              className="text-sm font-semibold text-on-surface hover:text-primary transition-colors"
            >
              Log In
            </motion.button>
            <motion.button
              variants={fadeUp}
              {...buttonHover}
              type="button"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <motion.div
          ref={heroRef}
          style={{ y: heroParallaxY, opacity: heroFade }}
          initial="hidden"
          animate="visible"
          variants={stagger(0.1, 0.12)}
          className="max-w-7xl mx-auto flex flex-col items-center text-center"
        >
          <motion.span
            variants={fadeUp}
            className="px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm mb-6 uppercase tracking-widest font-bold"
          >
            Launch faster than ever
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="font-display text-display max-w-4xl text-primary mb-6"
          >
            Build Profitable SaaS Products in 72 Hours — Without Hiring a Team
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10"
          >
            Deploy fully-functional, scalable SaaS businesses using our
            pre-architected engine. No recruiters, no management, just
            code-driven growth.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-16">
            <motion.button
              {...buttonHover}
              type="button"
              className="bg-primary text-on-primary px-8 py-4 rounded-xl text-body-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Start Building
            </motion.button>
            <motion.button
              {...buttonHover}
              type="button"
              className="bg-surface-container-lowest border border-surface-variant text-primary px-8 py-4 rounded-xl text-body-lg font-semibold hover:bg-surface-container-low transition-colors"
            >
              See How It Works
            </motion.button>
          </motion.div>

          {/* Hero Visual: System Diagram */}
          <motion.div
            variants={scaleIn}
            className="w-full relative max-w-5xl bg-white border border-surface-variant rounded-xl p-8 soft-shadow overflow-hidden"
          >
            <motion.div
              variants={stagger(0.1, 0.15)}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              className="flex items-center justify-between gap-4"
            >
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex-1 p-6 border border-surface-variant rounded-lg bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">
                  dashboard_customize
                </span>
                <div className="font-h3 text-h3 mb-2">Templates</div>
                <div className="text-label-sm text-on-surface-variant">
                  Validated Logic
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="flex-none">
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="material-symbols-outlined text-surface-variant text-4xl inline-block"
                >
                  trending_flat
                </motion.span>
              </motion.div>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex-1 p-6 border-2 border-secondary rounded-lg bg-secondary-fixed shadow-md"
              >
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">
                  settings_suggest
                </span>
                <div className="font-h3 text-h3 mb-2">Build Engine</div>
                <div className="text-label-sm text-on-secondary-fixed-variant">
                  Automated Assembly
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="flex-none">
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="material-symbols-outlined text-surface-variant text-4xl inline-block"
                >
                  trending_flat
                </motion.span>
              </motion.div>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex-1 p-6 border border-surface-variant rounded-lg bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">
                  rocket_launch
                </span>
                <div className="font-h3 text-h3 mb-2">Live SaaS</div>
                <div className="text-label-sm text-on-surface-variant">
                  Production Ready
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
              className="mt-8 border-t border-surface-variant pt-8"
            >
              <img
                alt="Dashboard"
                className="rounded-lg shadow-inner w-full h-64 object-cover object-top"
                data-alt="clean minimalist dashboard interface showing revenue charts and user activity metrics with a soft professional aesthetic"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfqIFm316Ubhf1r_8jNQhnMayQWp-iAMG5cS1dXq_Tb7EQfR8zT8DiB8U87U0qIRJQehJfSkJXcXCkqm6TealKi23zqRZHTMJ4FdlhfNTR73Ww4rpbgEDjJgdXH7fCe8KgySD4UNi71vuojF0ltkW1X2P5UmqI2L2Ni4uDLATiq1DtoNDSdECh8RTgAN7lbt8bayNWpUnDQHPJ_R9-YJFDlfWgd8027kVqDpPG8shuTKjI6Ovni_sZ_x3uneJZxSJAzzc6sLTw73g"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-surface-container-low px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0, 0.1)}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="font-h1 text-h1 text-primary mb-4"
            >
              Building SaaS Is Slow, Expensive, and Unpredictable
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="font-body-lg text-body-lg text-on-surface-variant"
            >
              The old way of starting a tech company is broken.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.1, 0.1)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: "person_search",
                title: "Hiring takes months",
                body: "Finding the right talent is a full-time job. By the time you hire, the window of opportunity has closed.",
              },
              {
                icon: "restart_alt",
                title: "Starting from scratch",
                body: "Writing boilerplate code for auth, billing, and databases is a waste of your engineering capital.",
              },
              {
                icon: "payments",
                title: "High burn costs",
                body: "Salaries and overhead consume your budget before you've even validated your first feature.",
              },
              {
                icon: "hub",
                title: "No distribution",
                body: "Great products die in silence. Most builders spend 99% of time building and 1% of time selling.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                {...cardHover}
                className="p-8 bg-white border border-surface-variant rounded-xl"
              >
                <span className="material-symbols-outlined text-error text-3xl mb-4">
                  {item.icon}
                </span>
                <h3 className="font-h3 text-h3 mb-3">{item.title}</h3>
                <p className="text-on-surface-variant text-body-md">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              variants={stagger(0, 0.1)}
            >
              <motion.h2
                variants={slideRight}
                className="font-h1 text-h1 text-primary mb-6"
              >
                A New Way to Build Companies
              </motion.h2>
              <motion.p
                variants={slideRight}
                className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed"
              >
                We&apos;ve decoupled the company-building process. Instead of
                managing people, you manage configurations. Our engine handles
                the infrastructure, architecture, and deployment automatically.
              </motion.p>
              <motion.div variants={stagger(0.1, 0.12)} className="space-y-6">
                {[
                  {
                    n: 1,
                    title: "Select Business Model",
                    body: "Choose from 12+ pre-validated architectural blueprints.",
                  },
                  {
                    n: 2,
                    title: "Custom Configuration",
                    body: "Define your unique logic and branding parameters.",
                  },
                  {
                    n: 3,
                    title: "Automated Launch",
                    body: "Push to production with a fully integrated marketing engine.",
                  },
                ].map((step) => (
                  <motion.div key={step.n} variants={fadeUp} className="flex gap-4">
                    <div className="flex-none w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                      {step.n}
                    </div>
                    <div>
                      <p className="font-h3 text-h3">{step.title}</p>
                      <p className="text-on-surface-variant">{step.body}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              variants={slideLeft}
              className="relative"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-64 h-64 bg-secondary-fixed rounded-full filter blur-3xl"
              />
              <div className="bg-white border border-surface-variant p-2 rounded-xl soft-shadow relative z-10">
                <img
                  alt="Process diagram"
                  className="rounded-lg w-full h-[450px] object-cover"
                  data-alt="high-tech futuristic control interface with glowing data lines and interconnected nodes representing a complex automated process"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOFCIlr73oYd4WWlAkzCUiRn7wDhZLa-q5FTkwrQ6N7Yp0FJwCwT7Zm8qFuCcTmcvhdE2Cv1nPKoqraO_70jP31Xp_-WTeBsRzbV9_F4C865rKRxYgLV77faZgL_EF94WwbVrflCXPcy6lyp4a5g8F9xEflI10Qm_VTK5x1M5sgQKuU21QqkK4dHN-GTy-jKEdGr2D5FWojMl2SJcpqd0Mhip1QJvVFv4qZuKZCuEoSO88yReOHyhCsP7L9e200r_UwyS3YDz7cEk"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works (Stepper) */}
      <section className="py-24 bg-surface px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={fadeUp}
            className="font-h1 text-h1 text-center mb-16"
          >
            How It Works
          </motion.h2>
          <div className="relative">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={inViewOnce}
              transition={{ duration: 1.1, ease: easeOut, delay: 0.2 }}
              className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-surface-variant origin-left"
            />
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              variants={stagger(0.3, 0.18)}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
            >
              {[
                {
                  icon: "lightbulb",
                  title: "Define Idea",
                  body: "Input your niche and core value proposition into the builder.",
                  emphasis: false,
                },
                {
                  icon: "tune",
                  title: "Configure Template",
                  body: "Pick a technical foundation tailored to your business model.",
                  emphasis: false,
                },
                {
                  icon: "auto_fix_high",
                  title: "Auto Build",
                  body: "Our engine compiles the code, sets up DBs, and configures API gateways.",
                  emphasis: true,
                },
                {
                  icon: "send",
                  title: "Launch",
                  body: "Go live in under 72 hours with a fully functional SaaS business.",
                  emphasis: false,
                },
              ].map((step) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  className="relative z-10 text-center flex flex-col items-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className={
                      step.emphasis
                        ? "w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center mb-6 shadow-md border-4 border-white"
                        : "w-24 h-24 rounded-full bg-white border-4 border-surface-variant flex items-center justify-center mb-6 shadow-sm"
                    }
                  >
                    <span
                      className={
                        step.emphasis
                          ? "material-symbols-outlined text-on-secondary-container text-3xl"
                          : "material-symbols-outlined text-primary text-3xl"
                      }
                    >
                      {step.icon}
                    </span>
                  </motion.div>
                  <h4 className="font-h3 text-h3 mb-2">{step.title}</h4>
                  <p className="text-on-surface-variant text-body-md">{step.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Template System */}
      <section className="py-24 px-6 bg-surface-container-low">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          variants={stagger(0, 0.1)}
          className="max-w-7xl mx-auto text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            className="font-h1 text-h1 text-primary mb-4"
          >
            Templates That Build Real Businesses
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-body-lg text-body-lg text-on-surface-variant"
          >
            Not just UI kits—complete technical backbones for commercial apps.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          variants={stagger(0.1, 0.12)}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {[
            {
              alt: "Monitoring SaaS",
              src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2oUY7lC5M4Xw8MtFAZzrjdwDVlPCuj9cyiylRHVAVD1ylF0pF_hgYUGkKkJFxRVXQ3cMZxW4ERzEDXv8Nek6uKUgUIfzO-UlG9375Gm9vzbVLdpFybUndZoTL0hFgD0Yzp1f9MD6JfEi9CXtfNQUuPiSYit5O3MZZcxbP_fV1tFi0yERWpQcC6l9d4qDhVy9SsArWjpoh7yHiBJ7f8N9tHWYHqnYkORSokkeOG4LsVfjhzpgaGFtqCGCRHSrJS_mbjLaGzA0_poE",
              title: "Monitoring SaaS",
              tag: "POPULAR",
              body: "Real-time tracking for websites, APIs, or physical assets. Includes alerting and multi-tenant teams.",
            },
            {
              alt: "Workflow Automation",
              src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBItIKy5cA9oT0PyzPzUBApR8PZMhM1G_eJv_ezjmuNndpd5F8d0_2QecD1jK4Z5I2YrW3DanKj0n7hjGLEYTEE4Hiu1XaJvjib3_iN_ongThuXoSCHtwOy1-aq2q60SbtzQmsuhd_TE0L5o-UhueIIf0JkDZd8egkORlUU81DdD5ZJRfP5TV2TJHbGp5b8W8kUj_5nNzT1xaT8TUUBcWto2Y2Wg_cAp9WrqzJbWd5ghsw3SnKaNa07Y7I5k7voGaERLq9-B2sVsjY",
              title: "Workflow Automation",
              body: "Visual drag-and-drop builder logic with a powerful backend execution engine for repetitive tasks.",
            },
            {
              alt: "Data API",
              src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxZR1QX9ggKkAWjwLirJfhISciR1OeqYKH2zyp6pxTDGZk7MPjLHBWUevX96xdtef40t9VhR6KoBFe0SCkeHsr9beYk2skJJx6d7kkA2bRvnfS8A2tPU_y60gxArpWf74n_PUbiCfg5v3HMu6GDktkIww71aKU-iWEMxm032TrHtC7NgoAc5x9F_lOBmytpK_SKTfOEUN0gCtv5-QTU3aZqqdG6mv8mPtrnI0tJu0Jzcsn9Voc3_Axc4NtHnFZcmAyBVZEjDZ5bgM",
              title: "Data API",
              body: "Build a data-as-a-service business with rate limiting, subscription tiers, and developer portals.",
            },
            {
              alt: "Dashboard & Reporting",
              src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6jB_R6jEUip2xY2b7B9SQbjK9ODnnn7LWvGQlLim_-C88twnHtRsMK2P5dAeA1qGK65dnMuOcVuOkD2H_7xuz0mamH0FwzWj-ItEXYi-raJyuNHnLyrZgTNNVgAotwWwlMhs2vK75T5-hTJg8BChPG7VVzPrOrSQLQqMwQx_0A2IArmpQPsPOO56tDuOXTntuO8lLcQpZrO6D4qnry18Yr4adVqoGJ7uap6G1W4HUzzTUaRmeHeO863uHkxSxoJcx2aD6Lax1eao",
              title: "Dashboard & Reporting",
              body: "Turn raw data into beautiful, customer-facing insights with scheduled PDF reports and exports.",
            },
          ].map((tpl) => (
            <motion.div
              key={tpl.title}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group bg-white rounded-xl overflow-hidden border border-surface-variant soft-shadow hover:shadow-xl transition-shadow"
            >
              <div className="h-48 overflow-hidden">
                <img
                  alt={tpl.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={tpl.src}
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-h2 text-h2">{tpl.title}</h3>
                  {tpl.tag && (
                    <span className="px-3 py-1 rounded bg-surface-container text-label-sm font-bold">
                      {tpl.tag}
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant mb-6">{tpl.body}</p>
                <button
                  type="button"
                  className="text-secondary font-bold flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Preview Architecture{" "}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={fadeUp}
            className="font-h1 text-h1 text-center mb-16"
          >
            Enterprise Features Built-In
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.05, 0.07)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8"
          >
            {[
              {
                icon: "groups",
                title: "Multi-tenant",
                body: "Isolated data environments for every customer with team management.",
              },
              {
                icon: "credit_card",
                title: "Billing",
                body: "Stripe-integrated subscriptions, credits, and metered billing logic.",
              },
              {
                icon: "data_object",
                title: "Data pipelines",
                body: "Automated ETL processes to handle massive data ingestions easily.",
              },
              {
                icon: "notifications_active",
                title: "Alerts",
                body: "Email, Slack, and SMS notification systems out of the box.",
              },
              {
                icon: "admin_panel_settings",
                title: "Admin dashboard",
                body: "Manage your users, support tickets, and system health in one view.",
              },
              {
                icon: "psychology",
                title: "AI workflows",
                body: "Integrated LLM hooks for automated content and decision making.",
              },
              {
                icon: "bar_chart",
                title: "Reporting",
                body: "Advanced visualization and export tools for business intelligence.",
              },
              {
                icon: "security",
                title: "Security",
                body: "SOC2-ready architecture with encrypted storage and MFA.",
              },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="flex flex-col gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-primary">
                    {f.icon}
                  </span>
                </motion.div>
                <h4 className="font-h3 text-h3">{f.title}</h4>
                <p className="text-on-surface-variant text-body-md">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Outreach Engine */}
      <section className="py-24 bg-primary text-on-primary px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              variants={stagger(0.1, 0.18)}
              className="relative order-2 lg:order-1"
            >
              <div className="flex flex-col items-center gap-4">
                {[
                  {
                    width: "w-full",
                    label: "Traffic",
                    detail: "Search, Ads, Social",
                    accent: false,
                  },
                  {
                    width: "w-[90%]",
                    label: "Signup",
                    detail: "72% Conversion",
                    accent: false,
                  },
                  {
                    width: "w-[80%]",
                    label: "Activation",
                    detail: "3min Time-to-Value",
                    accent: false,
                  },
                  {
                    width: "w-[70%]",
                    label: "Revenue",
                    detail: "MRR GROWTH",
                    accent: true,
                  },
                ].flatMap((row, i, arr) => {
                  const items = [
                    <motion.div
                      key={`${row.label}-row`}
                      variants={fadeUp}
                      className={
                        row.accent
                          ? `${row.width} max-w-sm h-24 bg-secondary rounded-xl flex items-center justify-between px-8 shadow-xl`
                          : `${row.width} max-w-sm h-24 bg-white/10 rounded-xl flex items-center justify-between px-8 border border-white/20`
                      }
                    >
                      <span className="text-body-lg font-bold">{row.label}</span>
                      {row.accent ? (
                        <span className="text-label-sm bg-white/20 px-2 py-1 rounded">
                          {row.detail}
                        </span>
                      ) : (
                        <span className="text-body-md text-white/60">{row.detail}</span>
                      )}
                    </motion.div>,
                  ];
                  if (i < arr.length - 1) {
                    items.push(
                      <motion.div
                        key={`${row.label}-arrow`}
                        variants={fadeIn}
                        className="leading-none"
                      >
                        <motion.span
                          animate={{ y: [0, 4, 0] }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2,
                          }}
                          className="material-symbols-outlined text-white/40 inline-block"
                        >
                          expand_more
                        </motion.span>
                      </motion.div>
                    );
                  }
                  return items;
                })}
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              variants={stagger(0, 0.08)}
              className="order-1 lg:order-2"
            >
              <motion.h2 variants={slideLeft} className="font-h1 text-h1 mb-6">
                Not Just Build — We Get You Users
              </motion.h2>
              <motion.p
                variants={slideLeft}
                className="font-body-lg text-body-lg text-white/70 mb-8"
              >
                A product without users is just code. Our built-in outreach
                engine connects directly to LinkedIn, Twitter, and Search Ad
                networks to drive high-intent traffic to your new SaaS from
                minute one.
              </motion.p>
              <motion.ul variants={stagger(0.1, 0.1)} className="space-y-4">
                {[
                  "Automated SEO Landing Pages",
                  "Cold Email & Social Outreach Bots",
                  "Performance Marketing Dashboards",
                ].map((item) => (
                  <motion.li
                    key={item}
                    variants={slideLeft}
                    className="flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-secondary">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.05, 0.12)}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {[
              { stat: "< 72h", label: "Build time" },
              { stat: "< €500", label: "Startup cost" },
              { stat: "< 2min", label: "Time to value" },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={scaleIn}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="text-center p-8 border border-surface-variant rounded-xl bg-white"
              >
                <div className="font-display text-display text-primary mb-2">
                  {s.stat}
                </div>
                <div className="font-h3 text-h3 text-on-surface-variant">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.1, 0.15)}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_mwf921RmIPgooCCq4ZzOQMrI07-ct_UhjAAkjfZx1M0SBPaQlDqgeLLYflP_tkVURxdR2vTIs3GMDe3Huc0C1OB0sPC8n1RET7K5V15jlydRsrTtc4e2khbg26XWIfTOZhDU-niTYJHUK56YBXvKxm-MpYwJV9CTwjsRGHelBlIGR7LkrXeDlJDANpZyvv-OTw-VyH4gjNaRBf2YGBqj-7g8uce3AHjB1B6dNKrkiHdmJr_EQJRyHSdTUf6gYKkuxVHXv6TJ-N8",
                name: "David Chen",
                title: "Founder, LogiFlow",
                quote:
                  "I went from zero code to a revenue-generating workflow tool in exactly three days. The distribution engine alone is worth the subscription.",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9ylaBjiyBNqh7uh-9ck49Pb6XBhuRpUETq466_lwPP2Qd6lcYLJuhHgsaMZtjq_NK0FypXr7LqPimQyhuLJjTa-5W2Skq6DYZ-pG34qoSGoO30NkpdqdqNVKSgDjNyGUcfnIxw1hkU5hU-3b0y__CB5ZvunSoVLHGjQZLBfNfTTunX2bBsqArW7wIMViubABcl72_0ncGH1ymP68gKsGY0GOzD3cf_yKnVTbQXvgNHBRGxluaiE1XQ3qMeO7SjvioAGzr6kq6AqU",
                name: "Sarah Miller",
                title: "Solopreneur",
                quote:
                  "Zero-Employee isn't just a builder, it's an entire company infrastructure. It handles everything I used to pay freelancers for.",
              },
            ].map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="p-8 bg-surface-container-low rounded-xl border border-surface-variant"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img alt="User" className="w-12 h-12 rounded-full" src={t.src} />
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{t.title}</p>
                  </div>
                </div>
                <p className="font-body-lg text-body-lg italic">&ldquo;{t.quote}&rdquo;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0, 0.1)}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-h1 text-h1 text-primary mb-4">
              Transparent Pricing
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="font-body-lg text-body-lg text-on-surface-variant"
            >
              Scale your company building as you grow your revenue.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.1, 0.15)}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Starter",
                tag: "For solo explorers.",
                price: "€99",
                features: ["1 SaaS Project", "Standard Templates", "Community Support"],
                popular: false,
              },
              {
                name: "Growth",
                tag: "For serial builders.",
                price: "€299",
                features: [
                  "5 SaaS Projects",
                  "All Templates",
                  "Outreach Engine",
                  "Priority Support",
                ],
                popular: true,
              },
              {
                name: "Scale",
                tag: "For venture studios.",
                price: "€899",
                features: [
                  "Unlimited SaaS Projects",
                  "Custom Blueprints",
                  "White-label Engine",
                  "Dedicated Success Manager",
                ],
                popular: false,
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className={
                  plan.popular
                    ? "bg-white border-2 border-primary rounded-xl p-8 flex flex-col relative shadow-xl md:scale-105"
                    : "bg-white border border-surface-variant rounded-xl p-8 flex flex-col hover:border-primary transition-colors"
                }
              >
                {plan.popular && (
                  <motion.span
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={inViewOnce}
                    transition={{ delay: 0.5, duration: 0.4, ease: easeOut }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-label-sm font-bold"
                  >
                    MOST POPULAR
                  </motion.span>
                )}
                <div className="mb-8">
                  <h3 className="font-h2 text-h2 mb-2">{plan.name}</h3>
                  <p className="text-on-surface-variant">{plan.tag}</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        check
                      </span>{" "}
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.button
                  {...buttonHover}
                  type="button"
                  className={
                    plan.popular
                      ? "w-full py-4 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
                      : "w-full py-4 rounded-xl bg-surface-container text-primary font-bold hover:bg-surface-container-high transition-colors"
                  }
                >
                  Start Free Trial
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          variants={stagger(0.05, 0.12)}
          className="max-w-4xl mx-auto text-center bg-primary rounded-3xl p-16 text-on-primary relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-64 h-64 bg-secondary filter blur-3xl -translate-y-1/2 translate-x-1/2"
          />
          <motion.h2 variants={fadeUp} className="font-display text-display mb-8 relative">
            Start Your First SaaS — Today
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-body-lg text-body-lg text-white/70 mb-10 relative"
          >
            Stop recruiting. Stop managing. Start building the future of
            software.
          </motion.p>
          <motion.button
            variants={fadeUp}
            {...buttonHover}
            type="button"
            className="relative bg-white text-primary px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl transition-shadow"
          >
            Launch Your Product
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-variant">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-lg font-bold text-primary">Zero-Employee</div>
            <p className="text-on-surface-variant text-sm text-center md:text-left max-w-xs">
              The autonomous platform for building and scaling SaaS companies
              without human overhead.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Twitter",
              "LinkedIn",
              "Documentation",
              "Contact",
            ].map((link) => (
              <a
                key={link}
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-surface-variant text-center md:text-left">
          <p className="text-on-surface-variant text-sm">
            © 2026 Zero-Employee Company Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
