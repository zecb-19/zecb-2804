import { NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";

type EventObject = Record<string, unknown>;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const obj = event.data.object as unknown as EventObject;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(obj);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(obj);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(obj);
        break;
      case "invoice.paid":
        await handleInvoicePaid(obj);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: EventObject) {
  if (session.mode !== "subscription" || !session.subscription || !session.customer) {
    return;
  }

  const metadata = session.metadata as Record<string, string> | undefined;
  const userId = metadata?.user_id;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(
    String(session.subscription),
  );
  const subData = subscription as unknown as EventObject;
  const subMeta = subData.metadata as Record<string, string> | undefined;
  const tierId = subMeta?.tier_id ?? null;

  await pool.query(
    `UPDATE users
        SET stripe_customer_id = $1,
            subscription_id = $2,
            subscription_status = $3,
            subscription_tier = $4,
            subscription_current_period_end = to_timestamp($5)
      WHERE id = $6::uuid`,
    [
      String(session.customer),
      String(subData.id),
      String(subData.status),
      tierId,
      Number(subData.current_period_end),
      userId,
    ],
  );

  await pool.query(
    `INSERT INTO agent_runs
       (agent, task_name, input, status, cost_eur, owner_user_id)
     VALUES
       ('Billing', 'subscription_created', $1::jsonb, 'ok', 0, $2::uuid)`,
    [
      JSON.stringify({
        subscription_id: String(subData.id),
        tier: tierId,
        status: String(subData.status),
      }),
      userId,
    ],
  );
}

async function handleSubscriptionChange(sub: EventObject) {
  const meta = sub.metadata as Record<string, string> | undefined;
  const tierId = meta?.tier_id ?? null;

  await pool.query(
    `UPDATE users
        SET subscription_status = $1,
            subscription_tier = $2,
            subscription_current_period_end = to_timestamp($3)
      WHERE subscription_id = $4`,
    [
      String(sub.status),
      tierId,
      Number(sub.current_period_end),
      String(sub.id),
    ],
  );
}

async function handlePaymentFailed(invoice: EventObject) {
  if (!invoice.subscription) return;

  await pool.query(
    `UPDATE users
        SET subscription_status = 'past_due'
      WHERE subscription_id = $1`,
    [String(invoice.subscription)],
  );
}

async function handleInvoicePaid(invoice: EventObject) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    String(invoice.subscription),
  );
  const subData = subscription as unknown as EventObject;

  await pool.query(
    `UPDATE users
        SET subscription_status = $1,
            subscription_current_period_end = to_timestamp($2)
      WHERE subscription_id = $3`,
    [
      String(subData.status),
      Number(subData.current_period_end),
      String(subData.id),
    ],
  );
}
