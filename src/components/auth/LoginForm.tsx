"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { signinAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth/definitions";

import {
  ErrorList,
  FormBanner,
  PasswordInput,
  inputCls,
  labelCls,
  submitCls,
} from "./FormComponents";

const initialState: AuthFormState = undefined;

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(signinAction, initialState);

  const success = state && state.ok ? state : null;
  const failure = state && !state.ok ? state : null;

  useEffect(() => {
    if (success) router.push("/dashboard");
  }, [success, router]);

  return (
    <div>
      <form action={action} className="flex flex-col gap-5">
        <FormBanner message={failure?.message} />

        <div>
          <label htmlFor="signin-email" className={labelCls}>Email address</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            className={inputCls}
          />
          <ErrorList errors={failure?.errors?.email} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="signin-password" className="text-sm font-medium text-slate-700">Password</label>
            <Link href="/reset-password" className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="signin-password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            errors={failure?.errors?.password}
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="rememberMe"
            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
          />
          <span className="text-sm text-slate-600">Keep me signed in for 30 days</span>
        </label>

        <button type="submit" disabled={pending} className={submitCls}>
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
