import Link from "next/link";

export default function AGB() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-8">
        <Link href="/" className="text-slate-900 text-sm hover:underline">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-4">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <div className="mt-6 space-y-6 text-sm text-slate-900">
          <section>
            <h2 className="font-semibold text-body-lg">§ 1 Geltungsbereich</h2>
            <p className="mt-1 text-slate-900-variant">
              Diese AGB gelten für die Nutzung der ZECB-Plattform durch registrierte
              Operatoren. Mit der Registrierung erkennen Sie diese Bedingungen an.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">§ 2 Leistungsbeschreibung</h2>
            <p className="mt-1 text-slate-900-variant">
              Die Plattform ermöglicht die automatisierte Erstellung von SaaS-Produkten
              aus einem kuratierten Template-Katalog mit integriertem Outreach-Engine.
              Der genaue Leistungsumfang ergibt sich aus dem gewählten Abonnement
              (Starter, Growth, Scale).
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">§ 3 Preise und Zahlung</h2>
            <p className="mt-1 text-slate-900-variant">
              Die Abonnementpreise sind auf der Plattform und in der Preisübersicht
              angegeben. Die Abrechnung erfolgt monatlich über Stripe. Bei
              Zahlungsverzug behalten wir uns vor, den Zugang einzuschränken.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">§ 4 Kündigung</h2>
            <p className="mt-1 text-slate-900-variant">
              Das Abonnement kann jederzeit zum Ende des aktuellen
              Abrechnungszeitraums über das Stripe-Kundenportal gekündigt werden.
              Bereits gezahlte Beträge werden nicht erstattet.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">§ 5 Haftung</h2>
            <p className="mt-1 text-slate-900-variant">
              Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.
              Für die Richtigkeit der durch KI-Agenten generierten Inhalte
              übernehmen wir keine Gewähr.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">§ 6 Datenschutz</h2>
            <p className="mt-1 text-slate-900-variant">
              Die Verarbeitung personenbezogener Daten richtet sich nach unserer{" "}
              <Link href="/legal/datenschutz" className="text-slate-900 hover:underline">
                Datenschutzerklärung
              </Link>.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">§ 7 Schlussbestimmungen</h2>
            <p className="mt-1 text-slate-900-variant">
              Es gilt deutsches Recht. Gerichtsstand ist [Ort]. Sollte eine
              Bestimmung unwirksam sein, bleiben die übrigen Bestimmungen unberührt.
            </p>
          </section>
        </div>
        <p className="text-xs text-slate-900-variant mt-8 italic">
          Diese AGB sind ein Platzhalter. Lassen Sie sie vor dem Go-Live
          von einem Rechtsanwalt prüfen.
        </p>
      </div>
    </div>
  );
}
