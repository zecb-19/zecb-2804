"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { verifyEmailAction, type VerifyEmailState } from "@/app/actions/auth";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 p-8 text-center">
        <span className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin inline-block" />
        <p className="text-slate-500 mt-4">Verifying...</p>
      </div>
    </div>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyEmailState>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setState({ ok: false, message: "Invalid verification link." });
      setLoading(false);
      return;
    }
    verifyEmailAction(token).then((result) => {
      setState(result);
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 p-8 text-center">
        {loading ? (
          <>
            <span className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin inline-block" />
            <p className="text-slate-500 mt-4">Verifying your email...</p>
          </>
        ) : state?.ok ? (
          <>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: 48 }}
            >
              check_circle
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-4">
              Email verified!
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Your account is now active. You can sign in to start building.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-6 px-8 py-3 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:from-slate-700 hover:to-slate-800 transition-all"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            <span
              className="material-symbols-outlined text-red-400"
              style={{ fontSize: 48 }}
            >
              error
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-4">
              Verification failed
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {state?.message || "Something went wrong."}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Try signing in to resend verification
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Create a new account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
