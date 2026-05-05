import "server-only";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const PLATFORM_TIERS = [
  {
    id: "starter",
    name: "Starter",
    price_eur: 99,
    interval: "month" as const,
    features: [
      "1 active project",
      "Build pipeline",
      "Idea inbox",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price_eur: 299,
    interval: "month" as const,
    features: [
      "5 active projects",
      "Outreach engine",
      "Priority support",
      "Portfolio control",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price_eur: 899,
    interval: "month" as const,
    features: [
      "Unlimited projects",
      "Custom blueprints",
      "White-label",
      "Success manager",
    ],
  },
] as const;

export type PlatformTierId = (typeof PLATFORM_TIERS)[number]["id"];

let priceCache: Map<string, string> | null = null;

export async function ensureStripePrices(): Promise<Map<string, string>> {
  if (priceCache) return priceCache;

  const product = await findOrCreateProduct();
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  const map = new Map<string, string>();
  for (const tier of PLATFORM_TIERS) {
    const existing = prices.data.find(
      (p) =>
        p.unit_amount === tier.price_eur * 100 &&
        p.currency === "eur" &&
        p.recurring?.interval === tier.interval,
    );

    if (existing) {
      map.set(tier.id, existing.id);
    } else {
      const created = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.price_eur * 100,
        currency: "eur",
        recurring: { interval: tier.interval },
        metadata: { tier_id: tier.id },
      });
      map.set(tier.id, created.id);
    }
  }

  priceCache = map;
  return map;
}

async function findOrCreateProduct(): Promise<Stripe.Product> {
  const products = await stripe.products.list({ limit: 100, active: true });
  const existing = products.data.find(
    (p) => p.metadata.app === "zecb-platform",
  );
  if (existing) return existing;

  return stripe.products.create({
    name: "Zero-Employee Company Builder",
    description: "Platform subscription for ZECB operators",
    metadata: { app: "zecb-platform" },
  });
}
