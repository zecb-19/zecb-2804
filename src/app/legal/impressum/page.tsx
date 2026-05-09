import Link from "next/link";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-8">
        <Link href="/" className="text-slate-900 text-sm hover:underline">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-4">Impressum</h1>
        <div className="mt-6 space-y-4 text-sm text-slate-900">
          <section>
            <h2 className="font-semibold text-body-lg">Angaben gemäß § 5 TMG</h2>
            <p className="mt-1 text-slate-900-variant">
              Zero-Employee Company Builder<br />
              [Firmenname und Rechtsform eintragen]<br />
              [Straße und Hausnummer]<br />
              [PLZ und Ort], Deutschland
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">Vertreten durch</h2>
            <p className="mt-1 text-slate-900-variant">[Name des Geschäftsführers]</p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">Kontakt</h2>
            <p className="mt-1 text-slate-900-variant">
              E-Mail: [kontakt@example.de]<br />
              Telefon: [+49 ...]
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">Registereintrag</h2>
            <p className="mt-1 text-slate-900-variant">
              Handelsregister: [Amtsgericht]<br />
              Registernummer: [HRB ...]
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">Umsatzsteuer-ID</h2>
            <p className="mt-1 text-slate-900-variant">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
              [DE ...]
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="mt-1 text-slate-900-variant">
              [Name]<br />
              [Adresse]
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-body-lg">Streitschlichtung</h2>
            <p className="mt-1 text-slate-900-variant">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit.
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
        <p className="text-xs text-slate-900-variant mt-8 italic">
          Dieses Impressum ist ein Platzhalter. Bitte ersetzen Sie die Klammerwerte durch
          Ihre tatsächlichen Unternehmensdaten bevor Sie live gehen.
        </p>
      </div>
    </div>
  );
}
