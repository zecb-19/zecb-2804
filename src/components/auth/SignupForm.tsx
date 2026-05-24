"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { signupAction, resendVerificationAction, type ResendVerificationState } from "@/app/actions/auth";
import { COUNTRIES, type AuthFormState } from "@/lib/auth/definitions";

import {
  ErrorList,
  FormBanner,
  PasswordInput,
  PasswordStrength,
  inputCls,
  labelCls,
  submitCls,
} from "./FormComponents";

const initialState: AuthFormState = undefined;

export function SignupForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(signupAction, initialState);
  const [pw, setPw] = useState("");
  const [resendState, resendAction, resendPending] = useActionState(
    resendVerificationAction,
    undefined as ResendVerificationState,
  );

  const success = state && state.ok ? state : null;
  const failure = state && !state.ok ? state : null;

  useEffect(() => {
    if (success && !success.needsVerification) router.push("/dashboard");
  }, [success, router]);

  if (success?.needsVerification) {
    return (
      <div className="text-center py-4">
        <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 48 }}>
          mark_email_read
        </span>
        <h2 className="text-lg font-semibold text-slate-900 mt-4">Check your email</h2>
        <p className="text-slate-500 mt-2 text-sm">
          We sent a verification link to <strong>{success.user.email}</strong>.
          Click the link to activate your account. It expires in 24 hours.
        </p>
        <form action={resendAction} className="mt-6">
          <input type="hidden" name="email" value={success.user.email} />
          <button
            type="submit"
            disabled={resendPending || resendState?.ok}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700 disabled:text-slate-400 transition-colors"
          >
            {resendState?.ok
              ? "Verification email sent!"
              : resendPending
                ? "Sending..."
                : "Didn’t receive it? Resend"}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-400">Check your spam folder if you don&apos;t see it.</p>
      </div>
    );
  }

  return (
    <div>
      <form action={action} className="flex flex-col gap-4">
        <FormBanner message={failure?.message} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-firstName" className={labelCls}>First name</label>
            <input
              id="signup-firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              placeholder="Ada"
              className={inputCls}
            />
            <ErrorList errors={failure?.errors?.firstName} />
          </div>
          <div>
            <label htmlFor="signup-lastName" className={labelCls}>Last name</label>
            <input
              id="signup-lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              placeholder="Lovelace"
              className={inputCls}
            />
            <ErrorList errors={failure?.errors?.lastName} />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className={labelCls}>Work email</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>mail</span>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              className={`${inputCls} pl-11`}
            />
          </div>
          <ErrorList errors={failure?.errors?.email} />
        </div>

        <div>
          <label htmlFor="signup-company" className={labelCls}>Company name</label>
          <input
            id="signup-company"
            name="company"
            type="text"
            autoComplete="organization"
            required
            placeholder="Acme Holding GmbH"
            className={inputCls}
          />
          <ErrorList errors={failure?.errors?.company} />
        </div>

        <div>
          <label htmlFor="signup-country" className={labelCls}>Country</label>
          <select
            id="signup-country"
            name="country"
            defaultValue="DE"
            required
            className={inputCls}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <ErrorList errors={failure?.errors?.country} />
        </div>

        <div>
          <label htmlFor="signup-password" className={labelCls}>Password</label>
          <PasswordInput
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="Min. 10 characters"
            errors={failure?.errors?.password}
            onValueChange={setPw}
          />
          <PasswordStrength value={pw} />
          <p className="text-xs text-slate-400 mt-1.5">
            Uppercase, lowercase, number, and special character required.
          </p>
        </div>

        <div>
          <label htmlFor="signup-confirmPassword" className={labelCls}>Confirm password</label>
          <PasswordInput
            id="signup-confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            errors={failure?.errors?.confirmPassword}
          />
        </div>

        <div className="flex flex-col gap-3 mt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="termsAccepted"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
            />
            <span className="text-sm text-slate-600">
              I agree to the{" "}
              <Link href="/legal/agb" className="text-blue-600 font-medium hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/legal/datenschutz" className="text-blue-600 font-medium hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          <ErrorList errors={failure?.errors?.termsAccepted} />
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="marketingConsent"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
            />
            <span className="text-sm text-slate-500">
              Send me product updates and launch announcements. (Optional)
            </span>
          </label>
        </div>

        <button type="submit" disabled={pending} className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all">
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
