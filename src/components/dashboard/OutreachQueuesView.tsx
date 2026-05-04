"use client";

import { motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  approveOutreachItemAction,
  rejectOutreachItemAction,
  type OutreachActionState,
} from "@/app/actions/outreach";
import type { OutreachQueueItem, OutreachQueueStats } from "@/lib/outreach/queries";

import { fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  items: OutreachQueueItem[];
  stats: OutreachQueueStats;
};

const ITEM_TYPE_CONFIG: Record<string, { label: string; icon: string; description: string }> = {
  content: {
    label: "Content",
    icon: "article",
    description: "SEO articles and social posts awaiting approval",
  },
  propagation: {
    label: "Propagation",
    icon: "sync_alt",
    description: "Top performers proposed for cross-channel testing",
  },
  channel_proposal: {
    label: "Channel Proposal",
    icon: "campaign",
    description: "Audience expansion and scaling trigger proposals",
  },
};

const CHANNEL_SCOPE = [
  { channel: "Meta Ads", v1: true, note: "Full campaign automation" },
  { channel: "Google Ads", v1: false, note: "Deferred to V1.5/V2" },
  { channel: "Cold Email", v1: false, note: "Deferred — legal review required" },
  { channel: "Lifecycle Email", v1: true, note: "Full sequences from day 1" },
  { channel: "SEO Blog", v1: true, note: "2 articles/week, human-approved" },
  { channel: "LinkedIn Organic", v1: true, note: "3 posts/week, human-approved" },
  { channel: "X Organic", v1: true, note: "1-2 posts/week, human-approved" },
  { channel: "Communities/Forums", v1: false, note: "V2 — authenticity risk" },
  { channel: "Directory Listings", v1: true, note: "Manual submissions" },
  { channel: "Product Hunt", v1: true, note: "One launch at 4-6 weeks" },
  { channel: "Review Generation", v1: true, note: "Lifecycle-integrated" },
];

