"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { subscribeAction, type SubscribeState } from "@/app/actions/subscribe";

export function SubscribeForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [state, action, pending] = useActionState(
    subscribeAction,
    undefined as SubscribeState,
  );
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  return (
    <div>
      {verified === "success" && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          E-Mail erfolgreich bestätigt! Sie erhalten ab jetzt Updates.
        </div>
      )}
      {verified === "already" && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
          Ihre E-Mail wurde bereits bestätigt.
        </div>
      )}
      {verified === "error" && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          Bestätigungslink ungültig oder abgelaufen.
        </div>
      )}

      {state?.ok ? (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mark_email_read</span>
          {state.message}
        </div>
      ) : (
        <form action={action} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="hidden" name="product_id" value={productId} />
          <input type="hidden" name="product_slug" value={productSlug} />
          <input
            type="email"
            name="email"
            required
            placeholder="ihre@email.de"
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 shadow-lg transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {pending ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                Senden...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mail</span>
                Updates erhalten
              </>
            )}
          </button>
        </form>
      )}
      {state && !state.ok && (
        <p className="text-red-300 text-xs mt-2 text-center">{state.message}</p>
      )}
      <p className="text-xs text-slate-500 mt-3 text-center">
        Double-Opt-In gemäß DSGVO. Jederzeit abbestellbar.
      </p>
    </div>
  );
}
