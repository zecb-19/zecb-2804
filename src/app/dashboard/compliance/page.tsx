import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Compliance Gates"
      blurb="Hard gates before activating regulated channels. No bypass, no clever workaround — these protect the holding from legal and reputational risk."
      icon="verified_user"
      bullets={[
        "Cold email V2 activation: lawyer-reviewed framework attached, recipient filter set, frequency cap configured (max 2/recipient/product/12mo · 4 holding-wide), opt-out wired.",
        "DSGVO toolkit health: TCF 2.2 cookie consent, Impressum, Datenschutzerklärung, AGB, Auskunft / Löschung / Datenportabilität flows, consent ledger.",
        "Holding-wide unsubscribe ledger (hashed email; lookup-only; no bulk export).",
        "Forbidden-claims validator status — banned phrases blocked at Core Message versioning.",
        "Cold-email audit log retention check (≥ 3 years per §11.3).",
      ]}
    />
  );
}
