import { ensureSchema } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";
import { notFound } from "next/navigation";

export default async function AGBPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const p = await getMarketingProduct(slug);
  if (!p) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Allgemeine Geschäftsbedingungen</h1>
      <div className="prose prose-slate prose-sm max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 1 Geltungsbereich</h2>
          <p>Diese AGB gelten für die Nutzung des Monitoring-Dienstes „{p.name}", betrieben von ZECB GmbH. Mit der Registrierung erkennen Sie diese Bedingungen an.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 2 Leistungsbeschreibung</h2>
          <p>{p.name} ist ein webbasierter Monitoring-Dienst, der Datenquellen automatisch überwacht und bei Änderungen benachrichtigt. Der genaue Leistungsumfang richtet sich nach dem gewählten Tarif.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 3 Vertragsschluss und Registrierung</h2>
          <p>Der Vertrag kommt durch Registrierung auf der Website zustande. Sie sind verpflichtet, wahrheitsgemäße Angaben zu machen und Ihre Zugangsdaten vertraulich zu behandeln.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 4 Preise und Zahlung</h2>
          <p>Die aktuellen Preise sind auf der Website einsehbar. Alle Preise verstehen sich in Euro und zzgl. gesetzlicher Umsatzsteuer. Die Abrechnung erfolgt monatlich über Stripe.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 5 Kündigung</h2>
          <p>Der Vertrag ist monatlich kündbar. Die Kündigung kann über die Kontoeinstellungen oder per E-Mail erfolgen. Nach Kündigung bleiben Ihre Daten 30 Tage für den Export verfügbar.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 6 Haftung</h2>
          <p>Wir haften nicht für Ausfälle oder Verzögerungen bei der Datenerfassung von Drittquellen. Die Monitoring-Ergebnisse dienen der Information und stellen keine geschäftliche Beratung dar.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">§ 7 Schlussbestimmungen</h2>
          <p>Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Berlin. Sollte eine Bestimmung dieser AGB unwirksam sein, bleiben die übrigen Bestimmungen hiervon unberührt.</p>
        </section>
      </div>
    </div>
  );
}
