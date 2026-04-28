import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Idea Inbox"
      blurb="Validated MarketSignalReports surfaced by the Architect Agent, awaiting your decision before they become BuildSpec drafts."
      icon="inbox"
      bullets={[
        "Approve, reject, or annotate each MarketSignalReport with positive-unit-economic estimates.",
        "See the validation packet behind each opportunity — winning landing variant, top hooks, email-response themes.",
        "Promote an approved idea straight into a Monitoring-SaaS BuildSpec draft (V1) — one click.",
        "Reject reasoning is captured for Architect Agent feedback so future ideation tightens.",
      ]}
    />
  );
}
