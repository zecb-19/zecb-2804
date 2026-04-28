import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Portfolio Control Plane"
      blurb="Cross-product budget enforcement and unified reporting. The single pane of glass for every product the holding has shipped."
      icon="monitoring"
      bullets={[
        "Per-product budget envelopes vs spend (build, monthly opex, paid channels).",
        "CAC by channel and channel-sequence — owned PostHog CDP only, never platform-reported conversions.",
        "LTV by first-touch and 40/40/20 multi-touch attribution (60-day window).",
        "Channel contribution to activation, conversion, retention; lifecycle-stage mix per product.",
        "Creative fatigue indicators (CTR decay, time-to-fatigue) per product, per channel.",
      ]}
    />
  );
}