export function OutreachQueuesView({ items, stats }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = activeTab === "all"
    ? items
    : items.filter((i) => i.item_type === activeTab);

  const pendingItems = filtered.filter((i) => i.status === "pending");
  const reviewedItems = filtered.filter((i) => i.status !== "pending");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-h1 text-h1 text-primary">Outreach Review Queues</h1>
        <p className="text-on-surface-variant mt-1.5 max-w-3xl">
          Weekly approval rituals that keep the Outreach Engine on-message.
          Content, propagation candidates, and channel proposals — all decisions
          feed back into the Core Message.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger(0.05, 0.06)}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <StatCard label="Pending" value={String(stats.total_pending)} icon="pending_actions" />
        <StatCard label="Content" value={String(stats.content_pending)} icon="article" />
        <StatCard label="Propagation" value={String(stats.propagation_pending)} icon="sync_alt" />
        <StatCard label="Channel" value={String(stats.channel_pending)} icon="campaign" />
        <StatCard label="Approved (wk)" value={String(stats.approved_this_week)} icon="check_circle" />
        <StatCard label="Rejected (wk)" value={String(stats.rejected_this_week)} icon="cancel" />
      </motion.div>

      {/* Tab filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5">
        {[
          { key: "all", label: `All (${items.length})` },
          { key: "content", label: `Content (${items.filter((i) => i.item_type === "content").length})` },
          { key: "propagation", label: `Propagation (${items.filter((i) => i.item_type === "propagation").length})` },
          { key: "channel_proposal", label: `Channel (${items.filter((i) => i.item_type === "channel_proposal").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={
              "px-3 py-1.5 rounded-full text-label-sm font-semibold transition-colors " +
              (activeTab === tab.key
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low")
            }
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Queue items */}
      {pendingItems.length === 0 && reviewedItems.length === 0 ? (
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-xl border border-surface-variant p-8 text-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 40 }}>
            inbox
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mt-3">Queue is empty</h3>
          <p className="text-on-surface-variant mt-1.5 max-w-md mx-auto text-body-md">
            Content drafts, propagation candidates, and channel proposals will
            appear here once the Outreach Engine channels are live and generating
            content. The Friday batch review will surface all pending items.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.03, 0.04)} className="space-y-3">
          {pendingItems.map((item) => (
            <QueueItemCard key={item.id} item={item} />
          ))}
          {reviewedItems.length > 0 && (
            <div className="pt-4">
              <div className="text-label-sm font-semibold text-on-surface-variant mb-2">
                Recently reviewed
              </div>
              {reviewedItems.map((item) => (
                <QueueItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* V1 channel scope */}
      <motion.div variants={fadeUp}>
        <ChannelScope />
      </motion.div>

      {/* Propagation loop description */}
      <motion.div
        variants={fadeUp}
        className="bg-secondary-fixed/30 rounded-lg p-4 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary flex-none" style={{ fontSize: 20 }}>sync_alt</span>
          <div className="text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">Message Propagation Loop (PRD §8.10):</span>{" "}
            Weekly cron computes top-N performers per channel → propagation
            candidates appear here for approval. Top ad headline → LP H1 → email
            subject. Top SEO article → LinkedIn + X + newsletter. Top email
            subject → ad copy. Common objections → Core Message rebuttals.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- Queue Item Card ------------------------------------------------------ */

function QueueItemCard({ item }: { item: OutreachQueueItem }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveOutreachItemAction, undefined as OutreachActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectOutreachItemAction, undefined as OutreachActionState,
  );
  const anyPending = approvePending || rejectPending;
  const isPending = item.status === "pending" && !approveState?.ok && !rejectState?.ok;

  const typeCfg = ITEM_TYPE_CONFIG[item.item_type] ?? {
    label: item.item_type, icon: "description", description: "",
  };

  return (
    <motion.div
      variants={fadeUpSm}
      className={
        "bg-white rounded-xl border p-4 " +
        (isPending ? "border-amber-200" : "border-surface-variant opacity-70")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
              {typeCfg.icon}
            </span>
            <span className="font-semibold text-body-md text-on-surface">{item.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm">
              {typeCfg.label}
            </span>
            {item.channel && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-label-sm">
                {item.channel}
              </span>
            )}
            {item.product_slug && (
              <span className="text-label-sm text-on-surface-variant font-mono">
                {item.product_slug}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-label-sm text-on-surface-variant mt-1">{item.description}</p>
          )}
          {item.content_preview && (
            <div className="mt-2 p-2 bg-surface-container-low rounded text-body-md text-on-surface line-clamp-3">
              {item.content_preview}
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex items-center gap-2 flex-none">
            <form action={approveAction}>
              <input type="hidden" name="item_id" value={item.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                Approve
              </button>
            </form>
            <form action={rejectAction}>
              <input type="hidden" name="item_id" value={item.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-lg border border-surface-variant text-on-surface-variant text-label-sm font-semibold hover:bg-surface-container-low disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                Reject
              </button>
            </form>
          </div>
        )}
        {!isPending && (
          <span className={
            "px-2 py-0.5 rounded-full text-label-sm font-semibold flex-none " +
            (item.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-surface-container text-on-surface-variant")
          }>
            {item.status}
          </span>
        )}
      </div>

      {(approveState && !approveState.ok) && (
        <p className="text-error text-label-sm mt-1">{approveState.message}</p>
      )}
      {(rejectState && !rejectState.ok) && (
        <p className="text-error text-label-sm mt-1">{rejectState.message}</p>
      )}
    </motion.div>
  );
}

/* --- Channel Scope -------------------------------------------------------- */

function ChannelScope() {
  return (
    <section className="bg-white rounded-xl border border-surface-variant p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
          checklist
        </span>
        <h2 className="font-h3 text-h3 text-on-surface">V1 Outreach Scope (PRD §8.13)</h2>
      </div>
      <div className="space-y-1.5">
        {CHANNEL_SCOPE.map((ch) => (
          <div
            key={ch.channel}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-low"
          >
            <div className="flex items-center gap-2">
              <span
                className={"material-symbols-outlined " + (ch.v1 ? "text-emerald-500" : "text-on-surface-variant")}
                style={{ fontSize: 18 }}
              >
                {ch.v1 ? "check_circle" : "block"}
              </span>
              <span className="text-body-md text-on-surface">{ch.channel}</span>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <span className={
                "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
                (ch.v1 ? "bg-emerald-100 text-emerald-800" : "bg-surface-container text-on-surface-variant")
              }>
                {ch.v1 ? "V1 IN" : "V1 OUT"}
              </span>
              <span className="text-label-sm text-on-surface-variant max-w-[200px] truncate">
                {ch.note}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <motion.div variants={scaleIn} className="bg-white rounded-xl border border-surface-variant p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-primary leading-none">{value}</div>
    </motion.div>
  );
}
