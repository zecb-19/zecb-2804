import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Launch Approval"
      blurb="The HITL gate for V1. Release Agent only cuts production DNS and activates GTM after you approve here."
      icon="check_circle"
      bullets={[
        "Staging URL + QA report (Playwright signup → cancel → delete journey).",
        "Marketing site preview at www.<product_domain> with copy, pricing, branding.",
        "Stripe products and prices configured — verified before approval.",
        "First-fetch sample from each data source + monthly operating-cost estimate.",
        "Approve · Request fix · Reject — all decisions logged with actor and timestamp.",
      ]}
    />
  );
}
