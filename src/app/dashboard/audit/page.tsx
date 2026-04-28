import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Audit Trail"
      blurb="Every agent_runs row — single source for forensics and unit-economics analysis. Operator approvals logged with actor, timestamp, target, decision."
      icon="fact_check"
      bullets={[
        "Filter by agent (Architect, Build Orchestrator, Reviewer, Channel agents) / product / time / cost.",
        "Per-row input, output, latency, cost in EUR — every LLM call attributable.",
        "Cold-email send log retained ≥ 3 years (legal basis, match score, content hash) per §11.3.",
        "Holding-wide unsubscribe ledger lookup (hashed, no bulk export).",
        "CSV / JSON export for external analysis or compliance review.",
      ]}
    />
  );
}
