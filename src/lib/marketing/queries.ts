import "server-only";
import { pool } from "@/lib/db";

export type MarketingProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  template_id: string;
  palette: { primary: string; secondary: string; accent: string };
  pricing_tiers: Array<{
    name: string;
    price_eur_monthly: number;
    limits: Record<string, number>;
  }>;
  data_source_count: number;
  tenant_count: number;
  observation_count: number;
};

export async function getMarketingProduct(slug: string): Promise<MarketingProduct | null> {
  const { rows } = await pool.query<{
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    template_id: string;
    palette: string;
    pricing_tiers: string;
    ds_count: string;
    tenant_count: string;
    obs_count: string;
  }>(
    `SELECT p.id::text, p.slug, p.name, p.tagline, p.template_id,
            p.palette::text, p.pricing_tiers::text,
            (SELECT COUNT(*) FROM data_sources WHERE product_id = p.id AND enabled = TRUE)::text AS ds_count,
            (SELECT COUNT(*) FROM tenants WHERE product_id = p.id)::text AS tenant_count,
            (SELECT COUNT(*) FROM observations WHERE product_id = p.id)::text AS obs_count
       FROM products p WHERE p.slug = $1 AND p.status = 'live'`,
    [slug],
  );
  if (!rows[0]) return null;
  const r = rows[0];
  let palette = { primary: "#2563eb", secondary: "#7c3aed", accent: "#06b6d4" };
  try { const p = JSON.parse(r.palette); if (p.primary) palette = p; } catch {}
  let tiers: MarketingProduct["pricing_tiers"] = [];
  try { tiers = JSON.parse(r.pricing_tiers); } catch {}
  if (tiers.length === 0) {
    tiers = [
      { name: "Starter", price_eur_monthly: 29, limits: { max_data_sources: 3, max_alert_rules: 10, check_frequency_minutes: 60 } },
      { name: "Pro", price_eur_monthly: 79, limits: { max_data_sources: 10, max_alert_rules: 50, check_frequency_minutes: 15 } },
      { name: "Team", price_eur_monthly: 199, limits: { max_data_sources: 50, max_alert_rules: 200, check_frequency_minutes: 5, team_members: 10 } },
    ];
  }
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "Automatisierte Überwachung für Ihr Geschäft",
    template_id: r.template_id,
    palette,
    pricing_tiers: tiers,
    data_source_count: Number(r.ds_count),
    tenant_count: Number(r.tenant_count),
    observation_count: Number(r.obs_count),
  };
}
