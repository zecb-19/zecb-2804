import { SectionStub } from "@/components/dashboard/SectionStub";

export default function Page() {
  return (
    <SectionStub
      title="Settings"
      blurb="Operator account, holding-wide preferences, integrations, and team. Foundation-layer integrations are required before any product can launch."
      icon="settings"
      bullets={[
        "Account: name, email, password rotation, MFA enforcement.",
        "Holding: legal name, billing entity, default region (DACH-EU first), languages.",
        "Integrations: Stripe Connect, Postmark, SendGrid, R2, PostHog (CDP), Google Search Console, Bing Webmaster, Doppler/SOPS, Slack notifications.",
        "Team: invite operators with roles (founder, operator, viewer); audit who approved what.",
        "Notifications: which agent events page you, email-only digests, Slack channel routing.",
      ]}
    />
  );
}
