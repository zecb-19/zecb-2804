import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="BuildSpec Authoring"
      blurb="Compose and iterate the BuildSpec for a candidate product. Schema-validated against the active template before dispatch to the Build Orchestrator."
      icon="edit_document"
      bullets={[
        "Form-based authoring per template — Monitoring-SaaS first (data sources, alert primitives, notification channels, pricing tiers, branding).",
        "Inline JSON Schema (draft 2020-12) validation with field-level errors before submission.",
        "Save drafts, run a dry-run validation, then dispatch to the Build Orchestrator.",
        "Past BuildSpecs and their pipeline outcomes for reference and forking.",
      ]}
    />
  );
}
