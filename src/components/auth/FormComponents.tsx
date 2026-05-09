"use client";

import { useMemo, useState } from "react";

export const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";

export const labelCls = "text-sm font-medium text-slate-700 mb-1.5 block";

export const submitCls =
  "w-full mt-2 bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export function ErrorList({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul className="mt-1.5 text-red-600 text-xs space-y-0.5">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}

export function FormBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
      {message}
    </div>
  );
}

export function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
  errors,
  onValueChange,
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder?: string;
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
          placeholder={placeholder}
          onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          className={`${inputCls} pr-11`}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      <ErrorList errors={errors} />
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const { score, label, color } = useMemo(() => {
    let s = 0;
    if (value.length >= 10) s++;
    if (/[a-z]/.test(value)) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^a-zA-Z0-9]/.test(value)) s++;
    const tiers: ReadonlyArray<[string, string]> = [
      ["Too short", "bg-red-500"],
      ["Very weak", "bg-red-500"],
      ["Weak", "bg-orange-500"],
      ["Fair", "bg-amber-500"],
      ["Good", "bg-blue-500"],
      ["Strong", "bg-emerald-500"],
    ];
    return { score: s, label: tiers[s][0], color: tiers[s][1] };
  }, [value]);

  if (!value) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < score ? color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
