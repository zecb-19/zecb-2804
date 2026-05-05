"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import {
  requestPasswordResetAction,
  resetPasswordAction,
  type PasswordResetRequestState,
  type PasswordResetState,
} from "@/app/actions/auth";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
      <div className="w-full max-w-md bg-white rounded-xl border border-surface-variant p-8">
        <p className="text-center text-on-surface-variant">Loading...</p>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="font-bold text-xl text-primary">
            Zero-Employee
          </Link>
        </div>
        {token ? <ResetForm token={token} /> : <RequestForm />}
      </div>
    </div>
  );
}

function RequestForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    undefined as PasswordResetRequestState,
  );
  const [email, setEmail] = useState("");

  if (state?.ok) {
    return (
      <div className="bg-white rounded-xl border border-surface-variant p-8 text-center">
        <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 48 }}>
          mark_email_read
        </span>
        <h1 className="font-h3 text-h3 text-on-surface mt-4">Check your email</h1>
        <p className="text-on-surface-variant mt-2">
          If an account exists for <strong>{email}</strong>, we sent a password
          reset link. It expires in 1 hour.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 text-primary font-semibold hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-surface-variant p-8">
      <h1 className="font-h3 text-h3 text-on-surface">Reset your password</h1>
      <p className="text-on-surface-variant mt-1 mb-6">
        Enter your email and we'll send a reset link.
      </p>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-surface-variant px-3 py-2.5 text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send reset link"}
        </button>

        {state && !state.ok && (
          <p className="text-error text-label-sm">{state.message}</p>
        )}
      </form>

      <p className="text-center mt-4">
        <Link href="/" className="text-primary text-body-md hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    undefined as PasswordResetState,
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const errors = (state && !state.ok ? state.errors : undefined) ?? {};

  if (state?.ok) {
    return (
      <div className="bg-white rounded-xl border border-surface-variant p-8 text-center">
        <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 48 }}>
          check_circle
        </span>
        <h1 className="font-h3 text-h3 text-on-surface mt-4">Password reset!</h1>
        <p className="text-on-surface-variant mt-2">
          Your password has been updated. You can now sign in.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-surface-variant p-8">
      <h1 className="font-h3 text-h3 text-on-surface">Set new password</h1>
      <p className="text-on-surface-variant mt-1 mb-6">
        Choose a strong password for your account.
      </p>

      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
            New password
          </label>
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className={
              "w-full rounded-lg border px-3 py-2.5 text-body-md focus:outline-none focus:border-primary " +
              (errors.newPassword ? "border-error" : "border-surface-variant")
            }
          />
          <p className="text-label-sm text-on-surface-variant mt-1">
            Min 10 chars, with uppercase, lowercase, number, and special character.
          </p>
          {errors.newPassword?.map((e) => (
            <p key={e} className="text-error text-label-sm">{e}</p>
          ))}
        </div>

        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
            Confirm password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={
              "w-full rounded-lg border px-3 py-2.5 text-body-md focus:outline-none focus:border-primary " +
              (errors.confirmPassword ? "border-error" : "border-surface-variant")
            }
          />
          {errors.confirmPassword?.map((e) => (
            <p key={e} className="text-error text-label-sm">{e}</p>
          ))}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Resetting..." : "Reset password"}
        </button>

        {state && !state.ok && !state.errors && (
          <p className="text-error text-label-sm">{state.message}</p>
        )}
      </form>
    </div>
  );
}
