"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getCurrentUser } from "@/lib/auth/dal";
import { pool } from "@/lib/db";
import { stripe, ensureStripePrices, type PlatformTierId } from "@/lib/stripe";

export type CheckoutState =
  | { ok: true; url: string }
  | { ok: false; message: string }
  | undefined;

export async function createCheckoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const tierId = formData.get("tier_id") as PlatformTierId | null;
  if (!tierId) return { ok: false, message: "Missing tier." };

  try {
    const prices = await ensureStripePrices();
    const priceId = prices.get(tierId);
    if (!priceId) return { ok: false, message: "Invalid tier." };

    const { rows } = await pool.query<{ stripe_customer_id: string | null }>(
      "SELECT stripe_customer_id FROM users WHERE id = $1::uuid",
      [user.id],
    );
    const existingCustomerId = rows[0]?.stripe_customer_id;

    const headersList = await headers();
    const origin = headersList.get("origin") ?? "http://localhost:3000";

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/settings?billing=success`,
      cancel_url: `${origin}/dashboard/settings?billing=cancel`,
      metadata: { user_id: user.id, tier_id: tierId },
      subscription_data: {
        metadata: { user_id: user.id, tier_id: tierId },
      },
    };

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return { ok: false, message: "Could not create checkout session." };
    }

    redirect(session.url);
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[createCheckoutAction] failed:", err);
    return { ok: false, message: "Could not start checkout. Please try again." };
  }
}

export async function openPortalAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { rows } = await pool.query<{ stripe_customer_id: string | null }>(
    "SELECT stripe_customer_id FROM users WHERE id = $1::uuid",
    [user.id],
  );
  const customerId = rows[0]?.stripe_customer_id;

  if (!customerId) {
    redirect("/dashboard/settings?billing=no_subscription");
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/settings`,
  });

  redirect(session.url);
}
