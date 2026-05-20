"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSourceAndTestAction,
  createQuickRuleAction,
  completeOnboardingAction,
  type OnboardingState,
} from "@/app/actions/tenant-onboarding";

const inputCls = "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";

type Props = {
  slug: string;
  productName: string;
  firstName: string;
  hasSources: boolean;
  hasRules: boolean;
  availableFields: string[];
};

export function OnboardingWizard({ slug, productName, firstName, hasSources, hasRules, availableFields }: Props) {
  const router = useRouter();
  const initialStep = hasSources ? (hasRules ? 3 : 2) : 1;
  const [step, setStep] = useState(initialStep);

  const [sourceState, sourceAction, sourcePending] = useActionState(createSourceAndTestAction, undefined as OnboardingState);
  const [ruleState, ruleAction, rulePending] = useActionState(createQuickRuleAction, undefined as OnboardingState);
  const [completeState, completeAction, completePending] = useActionState(completeOnboardingAction, undefined as OnboardingState);

  const sourceOk = sourceState?.ok || hasSources;
  const ruleOk = ruleState?.ok || hasRules;

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20 mb-4">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>monitoring</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Willkommen, {firstName}!</h1>
        <p className="text-slate-500 mt-2">
          Richten Sie <span className="font-semibold text-slate-700">{productName}</span> in 3 Schritten ein.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s < step || (s === 1 && sourceOk) || (s === 2 && ruleOk) || (s === 3 && completeState?.ok)
                ? "bg-emerald-500 text-white"
                : s === step
                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                : "bg-slate-200 text-slate-500"
            }`}>
              {(s < step || (s === 1 && sourceOk) || (s === 2 && ruleOk)) ? (
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
              ) : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 rounded-full ${s < step ? "bg-emerald-500" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Connect Source */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>link</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Datenquelle verbinden</h2>
              <p className="text-xs text-slate-500">Verbinden Sie eine API, Website oder einen Feed</p>
            </div>
          </div>

          {sourceState && !sourceState.ok && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{sourceState.message}</div>
          )}
          {sourceState?.ok && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              {"message" in sourceState ? sourceState.message : "Source created!"}
            </div>
          )}

          <form action={async (formData) => { await sourceAction(formData); setStep(2); }} className="space-y-4">
            <input type="hidden" name="kind" value="http_api" />
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Name der Quelle</label>
              <input type="text" name="name" required placeholder="z.B. Metro Preisliste API" defaultValue="Meine erste Datenquelle" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">URL</label>
              <input type="url" name="url" required placeholder="https://api.example.com/data" className={inputCls} />
              <p className="text-xs text-slate-400 mt-1.5">Wir holen die Daten direkt von dieser URL.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Tipp:</span> Verwenden Sie eine öffentliche API oder eine Webseite, die Sie überwachen möchten. Wir unterstützen JSON-APIs, HTML-Seiten, RSS-Feeds und mehr.
              </p>
            </div>

            <button type="submit" disabled={sourcePending}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {sourcePending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verbinde und teste...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>Verbinden und testen</>
              )}
            </button>
          </form>

          {sourceOk && !sourceState?.ok && (
            <button type="button" onClick={() => setStep(2)} className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
              Quelle bereits vorhanden — weiter
            </button>
          )}
        </div>
      )}

      {/* Step 2: Create Rule */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-600" style={{ fontSize: 22 }}>tune</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Alert-Regel erstellen</h2>
              <p className="text-xs text-slate-500">Wann sollen Sie benachrichtigt werden?</p>
            </div>
          </div>

          {ruleState && !ruleState.ok && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{ruleState.message}</div>
          )}
          {ruleState?.ok && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              {"message" in ruleState ? ruleState.message : "Rule created!"}
            </div>
          )}

          <form action={async (formData) => { await ruleAction(formData); setStep(3); }} className="space-y-4">
            <input type="hidden" name="condition_type" value="threshold" />
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Name der Regel</label>
              <input type="text" name="name" required placeholder="z.B. Preisalarm über 10%" defaultValue="Mein erster Alert" className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Feld</label>
                {availableFields.length > 0 ? (
                  <select name="field" className={inputCls}>
                    {availableFields.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                ) : (
                  <input type="text" name="field" required placeholder="z.B. price_eur" className={`${inputCls} font-mono`} />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Operator</label>
                <select name="operator" className={inputCls}>
                  <option value="gt">&gt; größer als</option>
                  <option value="lt">&lt; kleiner als</option>
                  <option value="gte">&gt;= mindestens</option>
                  <option value="neq">≠ ungleich</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Wert</label>
                <input type="text" name="value" required placeholder="100" className={inputCls} />
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <p className="text-xs text-violet-700">
                <span className="font-semibold">So funktioniert es:</span> Wenn der Wert des gewählten Feldes den Schwellenwert überschreitet, erhalten Sie sofort eine Benachrichtigung per E-Mail.
              </p>
            </div>

            <button type="submit" disabled={rulePending}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {rulePending ? "Erstelle..." : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Regel erstellen</>}
            </button>
          </form>

          <button type="button" onClick={() => setStep(1)} className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Zurück
          </button>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-6">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>celebration</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Alles eingerichtet!</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Ihr Monitoring für <span className="font-semibold text-slate-700">{productName}</span> ist aktiv.
            Sie werden benachrichtigt, sobald sich etwas ändert.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-3">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 22 }}>check_circle</span>
              <div className="text-xs font-medium text-emerald-700 mt-1">Quelle verbunden</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 22 }}>check_circle</span>
              <div className="text-xs font-medium text-emerald-700 mt-1">Regel aktiv</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 22 }}>check_circle</span>
              <div className="text-xs font-medium text-emerald-700 mt-1">Alerts per E-Mail</div>
            </div>
          </div>

          <form action={async (formData) => {
            await completeAction(formData);
            router.push(`/product/${slug}/dashboard`);
          }} className="mt-8">
            <button type="submit" disabled={completePending}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              {completePending ? "..." : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>Zum Dashboard</>}
            </button>
          </form>
        </div>
      )}

      {/* Time estimate */}
      <p className="text-center text-xs text-slate-400 mt-6">
        Schritt {step} von 3 · Typisch unter 2 Minuten
      </p>
    </div>
  );
}
