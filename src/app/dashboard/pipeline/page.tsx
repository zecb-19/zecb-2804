import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Build Pipeline"
      blurb="Live state across the 11 steps the Build Orchestrator runs, per product. Every step logs input, output, and cost to the agent_runs ledger."
      icon="rocket_launch"
      bullets={[
        "Schema validation → Product registry → Infra provisioning → Repo init → Source smoke fetch.",
        "Alert primitive wiring → Onboarding flow generation → Marketing site → KB init → Integration tests.",
        "Per-step retry / abort / escalate, with re-dispatch back to the Architect Agent for failures.",
        "Cost ledger per step — reconstruct end-to-end build economics down to the cent.",
      ]}
    />
  );
}
