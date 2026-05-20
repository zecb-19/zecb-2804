import { redirect } from "next/navigation";
import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema, pool } from "@/lib/db";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const { rows } = await pool.query<{
    notify_channels: string;
    slack_webhook_url: string | null;
    teams_webhook_url: string | null;
    telegram_chat_id: string | null;
  }>(
    `SELECT notify_channels::text, slack_webhook_url, teams_webhook_url, telegram_chat_id FROM tenants WHERE id = $1::uuid`,
    [session.tenantId],
  );
  const tenant = rows[0];
  const channels: string[] = tenant ? JSON.parse(tenant.notify_channels) : ["email"];

  return (
    <NotificationsClient
      slug={slug}
      channels={channels}
      slackUrl={tenant?.slack_webhook_url ?? ""}
      teamsUrl={tenant?.teams_webhook_url ?? ""}
      telegramId={tenant?.telegram_chat_id ?? ""}
    />
  );
}
