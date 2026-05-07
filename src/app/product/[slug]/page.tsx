"use client";

import { useActionState, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  tenantSignupAction,
  tenantSigninAction,
  type TenantAuthState,
} from "@/app/actions/tenant-auth";

export default function ProductAuth() {
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
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-bold text-2xl text-primary">{slug}</h1>
          <p className="text-on-surface-variant mt-1">Monitoring-SaaS</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-variant p-6">
          <div className="flex mb-6 border-b border-surface-variant">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={"pb-2 px-4 font-semibold text-body-md border-b-2 transition-colors " +
                (mode === "signin" ? "border-primary text-primary" : "border-transparent text-on-surface-variant")}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={"pb-2 px-4 font-semibold text-body-md border-b-2 transition-colors " +
                (mode === "signup" ? "border-primary text-primary" : "border-transparent text-on-surface-variant")}
            >
              Sign Up
            </button>
          </div>

          {mode === "signin" ? (
            <form action={signinAction} className="space-y-4">
              <input type="hidden" name="product_slug" value={slug} />
              <Input label="Email" name="email" type="email" />
              <Input label="Password" name="password" type="password" />
              <button
                type="submit"
                disabled={signinPending}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {signinPending ? "Signing in..." : "Sign In"}
              </button>
              {signinState && !signinState.ok && (
                <p className="text-error text-label-sm">{signinState.message}</p>
              )}
            </form>
          ) : (
            <form action={signupAction} className="space-y-4">
              <input type="hidden" name="product_slug" value={slug} />
              <Input label="Name" name="name" />
              <Input label="Email" name="email" type="email" />
              <Input label="Password" name="password" type="password" hint="At least 8 characters" />
              <button
                type="submit"
                disabled={signupPending}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {signupPending ? "Creating account..." : "Create Account"}
              </button>
              {signupState && !signupState.ok && (
                <p className="text-error text-label-sm">{signupState.message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", hint }: { label: string; name: string; type?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required
        className="w-full rounded-lg border border-surface-variant px-3 py-2.5 text-body-md focus:outline-none focus:border-primary"
      />
      {hint && <p className="text-label-sm text-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}
