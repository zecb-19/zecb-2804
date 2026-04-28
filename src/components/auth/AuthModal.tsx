"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { signinAction, signupAction } from "@/app/actions/auth";
import { COUNTRIES, type AuthFormState } from "@/lib/auth/definitions";

type Mode = "signin" | "signup";

type Props = {
  open: boolean;
  initialMode: Mode;
  onClose: () => void;
};

const initialState: AuthFormState = undefined;

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-surface-container-low border border-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md";

const labelCls = "text-label-sm font-semibold text-on-surface mb-1 block";

const submitCls =
  "mt-2 bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity";

export function AuthModal({ open, initialMode, onClose }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [signupState, signupSubmit, signupPending] = useActionState(
    signupAction,
    initialState,
  );
  const [signinState, signinSubmit, signinPending] = useActionState(
    signinAction,
    initialState,
  );

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [initialMode, open]);

  const success =
    (signupState && signupState.ok ? signupState : null) ??
    (signinState && signinState.ok ? signinState : null);

  useEffect(() => {
    if (!success) return;
    onClose();
    router.refresh();
  }, [success, onClose, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="auth-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: easeOut }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-surface-variant overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-surface-variant flex-none">
              <div>
                <h2 id="auth-title" className="font-h2 text-h2 text-primary">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  {mode === "signin"
                    ? "Sign in to continue building."
                    : "Join the platform that ships SaaS in 72 hours."}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="text-on-surface-variant hover:text-primary p-1 rounded-md hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto">
              {mode === "signup" ? (
                <SignupForm
                  state={signupState}
                  action={signupSubmit}
                  pending={signupPending}
                />
              ) : (
                <SigninForm
                  state={signinState}
                  action={signinSubmit}
                  pending={signinPending}
                />
              )}

              <p className="mt-5 text-center text-body-md text-on-surface-variant">
                {mode === "signin" ? (
                  <>
                    No account?{" "}
                    <button
                      type="button"
                      className="text-secondary font-semibold hover:underline"
                      onClick={() => setMode("signup")}
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-secondary font-semibold hover:underline"
                      onClick={() => setMode("signin")}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ErrorList({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul className="mt-1 text-error text-label-sm space-y-0.5">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}

function FormBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-3 py-2 rounded-lg bg-error-container text-on-error-container text-body-md">
      {message}
    </div>
  );
}

function PasswordInput({
  id,
  name,
  autoComplete,
  errors,
  onValueChange,
}: {
  id: string;
  name: string;
  autoComplete: string;
  errors?: string[];
  onValueChange?: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1 rounded-md transition-colors"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20 }}
          >
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      <ErrorList errors={errors} />
    </div>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const { score, label, color } = useMemo(() => {
    let s = 0;
    if (value.length >= 10) s++;
    if (/[a-z]/.test(value)) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^a-zA-Z0-9]/.test(value)) s++;
    const tiers: ReadonlyArray<[string, string]> = [
      ["Too short", "bg-error"],
      ["Very weak", "bg-error"],
      ["Weak", "bg-error"],
      ["Fair", "bg-amber-500"],
      ["Good", "bg-secondary"],
      ["Strong", "bg-emerald-600"],
    ];
    return { score: s, label: tiers[s][0], color: tiers[s][1] };
  }, [value]);

  if (!value) return null;
  return (
    <div className="mt-1.5">
      <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-200`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <div className="text-label-sm text-on-surface-variant mt-1">
        Strength: {label}
      </div>
    </div>
  );
}

function SigninForm({
  state,
  action,
  pending,
}: {
  state: AuthFormState;
  action: (formData: FormData) => void;
  pending: boolean;
}) {
  const failure = state && !state.ok ? state : null;
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormBanner message={failure?.message} />
      <div>
        <label htmlFor="signin-email" className={labelCls}>
          Email
        </label>
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
        <label htmlFor="signin-password" className={labelCls}>
          Password
        </label>
        <PasswordInput
          id="signin-password"
          name="password"
          autoComplete="current-password"
          errors={failure?.errors?.password}
        />
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="rememberMe"
            className="h-4 w-4 rounded border-surface-variant accent-primary"
          />
          <span className="text-body-md text-on-surface-variant">
            Keep me signed in for 30 days
          </span>
        </label>
        <a
          href="#"
          className="text-label-sm text-secondary font-semibold hover:underline"
        >
          Forgot password?
        </a>
      </div>
      <button type="submit" disabled={pending} className={submitCls}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function SignupForm({
  state,
  action,
  pending,
}: {
  state: AuthFormState;
  action: (formData: FormData) => void;
  pending: boolean;
}) {
  const failure = state && !state.ok ? state : null;
  const [pw, setPw] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormBanner message={failure?.message} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="signup-firstName" className={labelCls}>
            First name
          </label>
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
          <label htmlFor="signup-lastName" className={labelCls}>
            Last name
          </label>
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
        <label htmlFor="signup-email" className={labelCls}>
          Work email
        </label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-company" className={labelCls}>
          Company / holding name
        </label>
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
        <label htmlFor="signup-country" className={labelCls}>
          Country
        </label>
        <select
          id="signup-country"
          name="country"
          defaultValue="DE"
          required
          className={inputCls}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <ErrorList errors={failure?.errors?.country} />
      </div>

      <div>
        <label htmlFor="signup-password" className={labelCls}>
          Password
        </label>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          errors={failure?.errors?.password}
          onValueChange={setPw}
        />
        <PasswordStrength value={pw} />
        <p className="text-label-sm text-on-surface-variant mt-1">
          10+ characters with uppercase, lowercase, number, and special character.
        </p>
      </div>

      <div>
        <label htmlFor="signup-confirmPassword" className={labelCls}>
          Confirm password
        </label>
        <PasswordInput
          id="signup-confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          errors={failure?.errors?.confirmPassword}
        />
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="termsAccepted"
            className="mt-1 h-4 w-4 rounded border-surface-variant accent-primary"
          />
          <span className="text-body-md text-on-surface-variant">
            I agree to the{" "}
            <a
              href="#"
              className="text-secondary font-semibold hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-secondary font-semibold hover:underline"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>
        <ErrorList errors={failure?.errors?.termsAccepted} />
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-1 h-4 w-4 rounded border-surface-variant accent-primary"
          />
          <span className="text-body-md text-on-surface-variant">
            Send me product updates and launch announcements. (Optional.)
          </span>
        </label>
      </div>

      <button type="submit" disabled={pending} className={submitCls}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
