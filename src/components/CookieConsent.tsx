"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "zecb_consent";

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
};

const DEFAULT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false,
};

export function CookieConsent() {
  const [state, setState] = useState<ConsentState>(DEFAULT);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        setState({ ...JSON.parse(stored), decided: true });
      }
    } catch { /* */ }
  }, []);

  if (state.decided) return null;

  const save = (consent: Omit<ConsentState, "decided">) => {
    const full = { ...consent, decided: true };
    setState(full);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
    logConsent(consent);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-lg p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 flex-none mt-0.5" style={{ fontSize: 22 }}>
            cookie
          </span>
          <div className="flex-1">
            <h3 className="font-semibold text-body-lg text-slate-900">Cookie-Einstellungen</h3>
            <p className="text-xs text-slate-900-variant mt-1">
              Wir verwenden Cookies für die Funktion der Website (notwendig) und optional
              für Analyse und Marketing. Sie können Ihre Auswahl jederzeit ändern.
              {" "}
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="text-slate-900 hover:underline"
              >
                {showDetails ? "Weniger" : "Details anzeigen"}
              </button>
            </p>

            {showDetails && (
              <div className="mt-3 space-y-2">
                <ConsentToggle
                  label="Notwendig"
                  description="Sitzungsverwaltung, Sicherheit, Einstellungen"
                  checked={true}
                  disabled
                />
                <ConsentToggle
                  label="Analyse"
                  description="PostHog — Nutzungsstatistiken, Attribution"
                  checked={state.analytics}
                  onChange={(v) => setState((s) => ({ ...s, analytics: v }))}
                />
                <ConsentToggle
                  label="Marketing"
                  description="Meta Ads, Google Ads — Conversion-Tracking"
                  checked={state.marketing}
                  onChange={(v) => setState((s) => ({ ...s, marketing: v }))}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => save({ necessary: true, analytics: true, marketing: true })}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:opacity-90"
              >
                Alle akzeptieren
              </button>
              <button
                type="button"
                onClick={() => save({ necessary: true, analytics: state.analytics, marketing: state.marketing })}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 font-semibold text-sm hover:bg-slate-50"
              >
                Auswahl speichern
              </button>
              <button
                type="button"
                onClick={() => save({ necessary: true, analytics: false, marketing: false })}
                className="px-4 py-2 rounded-lg text-slate-900-variant text-sm hover:underline"
              >
                Nur notwendige
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentToggle({
  label, description, checked, disabled, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 cursor-pointer">
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-900-variant">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-5 h-5 accent-primary"
      />
    </label>
  );
}

function logConsent(consent: Omit<ConsentState, "decided">) {
  fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consent),
  }).catch(() => {});
}
