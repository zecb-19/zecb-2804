import Link from "next/link";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-8">
        <Link href="/" className="text-slate-900 text-sm hover:underline">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-4">Datenschutzerklärung</h1>
        <div className="mt-6 space-y-6 text-sm text-slate-900">
          <section>
            <h2 className="font-semibold text-body-lg">1. Verantwortlicher</h2>
            <p className="mt-1 text-slate-900-variant">
              [Firmenname], [Adresse]. Kontakt: [E-Mail].
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="mt-1 text-slate-900-variant">
              Bei der Registrierung erheben wir: Name, E-Mail-Adresse, Unternehmen, Land.
              Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">3. Cookies</h2>
            <p className="mt-1 text-slate-900-variant">
              Wir verwenden technisch notwendige Cookies (Sitzungsverwaltung) sowie optionale
              Analyse- und Marketing-Cookies. Sie können Ihre Einwilligung jederzeit über
              den Cookie-Banner oder die Einstellungen widerrufen. Die Einwilligung wird in
              einem Consent-Ledger protokolliert (Art. 7 Abs. 1 DSGVO).
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">4. Ihre Rechte</h2>
            <ul className="mt-1 text-slate-900-variant space-y-1 list-disc pl-5">
              <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO) — Export Ihrer Daten</li>
              <li><strong>Berichtigung</strong> (Art. 16 DSGVO) — Korrektur unrichtiger Daten</li>
              <li><strong>Löschung</strong> (Art. 17 DSGVO) — Löschung innerhalb von 30 Tagen</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Maschinenlesbarer Export</li>
              <li><strong>Widerspruch</strong> (Art. 21 DSGVO) — Gegen Verarbeitung zu Marketingzwecken</li>
            </ul>
            <p className="mt-2 text-slate-900-variant">
              Anfragen richten Sie an [datenschutz@example.de]. Wir antworten innerhalb von 30 Tagen.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">5. Datenspeicherung und -löschung</h2>
            <p className="mt-1 text-slate-900-variant">
              Betriebsdaten (Agent-Runs, Audit-Trail) werden für mindestens 3 Jahre
              aufbewahrt (§11.7 Compliance). Personenbezogene Daten werden bei Kontolöschung
              innerhalb von 30 Tagen gelöscht. Die Holding-weite Unsubscribe-Liste speichert
              nur gehashte E-Mail-Adressen.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">6. Auftragsverarbeiter</h2>
            <p className="mt-1 text-slate-900-variant">
              AWS (Hosting, RDS), Stripe (Zahlungsabwicklung), OpenRouter (LLM-Verarbeitung).
              Verträge zur Auftragsverarbeitung (AVV) liegen vor.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">7. Aufsichtsbehörde</h2>
            <p className="mt-1 text-slate-900-variant">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
          </section>
        </div>
        <p className="text-xs text-slate-900-variant mt-8 italic">
          Diese Datenschutzerklärung ist ein Platzhalter. Lassen Sie sie vor dem
          Go-Live von einem Datenschutzbeauftragten prüfen.
        </p>
      </div>
    </div>
  );
}
