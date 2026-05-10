"use client";

import { useActionState, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  tenantSignupAction,
  tenantSigninAction,
  type TenantAuthState,
} from "@/app/actions/tenant-auth";

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>monitoring</span>
          </div>
          <h1 className="font-bold text-2xl text-slate-900 tracking-tight">{slug}</h1>
          <p className="text-slate-500 text-sm mt-1">Monitoring-SaaS</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 p-7">
          {/* Tabs */}
          <div className="flex mb-7 bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all " +
                (mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={"flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all " +
                (mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Sign Up
            </button>
          </div>

          {mode === "signin" ? (
            <form action={signinAction} className="space-y-4">
              <input type="hidden" name="product_slug" value={slug} />
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>mail</span>
                  <input type="email" name="email" required placeholder="you@company.com" className={`${inputCls} pl-11`} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>lock</span>
                  <input type="password" name="password" required placeholder="Enter your password" className={`${inputCls} pl-11`} />
                </div>
              </div>
              <button
                type="submit"
                disabled={signinPending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {signinPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
              {signinState && !signinState.ok && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{signinState.message}</div>
              )}
            </form>
          ) : (
            <form action={signupAction} className="space-y-4">
              <input type="hidden" name="product_slug" value={slug} />
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>person</span>
                  <input type="text" name="name" required placeholder="Your full name" className={`${inputCls} pl-11`} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>mail</span>
                  <input type="email" name="email" required placeholder="you@company.com" className={`${inputCls} pl-11`} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>lock</span>
                  <input type="password" name="password" required placeholder="Min. 8 characters" className={`${inputCls} pl-11`} />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">At least 8 characters</p>
              </div>
              <button
                type="submit"
                disabled={signupPending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {signupPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : "Create Account"}
              </button>
              {signupState && !signupState.ok && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{signupState.message}</div>
              )}
            </form>
          )}
        </div>

        {/* Trust signal */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 14 }}>lock</span>
          <span className="text-xs text-slate-400">Encrypted & stored in the EU</span>
        </div>
      </div>
    </div>
  );
}
