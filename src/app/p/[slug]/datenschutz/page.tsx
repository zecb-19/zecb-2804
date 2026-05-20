import { ensureSchema } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";
import { notFound } from "next/navigation";

export default async function DatenschutzPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const p = await getMarketingProduct(slug);
  if (!p) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Datenschutzerklärung</h1>
      <div className="prose prose-slate prose-sm max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="text-lg font-bold text-slate-900">1. Verantwortliche Stelle</h2>
          <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />{p.name}, betrieben durch ZECB GmbH<br />E-Mail: datenschutz@{slug}.zecb.io</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">2. Erhobene Daten</h2>
          <p>Wir verarbeiten folgende personenbezogene Daten:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name und E-Mail-Adresse (bei Registrierung)</li>
            <li>Nutzungsdaten (Zeitpunkt der Anmeldung, aufgerufene Seiten)</li>
            <li>Technische Daten (IP-Adresse, Browser-Typ, Betriebssystem)</li>
            <li>Von Ihnen konfigurierte Monitoring-Daten und Alertregeln</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">3. Zweck der Verarbeitung</h2>
          <p>Die Verarbeitung erfolgt zur Bereitstellung unseres Monitoring-Dienstes (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">4. Ihre Rechte</h2>
          <p>Sie haben das Recht auf:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
            <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
            <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
            <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
            <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-2">Diese Rechte können Sie direkt in Ihren Kontoeinstellungen ausüben oder per E-Mail an datenschutz@{slug}.zecb.io.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">5. Datenspeicherung</h2>
          <p>Ihre Daten werden auf Servern in der Europäischen Union (AWS Frankfurt) gespeichert und mit TLS verschlüsselt übertragen. Die Speicherung erfolgt nur so lange, wie es für die Zweckerfüllung erforderlich ist.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">6. Cookies</h2>
          <p>Wir verwenden nur technisch notwendige Cookies (Session-Cookies für die Anmeldung). Analytische oder Marketing-Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt.</p>
        </section>
      </div>
    </div>
  );
}
