"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { I18nProvider } from "@/lib/i18n/context";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { easeOut } from "./motion";

type Props = {
  user: { name: string; email: string };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <I18nProvider>
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-surface flex">
        {/* Desktop sidebar — sticky full-height */}
        <div className="hidden lg:block flex-none">
          <div className="sticky top-0 h-screen">
            <Sidebar user={user} />
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                key="drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                key="drawer"
                initial={{ x: -288 }}
                animate={{ x: 0 }}
                exit={{ x: -288 }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
              >
                <Sidebar
                  user={user}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setDrawerOpen(true)} />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: easeOut }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </MotionConfig>
    </I18nProvider>
  );
}
