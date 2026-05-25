import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ensureSchema } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";
import { SubscribeForm } from "./subscribe-form";

export default async function MarketingLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureSchema();
  const p = await getMarketingProduct(slug);
  if (!p) notFound();

  const signupUrl = `/product/${slug}`;

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Monitoring-as-a-Service
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              {p.tagline.split(" ").slice(0, 3).join(" ")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {p.tagline.split(" ").slice(3).join(" ") || "automatisch überwachen"}
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
              {p.name} überwacht Ihre Datenquellen automatisch und benachrichtigt Sie sofort bei Änderungen. Keine manuelle Kontrolle mehr — Ihr Monitoring läuft rund um die Uhr.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={signupUrl}
                className="px-6 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all inline-flex items-center gap-2"
              >
                Kostenlos starten
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 rounded-xl bg-white text-slate-700 text-sm font-bold border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all inline-flex items-center gap-2"
              >
                Mehr erfahren
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 16 }}>check_circle</span>
                Keine Kreditkarte
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 16 }}>check_circle</span>
                In 2 Minuten startklar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 16 }}>check_circle</span>
                DSGVO-konform
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─────────────────────────────── */}
      {(p.tenant_count > 0 || p.observation_count > 0) && (
        <section className="border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-8 md:gap-16">
            {p.tenant_count > 0 && (
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900">{p.tenant_count}+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Aktive Nutzer</div>
              </div>
            )}
            {p.observation_count > 0 && (
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900">{p.observation_count.toLocaleString("de-DE")}+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Datenpunkte erfasst</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">24/7</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Automatisches Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">&lt;2min</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Einrichtungszeit</div>
            </div>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">So funktioniert&apos;s</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">In drei einfachen Schritten zum automatischen Monitoring — keine technischen Kenntnisse nötig.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "link", title: "Quelle verbinden", desc: "Verbinden Sie eine API, Website, RSS-Feed oder ein Dokument. Wir unterstützen über 7 Datenquellentypen." },
              { step: "2", icon: "tune", title: "Regeln definieren", desc: "Legen Sie fest, wann Sie benachrichtigt werden: Preisänderungen, neue Einträge, Schwellenwerte, Abweichungen." },
              { step: "3", icon: "notifications", title: "Sofort benachrichtigt", desc: "Erhalten Sie Alerts per E-Mail, Slack, Teams, Telegram oder Webhook — in Echtzeit." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 mb-5">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>{s.icon}</span>
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">{s.step}</div>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Alles was Sie brauchen</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Professionelles Monitoring ohne eigene Entwicklung.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "sensors", title: "7 Datenquellentypen", desc: "HTTP API, Web Scraping, RSS, CSV, Google Sheets, PDF, E-Mail — alles abgedeckt." },
              { icon: "tune", title: "Intelligente Regeln", desc: "Schwellenwerte, Änderungsraten, Abwesenheit, Regex, statistische Anomalien, Deadlines." },
              { icon: "campaign", title: "Multi-Channel Alerts", desc: "E-Mail, Slack, Teams, Telegram, Webhook, In-App — Sie entscheiden, wo Sie benachrichtigt werden." },
              { icon: "stream", title: "Lückenlose Historie", desc: "Jeder Datenpunkt gespeichert. Suche, Filter, CSV/JSON-Export." },
              { icon: "summarize", title: "Automatische Reports", desc: "Tägliche und wöchentliche Digests per E-Mail — immer auf dem neuesten Stand." },
              { icon: "shield", title: "DSGVO-konform", desc: "Daten in der EU, verschlüsselt, mit vollem Auskunfts-, Löschungs- und Portabilitätsrecht." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>{f.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Einfache, transparente Preise</h2>
            <p className="text-slate-500 mt-3">Starten Sie kostenlos. Upgraden Sie, wenn Sie wachsen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {p.pricing_tiers.map((tier, i) => {
              const popular = i === 1;
              return (
                <div key={tier.name} className={`rounded-2xl border p-6 relative ${popular ? "border-blue-300 bg-blue-50/30 shadow-xl shadow-blue-500/10 ring-1 ring-blue-200" : "border-slate-200 bg-white"}`}>
                  {popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      Beliebt
                    </div>
                  )}
                  <div className="text-sm font-bold text-slate-900 mb-1">{tier.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">€{tier.price_eur_monthly}</span>
                    <span className="text-sm text-slate-500">/Monat</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {Object.entries(tier.limits).map(([k, v]) => (
                      <li key={k} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 16 }}>check</span>
                        {formatLimit(k, v)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={signupUrl}
                    className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm text-center block transition-colors ${
                      popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Jetzt starten
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-12">Häufige Fragen</h2>
          <div className="space-y-4">
            {[
              { q: "Wie schnell bin ich startklar?", a: "In unter 2 Minuten. Quelle verbinden, Regel anlegen, fertig. Keine Installation, kein Code." },
              { q: "Welche Datenquellen werden unterstützt?", a: "HTTP APIs, Websites (Web Scraping), RSS-Feeds, CSV-Uploads, Google Sheets, PDF-Dokumente und E-Mail-Postfächer." },
              { q: "Ist meine Daten DSGVO-konform gespeichert?", a: "Ja. Alle Daten werden verschlüsselt in der EU gespeichert. Sie haben volles Recht auf Auskunft (Art. 15), Löschung (Art. 17) und Datenportabilität (Art. 20)." },
              { q: "Kann ich jederzeit kündigen?", a: "Ja, monatlich kündbar. Keine Mindestlaufzeit, keine versteckten Kosten." },
              { q: "Wie werde ich benachrichtigt?", a: "Per E-Mail, Slack, Microsoft Teams, Telegram, Webhook oder direkt in der App. Sie wählen den Kanal." },
              { q: "Brauche ich technische Kenntnisse?", a: "Nein. Die Oberfläche ist für Nicht-Techniker gebaut. Für APIs bieten wir Vorlagen und Test-Buttons." },
            ].map((faq) => (
              <details key={faq.q} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
                  {faq.q}
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform" style={{ fontSize: 18 }}>expand_more</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white">Bereit zum Starten?</h2>
              <p className="text-slate-400 mt-4 max-w-lg mx-auto">
                Erstellen Sie Ihr erstes Monitoring in unter 2 Minuten. Kostenlos, ohne Kreditkarte.
              </p>
              <Link
                href={signupUrl}
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 shadow-xl transition-all"
              >
                Kostenlos starten
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </Link>
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-4">Oder erhalten Sie Updates per E-Mail:</p>
                <Suspense fallback={null}>
                  <SubscribeForm productId={p.id} productSlug={p.slug} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatLimit(key: string, value: number): string {
  const labels: Record<string, string> = {
    max_data_sources: `${value} Datenquellen`,
    max_alert_rules: `${value} Alert-Regeln`,
    check_frequency_minutes: `Alle ${value} Min. prüfen`,
    history_retention_days: `${value} Tage Historie`,
    team_members: `${value} Teammitglieder`,
  };
  return labels[key] ?? `${key}: ${value}`;
}
