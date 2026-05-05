import "server-only";
import { pool } from "@/lib/db";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  country: string | null;
  role: string;
  marketing_consent: boolean;
  terms_accepted_at: string | null;
  last_login_at: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_tier: string | null;
  subscription_id: string | null;
  subscription_current_period_end: string | null;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { rows } = await pool.query<UserProfile>(
    `SELECT id::text AS id, email, name,
            first_name, last_name, company, country,
            role, marketing_consent,
            terms_accepted_at::text AS terms_accepted_at,
            last_login_at::text AS last_login_at,
            stripe_customer_id,
            subscription_status,
            subscription_tier,
            subscription_id,
            subscription_current_period_end::text AS subscription_current_period_end,
            created_at::text AS created_at
       FROM users
      WHERE id = $1::uuid
      LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export type IntegrationStatus = {
  key: string;
  name: string;
  category: "billing" | "email" | "analytics" | "storage" | "observability" | "support";
  connected: boolean;
  required: boolean;
};

export function getIntegrationStatuses(): IntegrationStatus[] {
  return [
    {
      key: "stripe",
      name: "Stripe Billing",
      category: "billing",
      connected: !!process.env.STRIPE_SECRET_KEY,
      required: true,
    },
    {
      key: "postmark",
      name: "Postmark (transactional email)",
      category: "email",
      connected: !!process.env.POSTMARK_API_KEY,
      required: true,
    },
    {
      key: "sendgrid",
      name: "SendGrid (marketing email)",
      category: "email",
      connected: !!process.env.SENDGRID_API_KEY,
      required: true,
    },
    {
      key: "posthog",
      name: "PostHog (CDP / attribution)",
      category: "analytics",
      connected: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
      required: true,
    },
    {
      key: "r2",
      name: "Cloudflare R2 (object storage)",
      category: "storage",
      connected: !!process.env.R2_ACCESS_KEY_ID,
      required: true,
    },
    {
      key: "sentry",
      name: "Sentry (error tracking)",
      category: "observability",
      connected: !!process.env.SENTRY_DSN,
      required: true,
    },
    {
      key: "otel",
      name: "OpenTelemetry (tracing)",
      category: "observability",
      connected: !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      required: false,
    },
    {
      key: "crisp",
      name: "Crisp (support widget)",
      category: "support",
      connected: !!process.env.CRISP_WEBSITE_ID,
      required: false,
    },
    {
      key: "openrouter",
      name: "OpenRouter (LLM)",
      category: "observability",
      connected: !!process.env.OPENROUTER_KEY,
      required: true,
    },
    {
      key: "meta_ads",
      name: "Meta Marketing API",
      category: "analytics",
      connected: !!process.env.META_SYSTEM_USER_TOKEN,
      required: false,
    },
    {
      key: "google_ads",
      name: "Google Ads API",
      category: "analytics",
      connected: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      required: false,
    },
  ];
}

export type AccountStats = {
  products_total: number;
  products_live: number;
  total_build_cost_eur: number;
  agent_runs_count: number;
};

export async function getAccountStats(userId: string): Promise<AccountStats> {
  const { rows: productRows } = await pool.query<{
    total: string;
    live: string;
  }>(
    `SELECT COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'live')::text AS live
       FROM products
      WHERE owner_user_id = $1::uuid`,
    [userId],
  );

  const { rows: costRows } = await pool.query<{
    total_cost: string;
    run_count: string;
  }>(
    `SELECT COALESCE(SUM(a.cost_eur), 0)::text AS total_cost,
            COUNT(*)::text AS run_count
       FROM agent_runs a
       LEFT JOIN products p ON p.id = a.product_id
      WHERE p.owner_user_id = $1::uuid
         OR (a.product_id IS NULL AND a.owner_user_id = $1::uuid)`,
    [userId],
  );

  return {
    products_total: Number(productRows[0]?.total ?? 0),
    products_live: Number(productRows[0]?.live ?? 0),
    total_build_cost_eur: Number(costRows[0]?.total_cost ?? 0),
    agent_runs_count: Number(costRows[0]?.run_count ?? 0),
  };
}
