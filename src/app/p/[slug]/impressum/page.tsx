import { ensureSchema } from "@/lib/db";
import { getMarketingProduct } from "@/lib/marketing/queries";
import { notFound } from "next/navigation";

export default async function ImpressumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const p = await getMarketingProduct(slug);
  if (!p) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Impressum</h1>
      <div className="prose prose-slate prose-sm max-w-none space-y-6 text-slate-600">
        <section>
          <h2 className="text-lg font-bold text-slate-900">Angaben gemäß § 5 TMG</h2>
          <p>{p.name}<br />Betrieben durch ZECB GmbH (Zero-Employee Company Builder)<br />Musterstraße 1<br />10115 Berlin<br />Deutschland</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">Kontakt</h2>
          <p>E-Mail: kontakt@{slug}.zecb.io<br />Telefon: +49 30 12345678</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">Vertreten durch</h2>
          <p>Geschäftsführer: [Name des Geschäftsführers]</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">Registereintrag</h2>
          <p>Eintragung im Handelsregister.<br />Registergericht: Amtsgericht Berlin-Charlottenburg<br />Registernummer: HRB XXXXX</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />DE XXXXXXXXX</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">Haftungsausschluss</h2>
          <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
        </section>
      </div>
    </div>
  );
}
