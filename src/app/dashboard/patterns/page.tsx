import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Pattern Library"
      blurb="Layer 3 — horizontal building blocks reused across templates. Pattern promotion is the single most important weekly ritual for the system's long-term moat."
      icon="extension"
      bullets={[
        "V1 seed: Email Digest, CSV Import/Export, Webhook Receiver, External API Poller, LLM Extract, Approval Queue, Timeline View, Onboarding Wizard, Scheduled Report, Slack Integration.",
        "Each pattern: stable interface, eval suite, documented cost characteristics, version history.",
        "Source-build attribution — see which products contributed each pattern.",
        "Friday promotion queue — Reviewer Agent flags candidates; founder approves or rejects.",
        "Target: ~40–60 patterns by build #10, ≥ 200 by build #50.",
      ]}
    />
  );
}
