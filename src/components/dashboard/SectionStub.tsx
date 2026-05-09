"use client";

import { motion } from "framer-motion";

import { fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  title: string;
  blurb: string;
  icon?: string;
  bullets: string[];
};

export function SectionStub({
  title,
  blurb,
  icon = "construction",
  bullets,
}: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.1)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1.5 max-w-3xl">{blurb}</p>
      </motion.div>

      <motion.div
        variants={scaleIn}
        className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8"
      >
        <div className="flex items-start gap-5">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="bg-blue-50 text-blue-600 rounded-2xl p-3 flex-none"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
              {icon}
            </span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                In active build
              </span>
              <span className="text-xs text-slate-500">
                V1 roadmap
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-2">
              Planned capabilities for this surface
            </h2>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={stagger(0.25, 0.06)}
              className="mt-3 space-y-2"
            >
              {bullets.map((b) => (
                <motion.li
                  key={b}
                  variants={fadeUpSm}
                  className="flex gap-2 text-sm text-slate-500"
                >
                  <span
                    className="material-symbols-outlined text-blue-600 flex-none mt-0.5"
                    style={{ fontSize: 18 }}
                  >
                    check_circle
                  </span>
                  <span>{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
