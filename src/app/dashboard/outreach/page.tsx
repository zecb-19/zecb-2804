import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Outreach Queues"
      blurb="The weekly approval rituals that keep the Outreach Engine on-message. All decisions feed back into the Core Message and Pattern Library."
      icon="campaign"
      bullets={[
        "Pattern-promotion candidates flagged by the Reviewer Agent (Friday batch).",
        "SEO drafts and social posts awaiting human approval (V1 = 100%, V2 = 10% sampling).",
        "Message-Propagation candidates — top performers proposed for cross-channel testing.",
        "Channel proposals (audience expansion, scaling triggers) with budget impact preview.",
        "Per-product outreach scope checklist (V1 IN/OUT — Meta IN, Cold email OUT, etc.).",
      ]}
    />
  );
}
