import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Template Catalog"
      blurb="Layer 2 product archetypes. Each ships seven mandatory artifacts (code scaffold, schema, workflow library, UI kit, prompts + evals, runbook, marketing kit)."
      icon="dashboard_customize"
      bullets={[
        "Monitoring-SaaS (V1) — passive observation; rule-based alerts on data sources.",
        "Workflow-Automation-SaaS (V2) — active, LLM-heavy pipelines with HITL review inboxes.",
        "Data-Enrichment-API (V2) — developer-facing, usage-based pricing, SDK + playground.",
        "Dashboard & Reporting (V2+) — integration-heavy with white-label option.",
        "Per-template eval pass-rate, semver, products built, deprecation status.",
      ]}
    />
  );
}
