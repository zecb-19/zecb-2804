# Zero-Employee Company Builder — Product Requirements Document

| Field | Value |
| --- | --- |
| Document | Product Requirements Document (PRD) |
| Project | Zero-Employee Company Builder (ZECB) |
| Version | 1.0 (consolidated) |
| Status | Draft for review |
| Date | 2026-04-28 |
| Source documents | `Zero_Employee_Company_Builder_Addendum_II_Templates_and_Outreach.docx`, marketing landing page (`src/app/page.tsx`) |
| Primary product surfaces | (a) ZECB Platform — the meta-product used by founders/operators; (b) Instantiated SaaS products — what the platform builds for end-customers |

> **Caveat on source completeness.** The addendum explicitly states it should be read alongside a "V1 Base Briefing" that is not in this repository. This PRD captures everything in Addendum II in full and references the missing Base Briefing where its contribution would be load-bearing (notably: portfolio-level architecture §9, agent role definitions, budget ledger details). Sections marked _[Open: Base Briefing]_ are placeholders to be filled once that document is incorporated.

---

## 1. Executive summary

The Zero-Employee Company Builder (ZECB) is an autonomous platform that **instantiates production-ready SaaS products from a curated template catalog and ships each product with an integrated multi-channel outreach engine**. The platform is operated by a small founder team (target: zero employees beyond the operator) and scaled by AI agents, not by hiring.

The two mechanisms that determine whether the system actually produces revenue-generating products are the **Template Catalog** (what we can build) and the **Outreach Engine** (whether what we build finds customers). Both are designed around three principles: centralization of truth, aggressive standardization, and compounding assets.

Build target: median ≤ 48 hours and ≤ €350 from validated business spec to live SaaS in production. Operating target: by V3, 3–5 live products per month at total monthly platform operating cost under €15,000, with median product-level unit economics breaking even within 90 days.

## 2. Background, vision, and positioning

### 2.1 Problem
Building a SaaS company today is slow, expensive, and unpredictable: hiring takes months, every product re-implements the same boilerplate (auth, billing, multi-tenancy, compliance), burn outpaces validation, and most products die for lack of distribution rather than lack of code.

### 2.2 Vision
Decouple the company-building process from the people-building process. Operators **manage configurations, not employees**. The platform handles infrastructure, architecture, deployment, marketing instrumentation, and lifecycle support automatically.

### 2.3 Strategic moat
The orchestration layer is not the moat — that can be replicated within months by anyone with the same LLM APIs. **The moat is the Template Catalog**: a curated, version-controlled, battle-tested set of product archetypes that compound over time. Every product shipped strengthens the templates; every reused pattern compounds the asset.

### 2.4 Marketing positioning (from landing page)
- Headline promise: "Build Profitable SaaS Products in 72 Hours — Without Hiring a Team."
- Audience: solopreneurs, serial founders, and venture studios.
- Primary external KPIs surfaced in marketing: < 72h build time, < €500 startup cost, < 2min time-to-value for end-users of instantiated products.
- Platform pricing tiers exposed publicly: Starter €99/mo (1 project), Growth €299/mo (5 projects, outreach engine, priority support), Scale €899/mo (unlimited, custom blueprints, white-label, success manager). _Note: these are platform-tier prices for ZECB operators; pricing of instantiated SaaS products is independently configured per BuildSpec._

## 3. Goals and success metrics

### 3.1 Strategic goals
1. Ship validated SaaS products at industrial pace (≥ 1 product / week by V2; 3–5 / month by V3).
2. Drive cost per launched product below €500 and platform monthly opex below €15,000 by V3.
3. Build a defensible pattern library that compounds: ≥ 200 reusable patterns by build #50.
4. Achieve product-level break-even on unit economics within 90 days of launch (median).

### 3.2 V1 KPIs (per Monitoring-SaaS template instantiation)

| KPI | Target |
| --- | --- |
| Build time (BuildSpec → live) | median ≤ 48h, p95 ≤ 72h |
| Build cost | median ≤ €350, p95 ≤ €500 |
| Time-to-value (first user) | median ≤ 2 min |
| Rework rate on build | < 20% of work packages need > 1 implementer iteration |
| Template eval pass rate | 100% before instantiation; freeze if < 98% |

### 3.3 Outreach KPIs (per product)
- CPA below target by channel and by channel-sequence (multi-touch attribution governs budget decisions, never platform-reported conversions).
- Cold email: hard bounces < 3%, complaint rate < 0.1%.
- Cross-channel frequency: ≤ 25 paid impressions per person per week.
- SEO: 2 articles/week per product (V1), Core Web Vitals — LCP < 2.5s, CLS < 0.1, INP < 200ms.

### 3.4 Platform-level KPIs
- Monthly operating cost ≤ €15,000 by V3.
- Active concurrent products in production (target: 3–5/month new launches sustained from V3).
- Median product unit economics break-even ≤ 90 days post-launch.

## 4. Target users and personas

### 4.1 Primary ICP (platform user)
The **operator** — solo founder or small team running ZECB to instantiate and operate SaaS businesses. Three pricing-tier personas:
- **Starter** ("solo explorer"): one validated idea, manual review of every shipment.
- **Growth** ("serial builder"): 3–5 parallel products, leaning on automation and the outreach engine.
- **Scale** ("venture studio"): white-label engine, custom blueprints, dedicated success manager.

### 4.2 Secondary ICPs (end-customers of instantiated products)
Defined per template; the addendum names the V1 + V2 product examples explicitly. Selected examples:
- Monitoring-SaaS: gastronomy operators (Einkaufspreis-Monitor), German SMB owners (Fördermittel-Radar), competitive ops teams (Wettbewerbs-Monitor), legal/contracts owners (Vertragsfristen-Wächter).
- Workflow-Automation: tradespeople (Angebots-Generator), local-SEO managers (Local-SEO-Autopilot), accountants (Invoice-Triage), sales teams (Lead-Enrichment-Bot).
- Data-Enrichment-API: developers and integrators (Firmendaten-Anreicherung, DACH-Adress-Validierung-Plus, SKR04 categorization).
- Dashboard & Reporting: vertical operators with multi-source data needs (Gastro-Deckungsbeitrag, Baufortschritts-Cockpit, Webshop-Werbekosten).

### 4.3 Disqualifiers (out-of-scope for V1)
- Enterprise IT buyers (procurement cycle, SOC2 attestation requirements V1 cannot meet).
- Pure consumer apps.
- Markets outside DACH-EU for V1 (German-language compliance is the build's first-class concern).

## 5. Scope: V1 / V2 / V3

### 5.1 In scope for V1
- **One template:** Monitoring-SaaS (§7.3).
- **Foundation Layer** complete: multi-tenant auth, tenant isolation, Stripe Billing, DSGVO compliance kit, support widget, observability, security baseline, admin backoffice, transactional + marketing email, DE/EN i18n.
- **Outreach Engine** with 5 channels live: Meta Ads, Lifecycle Email, SEO Blog (2 articles/week, human-approved), LinkedIn organic (3 posts/week), X organic (1–2 posts/week). Plus directory listings (manual) and Product Hunt (one launch per product, 4–6 weeks post go-live).
- **Pattern Library** seeded with ~10 patterns; weekly pattern-promotion ritual.
- Human-in-the-loop launch approval for every product.

### 5.2 V2 additions
- Three more templates: Workflow-Automation (§7.4), Data-Enrichment-API (§7.5), Dashboard & Reporting (§7.6).
- Google Ads (Search + Performance Max + YouTube).
- Cold email channel — gated on lawyer-reviewed compliance framework.
- Communities/forums channel with strict rules.
- Lifecycle email A/B testing maturity; 90% of SEO content auto-approved with sampled human review.
- Automated optimization for directory listings.

### 5.3 V3 additions
- Cold email at scale with full legal compliance stack.
- Automated low-risk community replies (after track record).
- Automated content gates and review.
- Operating goal: 3–5 new live products/month, ≤ €15,000 platform monthly opex.

### 5.4 Explicitly out of scope (V1)
- Cold email outreach (legal complexity).
- Communities and forum participation (authenticity risk).
- Google Ads (deferred to V1.5 / V2).
- Facebook organic (ROI too low).
- Audience Network ad placements (excluded from Meta).

## 6. System architecture overview

### 6.1 Three-layer catalog architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3 — Pattern Library (compounding, horizontal)        │
│  Email digest, CSV import, webhook receiver, API poller,    │
│  LLM extract, approval queue, timeline view, onboarding     │
│  wizard, scheduled report, Slack integration, ...           │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Templates (vertical product archetypes)          │
│  Monitoring-SaaS │ Workflow-Automation │ Data-Enrichment-API│
│  Dashboard & Reporting │ ...future templates                │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Foundation (single shared monorepo package)      │
│  Auth, tenant isolation, billing, DSGVO, support,           │
│  observability, security, admin, email, i18n                │
└─────────────────────────────────────────────────────────────┘
```

- **Foundation:** changes rarely, centrally maintained, updates flow automatically to every product on next deploy. _Critical:_ DSGVO toolkit (cookie consent TCF 2.2, Impressum, Datenschutzerklärung, AGB, Auskunfts-/Löschungs-/Datenportabilität flows, consent ledger), DKIM/SPF/DMARC setup, secret management, structured logging (pino), OpenTelemetry, Sentry.
- **Templates:** each is a separately versioned package depending on Foundation and optionally consuming Patterns. Each ships seven mandatory artifacts (§7.2).
- **Pattern Library:** compounding asset. Pattern promotion is **the most important weekly ritual** for long-term moat strength.

### 6.2 Build pipeline (BuildSpec → live product)
The Build Orchestrator runs an 11-step pipeline; every step is logged to `agent_runs` with inputs, outputs, and cost. See §8.2.

### 6.3 Agent orchestration (referenced)
The pipeline relies on multiple agents whose detailed responsibilities are defined in the **V1 Base Briefing**. Roles surfaced by Addendum II:
- **Architect Agent** — produces / iterates BuildSpecs.
- **Build Orchestrator** — configures templates from BuildSpec; never writes products from scratch.
- **Implementer Agents** — extend templates within strict bounds (extension points only).
- **Reviewer Agent** — rejects out-of-bounds extensions; flags pattern-promotion candidates.
- **QA Agent** — runs scripted Playwright user journeys against staging.
- **Release Agent** — cuts production DNS and activates outreach.
- **Operations Agent** — handles support, monitoring response, runbook execution.
- **Core Message Agent** — generates the canonical brand/marketing payload.
- **Channel Agents** — Meta Ads, Google Ads, Cold Email, Lifecycle Email, Content (SEO), Social, Community, Lead Sourcing, Personalization.
- **Portfolio Control Plane** — cross-product budget enforcement and unified reporting.

_[Open: Base Briefing] — formalize agent inputs/outputs, prompt versions, eval suites, and budget ledger._

### 6.4 Two-surface platform topology
The system has **two distinct user-facing surfaces**, each with its own routing, auth boundary, branding, and observability:

| Surface | Audience | Domain pattern | Examples |
| --- | --- | --- | --- |
| **Operator Console** (the ZECB platform itself) | Solo founder / studio operator | `app.zecb.io` (operator's chosen primary) | BuildSpec authoring, Build Pipeline status, Launch Approval, Portfolio Control, Outreach review queues, Pattern Library |
| **Instantiated Product** | End-customers of a shipped SaaS | `app.<product_domain>` + `www.<product_domain>` | Tenant signup/login, Monitoring dashboard, alert rule builder, review inbox, billing portal |

The Operator Console is **never** intermingled with an instantiated product's UI — they are separately deployed, separately branded, separately rate-limited, and separately monitored. Operator actions log to the platform's `agent_runs` and audit trail; end-customer actions log to the product's CDP/event store. Cross-surface joins (e.g. portfolio CAC reports) happen only through aggregated, tenancy-respecting views.

## 7. Functional requirements — Build Engine

### 7.1 The seven mandatory template artifacts
A template ships only when **all seven** exist, are documented, and are exercised by a passing test suite.

| # | Artifact | Purpose |
| --- | --- | --- |
| 1 | **Code scaffold** | TypeScript monorepo package; documented, typed extension points; Reviewer Agent rejects out-of-bounds extensions |
| 2 | **Configuration schema** | JSON Schema (draft 2020-12); Build Orchestrator validates every BuildSpec before dispatch |
| 3 | **Workflow library** | Pre-built tested workflow components (data-source connectors, alert evaluators, pipeline steps) with stable interfaces, eval suites, cost characteristics |
| 4 | **UI pattern kit** | shadcn/ui-based React components; typed; theme-aware (light/dark); i18n-ready; WCAG-AA-audited |
| 5 | **Prompt and eval package** | Versioned prompt templates with variable slots; few-shot examples; structured output schemas; min 50 graded eval examples per prompt; regression-tested on update — drops > 2% block release |
| 6 | **Operations runbook** | Alert interpretation guide, 20–40 canned-with-variables support replies, recurring maintenance jobs, incident severity matrix, escalation triggers |
| 7 | **Marketing & onboarding kit** | Landing-page section library (3–5 variants per section), onboarding flow patterns, lifecycle email sequences (5-email welcome, 3-email re-engagement, 2-email churn-prevent), in-app help |

### 7.2 Build Orchestrator pipeline (11 steps)

| Step | Output | Failure mode |
| --- | --- | --- |
| 1. Schema validation | Validated BuildSpec | Errors returned to Architect with field paths |
| 2. Product registry creation | `products` row (status=building), budget envelopes | — |
| 3. Infrastructure provisioning | Postgres schema (RLS), Redis namespace, BullMQ queues, R2 prefix, k8s namespace + quotas, DNS, Stripe products, Postmark/SendGrid sender domains, scoped secrets | Provisioning idempotent; partial fail rolls back |
| 4. Product repo init | Git repo containing only product-specific files (`product.config.yaml`, `branding/`, `content/`, `data-sources.config.yaml`, `alert-primitives.config.yaml`, `pricing-tiers.yaml`, `extensions/`); template consumed as pinned npm dep; product code 300–800 LOC |
| 5. Data source config + smoke fetch | Each source instantiated, single fetch verified | Failures sent back to Architect before any user sees product |
| 6. Alert primitive wiring | Rule-builder UI exposes only enabled operators | Rule evaluator unit tests |
| 7. Onboarding flow generation | Wizard with product copy + sample data source for "use example" | Time-to-value < 2 min is hard KPI |
| 8. Marketing site generation | Next.js site at `www.<product_domain>` with copy/pricing/branding | Separate from app |
| 9. Knowledge base init | Ops Agent KB seeded (~60 standard QA + product-specific) | LLM analysis of BuildSpec for product-specific entries |
| 10. Integration test suite | Playwright journey: signup → email verify → onboarding → first source → first rule → first notification → upgrade → cancel → export → delete | Failures block launch |
| 11. Launch approval (HITL in V1) | Dashboard: staging URL, QA report, marketing preview, Stripe setup, first-fetch results, monthly cost estimate | On approve, Release Agent cuts DNS + activates GTM |

### 7.3 Template 1 — Monitoring-SaaS (V1)
**Identity.** Passive-observation product class. Watches data sources on a schedule, detects changes/anomalies via user-defined rules, notifies via chosen channels, maintains searchable history.

**Why first.** Widest SMB-niche coverage, predictable unit economics, deterministic core workflow → well-suited to agentic instantiation.

**Supported product examples (DACH SMB focus).**
- Einkaufspreis-Monitor (wholesale price tracking: Metro, Transgourmet)
- Fördermittel-Radar (federal/state/EU funding databases)
- Wettbewerbs-Monitor (competitor sites, pricing, jobs)
- Vertragsfristen-Wächter (contract date extraction + deadline alerts)
- Lieferanten-Compliance-Monitor (supplier certifications, ESG)
- SEO-Rank-Tracker (local Google rankings)
- Regulatory-Change-Radar (vertical-specific authority publications)

**Configuration schema (BuildSpec).** Full `MonitoringSaaSBuildSpec` JSON Schema in Appendix B. Required fields: `product_slug`, `data_sources`, `alert_primitives`, `notification_channels`, `pricing_tiers`, `branding`. Optional: `onboarding`, `integrations_requested`.

**Core components.**

1. **Data Source Framework.** Common `DataSource` interface; framework owns scheduling, retries, rate limiting, credentials, history writing. Product-specific sources are new implementations of the interface, not framework rewrites. V1 implementations: `HttpApi` (REST polling with JSON-path, pagination, ETag/Last-Modified), `Webscrape` (HTTP + Cheerio, optional Playwright, change detection via content hashing, robots-respecting), `RSS` (conditional requests, GUID-dedup), `EmailInbound` (forward addresses, MIME parsing, attachments), `CsvUpload` (mapping UI, schema validation, batch ingest), `GoogleSheets` (OAuth, delta via revision history), `PdfWatch` (URL polling + pdfplumber + LLM structured extraction).

   Interface sketch:
   ```ts
   interface DataSource {
     readonly kind: DataSourceKind;
     readonly id: string;
     readonly tenant_id: string;
     validate(config: unknown): Promise<ValidationResult>;
     fetch(context: FetchContext): Promise<FetchResult>;
     normalize(raw: FetchResult): Promise<NormalizedObservation[]>;
     estimateCostPerFetch(): CostEstimate;
   }

   type FetchResult = {
     raw_payload: unknown;
     fetched_at: string;
     http_status?: number;
     fetch_duration_ms: number;
     retries_used: number;
   };

   type NormalizedObservation = {
     data_source_id: string;
     observed_at: string;
     dimensions: Record<string, string>;   // e.g. { product_sku: "...", supplier: "..." }
     measures: Record<string, number | string | boolean>;
     raw_ref?: string;   // R2 URL to archived raw fetch
   };
   ```

2. **Scheduler.** BullMQ-based; per-tenant scheduling at configured frequency. Tier limits: free → 24h, premium → 5min. Jobs idempotent, replayable, telemetry-emitting.

3. **Diff and Anomaly Engine.** Three strategies — deterministic diff (compare to N most-recent), statistical anomaly (rolling mean+stddev, sigma threshold), semantic change (LLM-compared text fields, used sparingly for cost).

4. **Rule Engine.** Small DSL — expressive enough for SMB cases, constrained enough for deterministic cheap evaluation. YAML surface; example primitives:
   ```yaml
   - name: "Preissprung bei Mehl"
     when: observation.dimensions.product_sku == "mehl-405"
     trigger: measures.price_eur > previous.measures.price_eur * 1.1
     notify: email
     throttle_minutes: 1440

   - name: "Neue Förderung passt"
     when: observation.dimensions.program_category == "digitalisierung_kmu"
     trigger:
       all:
         - measures.funding_eur_min >= 5000
         - measures.deadline_days_remaining >= 14
     notify: [email, slack]
     throttle_minutes: 0

   - name: "Wettbewerber-Preis drop"
     when: observation.dimensions.competitor == "competitor_a"
     trigger: measures.list_price < previous.measures.list_price
     notify: slack
     include_history: true
     throttle_minutes: 360
   ```
   Operators: `threshold`, `change_rate`, `absence`, `presence`, `regex_match`, `semantic_match`, `statistical_anomaly`, `deadline_approaching`. Enabled set per BuildSpec gates the rule-builder UI.

5. **Notification Fanout.** Channel-agnostic; renderer per channel (email/Slack/webhook/SMS/WhatsApp/in-app/Teams/Telegram). Postmark/SendGrid/Twilio backends with per-product rate limits and retry.

6. **History & Timeline.** Per-product partitioned Postgres time-series table; UI with date/source/status filters, search, export. Retention by pricing tier.

7. **Reporting.** Scheduled daily/weekly/monthly digests via the Scheduled Report Pattern.

### 7.4 Template 2 — Workflow-Automation-SaaS (V2)
**Identity.** **Active** counterpart to Monitoring — executes work on the user's behalf. LLM-heavy, more valuable per seat, more expensive to operate, more sensitive to quality failures.

**Core workflow.** User configures trigger (schedule/event/upload) → pipeline of processing steps (often LLM-based) → output action. System runs autonomously per trigger; optional inline review gates.

**Examples.** Local-SEO-Autopilot, Angebots-Generator (Handwerker), Lead-Enrichment-Bot, Content-Repurposer, Invoice-Triage (DATEV pre-booking), Outbound-Email-Generator.

**Schema highlights** (delta from Monitoring): `pipelines` replaces `data_sources + alert_primitives`; `review_modes` for HITL; **mandatory `llm_cost_guardrails`** (per-run / per-tenant-per-day caps and auto-downshift threshold); `output_actions` enum.

**Pipeline-step library.** `fetch_context`, `http_call`, `llm_generate`, `llm_extract`, `llm_classify`, `llm_summarize`, `branch_conditional`, `loop_over`, `human_review`, `publish`, `transform_json` (JSONata/Handlebars), `rate_limit_gate`.

**Critical UX.** Unified review inbox per user — pending pipeline runs awaiting approval. Each shows input summary, generated output, diff vs original if edited, approve/edit/reject, SLA countdown. **Users who abandon review kill the value loop.**

### 7.5 Template 3 — Data-Enrichment-API (V2)
**Identity.** Developer-facing. API-only consumption. Usage-based pricing. Sub-linear support cost (developers self-serve docs). Weaker impulse-buy funnel; sticky integrations → strong retention.

**Core workflow.** Client → input (single or batch) → product-defined enrichment function (often LLM-backed) → structured result. Per-key rate limits, usage metering, async webhook callbacks.

**Examples.**
- **Firmendaten-Anreicherung:** email or domain in → company details, industry, size, tech stack out.
- **DACH-Adress-Validierung-Plus:** address string in → validated, normalized, enriched with region metadata.
- **Dokument-Klassifikation:** PDF in → document type (invoice, contract, order, delivery note) + confidence + extracted fields.
- **SKR04 Kategorisierungs-API:** transaction description in → SKR04 account suggestion.
- **Sentiment-Monitor-API:** review text in → sentiment, themes, urgency, response priority.

**Schema highlights.**
```yaml
enrichment:
  input_schema:  { "$ref": "./schemas/input.json" }
  output_schema: { "$ref": "./schemas/output.json" }
  modes: ["sync", "async_batch"]
  sla_target_ms_p95: 1500
  cost_per_call_eur_target: 0.02
pricing:
  model: "usage_based"
  tiers:
    - { name: "Free",    monthly_calls_included: 100,    per_call_over_eur: 0     }
    - { name: "Starter", monthly_fee_eur: 49,  calls_included: 2500,  per_call_over_eur: 0.015 }
    - { name: "Growth",  monthly_fee_eur: 199, calls_included: 15000, per_call_over_eur: 0.010 }
    - { name: "Scale",   monthly_fee_eur: 799, calls_included: 100000, per_call_over_eur: 0.005 }
developer_experience:
  docs_generator: "openapi"
  sdk_languages:  ["typescript", "python"]
  playground:        true
  postman_collection: true
```

### 7.6 Template 4 — Dashboard & Reporting-SaaS (V2+)
**Identity.** Integration-heavy. Value comes from integration breadth and metric sharpness. Most competitive category — only justified for clearly specific, under-served needs. Schema explicitly forbids unfocused dashboards.

**Examples.**
- **Gastro-Deckungsbeitrags-Dashboard:** inventory + POS + staff costs in one view.
- **Baufortschritts-Cockpit:** project milestones + spend + supplier delivery for building companies.
- **Webshop-Werbekosten-Dashboard:** Meta + Google + internal margin in one view.
- **Social-Media-Effectiveness-Dashboard:** platform metrics + brand mentions + sentiment.

**Core components.** 20+ pre-built integration connectors (Meta Ads, Google Ads, Stripe, Shopify, DATEV, personio, HubSpot, Slack, GA4, …); ETL with incremental sync; metric definition DSL (formulas on normalized data models); dashboard builder (KPI card, time series, bar, funnel, cohort, geo); scheduled PDF/HTML/email reports; **white-label capability** (agencies → SMB clients = important secondary ICP).

### 7.7 Pattern Library (V1 seed)
Horizontal building blocks. Compound across builds — ~40–60 patterns by build #10, > 200 by build #50.

V1 seed set:
- Email Digest
- CSV Import / Export
- Webhook Receiver (signed, replay-protected)
- External API Poller (rate-limited, backoff, durable)
- LLM Extract (structured, schema-validated)
- Approval Queue (review UI)
- Timeline View (chronological with filters/export)
- Onboarding Wizard (multi-step, save-and-resume)
- Scheduled Report (cron → PDF/CSV/HTML → email)
- Slack Integration (OAuth, channel selection, formatted messages)

### 7.8 Template governance
**Adding a template** requires all of: ≥ 3 validated business opportunities (positive-unit-economic MarketSignalReports) that no existing template can serve; distinct core workflow (not a minor variation); Foundation absorbs without architecture change; estimated ≤ 4 weeks to build-and-validate; eval suite + runbook defined before code is written.

**Versioning.** Every template has semver. Breaking changes → major bump. Products pin to a major; upgrade on schedule with regression tests. Security fixes mandatory and applied within 48h to all live products. Non-security changes are opt-in until next major.

**Deprecation.** Allowed when no new product built from the template for 90+ days and all existing products migrated/killed. Code is frozen, never deleted (auditability).

**Pattern promotion (weekly ritual).** Reviewer Agent flags candidates during builds. Each Friday, founder approves/rejects the queue. Approved → extracted into Pattern Library. **This is the single most important weekly ritual for the system's long-term moat.**

### 7.9 Operator Console (platform UI)
The control-plane UI the operator uses to drive the platform. It surfaces only what an operator can act on; agent automation drives the underlying work. Every screen logs to the platform audit trail.

| Screen | Purpose | Key actions |
| --- | --- | --- |
| **Idea Inbox** | Capture validated opportunities from the Architect Agent (`MarketSignalReport`) | Approve / reject / annotate; promote to BuildSpec draft |
| **BuildSpec Authoring** | Compose / iterate the BuildSpec for a candidate product | Schema-validated form; "save draft", "validate", "dispatch to Build Orchestrator" |
| **Build Pipeline Status** | Live state of the 11-step pipeline per product | View per-step input/output, retry, abort; cost ledger per step |
| **Launch Approval Dashboard** | HITL launch gate (V1) | Staging URL, QA report (Playwright), marketing site preview, Stripe setup, first-fetch sample, monthly cost estimate; approve / reject / request fix |
| **Portfolio Control Plane** | Cross-product unified view | Per-product budget vs spend, CAC by channel and channel-sequence, LTV, lifecycle-stage mix, drift alerts |
| **Outreach Review Queues** | Weekly approval rituals | Pattern promotion, SEO/social content approval, Message-Propagation candidates, channel proposals |
| **Pattern Library Browser** | Catalog of horizontal patterns | Search, view eval results, version history, source builds |
| **Template Catalog Browser** | Layer-2 templates | Version status, eval pass-rate, products built per template, deprecation status |
| **Audit Trail / Agent Runs Ledger** | All `agent_runs` for forensics + unit-economics analysis | Filter by agent / product / time / cost; export |
| **Operator Settings** | Auth, billing, integrations, secrets, team | Stripe customer, OAuth tokens, MFA, holding-wide preferences |
| **Compliance Gates** (V2 cold email) | Hard gate before activating regulated channels | Lawyer sign-off attached, recipient filter set, frequency cap configured, opt-out wired — no activation without all green |

**Two-surface boundary.** This UI lives only at the operator domain. End-customer flows never see the Operator Console; the Operator Console never embeds raw product-tenant data — it reads aggregated CDP/`agent_runs` views with tenancy stripped.

## 8. Functional requirements — Outreach Engine

### 8.1 Design philosophy
A well-built SaaS with no distribution is **worse** than a poorly-built SaaS with distribution, because distribution is the feedback loop that fixes the product. The Outreach Engine is therefore not optional, not secondary, not "later". The primary failure to avoid is silo-running each channel; the Engine centralizes three things:

1. **Core Message** — what we say (one source of truth per product).
2. **Attribution Layer** — what we measure (one CDP, one model).
3. **Orchestration** — what we learn and redistribute (cross-channel propagation + frequency cap + sequence-aware stage progression).

### 8.2 Core Message — single source of truth

**Generated once at launch** by the Core Message Agent from: winning landing-page variant, all MarketSignalReport qualitative data, all email responses from validation, top-3 ad creatives, BuildSpec. Schema-validated. Human approves v1 before any channel activates.

**Updated** when a channel discovers a better hook (v+1, human-reviewed), when qualitative data reveals new objections, or on material product change. Channels pin to a version and opt into upgrades.

**Structure** (full JSON in Appendix C). Top-level keys:
- `product_id`, `version`, `created_at`, `created_from` (validation_package_id, winning variants, top hooks, top email themes)
- `target_audience` — primary persona, alternative personas, **disqualifiers**
- `pain_statements` — `calm` / `pointed` / `provocative`
- `core_promise` — `tweet` (≤ 240 chars) / `sentence` (≤ 80 words) / `paragraph` (≤ 200 words) / `full_page` (≤ 600 words)
- `proof_elements` — array of `{ type: mechanism | number | comparison | testimonial_placeholder, content }`
- `objection_rebuttals` — `{ objection, rebuttal, frequency_seen }`
- `calls_to_action` — three commitment levels (low/medium/high)
- `brand_voice` — tone, avoid, examples (good/bad)
- **`forbidden_claims`** — e.g. "100% accuracy", "GDPR certified", "AI-powered" where unsubstantiated

### 8.3 Attribution Layer — single source of measurement

**Why central CDP is non-negotiable.** Platform-reported conversions double-count, ignore view-through, and cannot measure cross-channel sequences. Without owned attribution, budget decisions sit on garbage data.

**Stack.** PostHog self-hosted as the sole truth for acquisition.

**Event schema.** First-party `session_id` cookie + server-side device fingerprint backup; per event: `timestamp`, `product_id`, `channel`, `campaign_id`, `ad_id`, `creative_id`, `utm_*`, `landing_variant_id`, `referrer`, `viewport`. Events: `impression`, `click_in`, `page_view`, `scroll_depth`, `time_on_page`, `cta_click`, `lead`, `signup`, `activation`, `trial_start`, `trial_end`, `subscribe`, `upgrade`, `downgrade`, `churn`, `support_contact`.

**Attribution model.** Position-based multi-touch — **40% first-touch, 40% last-touch, 20% middle**, 60-day window. V1 default; per-product configurable once data accumulates. Platform conversions stored separately as "observed on platform" — never used for budget decisions.

**Profile unification.** PostHog `distinct_id` ↔ `person_id` merge on signup → unified anonymous + identified history → cross-channel decisions in §8.10.

### 8.4 Channel 1 — Paid Meta Ads (V1)
**Role.** Primary V1 acquisition for B2C-adjacent SMB (restaurants, retail, trades, local services). Fast feedback, clear cost, robust API. Cookie signal degraded → **internal attribution is critical**.

**Per-product structure.**
```
Campaign: <product_slug>_acquisition_<launch_date>
  Objective: Conversions (primary), Leads (secondary, low-commitment)
  Ad Set A: <primary_segment>_<interest_1>     [€20/day initial]
    Audience:  interest stack from primary_persona
    Placement: Feed + Reels + Stories (no Audience Network)
    5 ads / hook variations from pain_statements
    Copy: headline + primary_text + description from Core Message projections
    CTA: matching commitment level for stage
  Ad Set B: <primary_segment>_<interest_2>
  Ad Set C: <primary_segment>_<lookalike_email_list_when_available>
```

**Meta Ads Agent responsibilities.** Campaign creation at launch from Core Message + BuildSpec; daily budget rebalancing; underperforming ad rotation (pause < ad-set-mean CTR by > 30% after 3k impressions); weekly creative generation (2 new ads per ad set against fatigue); audience expansion proposals on CPA up-trend; retargeting for 14-day non-converting visitors; **scaling trigger** — 7-day rolling CPA < 50% of target → propose 2× budget to Portfolio Control.

**Budget guardrails.** Per-product daily cap at Meta Business Manager; per-product monthly cap at Portfolio Control (auto-pause on hit); any > 50% campaign change requires human approval; CPA up > 25% over 7 days → Portfolio Control review.

### 8.5 Channel 2 — Paid Google Ads (V1.5 / V2)
**Role.** **Intent-based** counterpart to Meta. Higher CPC, higher CVR. Three sub-channels:
- **Search:** highest intent, core driver for most SMB SaaS.
- **Performance Max:** broad coverage once Core Message + creative assets stable.
- **YouTube:** explainer ads once 30s and 60s video assets exist.

**Agent responsibilities.**
- **Keyword research** at launch from Core Message + audience → three tiers: high-intent problem queries, category queries, competitor queries (with regional trademark policy compliance).
- Initial campaign per language/region:
  ```
  Campaign: <product>_search_de_de
    Ad Group: problem_queries
      Keywords: broad-match-modifier + phrase match (no broad match)
      Ads:      3 RSAs / 12 headlines + 4 descriptions each (from Core Message)
      Negatives: jobs, kostenlos, free, tutorial, definition, "meaning", "what is"
      LP:        /lp/search-<keyword_theme>
    Ad Group: category_queries
    Ad Group: competitor_queries (pending trademark review)
  ```
- **Bidding:** Target CPA seeded from Meta learnings.
- **Budget:** €15–30/day per campaign.
- **Extensions:** sitelinks, callouts, structured snippets, call extension, lead-form extension for low-commitment offers.

**Landing page variant routing.** Search → "problem-aware" LP (assumes user is searching for a solution). Meta → "problem-identify" LP (reminds user of the problem first). Routed by `utm_source` → LP mapping.

**Quality Score management.** Monitor per-keyword QS; escalate clusters with QS < 5. Remediation: tighten themes, improve RSA relevance, fix LP load speed, improve message match.

**Automated rules.** Pause keyword with > 100 clicks and 0 conversions; bid up keywords with CVR > campaign-mean and QS ≥ 7; weekly negatives from Search Terms Report; pause RSA with CTR < ad-group-mean by > 40% after 5k impressions.

**Guardrails.** Mirror Meta — daily cap at account level, monthly at Portfolio Control, structural changes require human approval, CPA-deterioration alert.

### 8.6 Channel 3 — Cold Email (V2)
**Role.** Most consequential channel for higher-ticket B2B SMB (€200+/mo ICPs). **Designed in from day 1, switched on in V2 by configuration only.**

**Legal framework (CRITICAL — do not skip).** Governed by UWG, DSGVO, ePrivacy. Encoded in the Engine as gating rules:

| Rule | Requirement |
| --- | --- |
| Recipient filter | Role-based addresses or addresses publicly published for business purposes only. No private-looking addresses, no scraped personal addresses |
| Relevance filter | LLM-based match score > 0.8 between recipient company profile and product target_segment |
| Frequency cap | Max 2 emails / recipient / product / 12 months. Holding-wide: 4 / recipient / 12 months across all products |
| Opt-out | One-click unsubscribe in every email. Unsubscribed addresses **permanently blocked across all current and future holding products**. List lives in Foundation |
| Imprint/identity | Full Impressum footer, truthful sender, no pretextual subject lines |
| Audit log | Every send logged ≥ 3 years with legal basis, match score, content hash |

**Hard blocker:** lawyer-reviewed compliance framework required before activation. Cold email at scale in EU without it can take down the whole holding.

**Infrastructure (dedicated, never shared).**
- Per-product sending domains (`outreach.<product_domain>`) with own SPF/DKIM/DMARC. Holding's primary domain never used for cold outreach.
- Inbox warmup: 4–6 weeks of realistic conversation-style traffic before any volume. Choose Instantly/Lemlist/Smartlead in V2.
- Per-inbox cap: start 30 emails/day → max 80/day. Multiple inboxes per product for scale.
- Reply handling: per-product shared inbox monitored by Operations Agent; classifies and responds to informational replies, escalates buying-signal replies.
- Bounce/complaint monitoring: hard bounces > 3% or complaints > 0.1% → auto-pause + investigate.

**Campaign template.**
```
Campaign: <product>_cold_<segment>_<batch>
  List size: 500–2000
  Sequence: 3 emails, 4–6 days apart
    Email 1 — problem identification (pain_statements.pointed)
    Email 2 — proof and mechanism (proof_elements)
    Email 3 — specific offer (low-commitment CTA)
  Personalization: first name + company + one first-line variable
                   (LLM call ≤ €0.01/recipient on public profile)
  Sending: spread 5–8 business days, recipient-tz business hours,
           30s randomized delay between sends
  Reply SLA: Operations Agent responds to informational replies in
             ≤ 4 business hours; positive replies escalate to booking link
```

**Lead sourcing.** LinkedIn Sales Navigator exports (respect ToS — no direct scraping); Apollo / Clay / Ocean.io with documented provenance; Handelsregister + branch-specific public registries (DACH); industry-association directories with explicit business-contact publication; CDP-driven lookalike expansion once customers exist. Every record carries `source`, `publication_evidence_url`, `match_score`, `legitimate_interest_rationale`.

### 8.7 Channel 4 — Lifecycle Email (V1)
**Role.** Retention backbone. Every product ships with the full lifecycle program from day 1.

**Sequence library** (template-provided, product-customized at build from Core Message + `product.config.yaml`):

| Class | Sequences |
| --- | --- |
| Transactional | Welcome/verify; password reset; subscription receipt/invoice; payment failure (3-email dunning); cancellation confirm; account-deletion confirm; team invitation |
| Activation (D0–D14, 5 emails) | D0 welcome + first-value prompt → D1 feature walkthrough → D3 customer story (synthetic until real) → D7 common pitfalls → D14 trial-end + upgrade |
| Re-engagement (3 emails, 14-day inactivity) | Soft nudge → value reminder (metric of what they could've achieved) → pause/downgrade offer instead of churn |
| Churn-prevention | Empathy + reason survey → conditional response (price → discount; feature gap → roadmap; competitor → fight or concede) |
| Newsletter (optional, opt-in) | Repurposed from SEO. **DE: unchecked-by-default to comply with double-opt-in** |

**Sending discipline.** Transactional via Postmark; marketing/lifecycle via SendGrid (separate IP pool). Domain-aligned from-address with DKIM+DMARC. Granular preference center; global unsubscribe kills all marketing. A/B testing on activation-sequence subject + first paragraph; winners promoted on significance.

### 8.8 Channel 5 — SEO Blog & Content (V1)
**Role.** Only acquisition channel with **compounding returns**. Slow start (meaningful traffic in month 4–6+), eventually lowest-CAC channel for most SMB SaaS. Invested in from day 1.

**Strategy.** Keyword Gap Analysis from Loop 1 + Loop 2 (defined in Base Briefing). Content Agent operates from a rolling plan — never ad-hoc.

**Content categories.**
- **Problem-aware** (majority): 1500–3000 words, pain queries. Example: _"So erkennen Gastronomen Preissprünge bei Lieferanten"_.
- **Solution-aware:** 800–1500 words, comparison / "best-of" queries. Example: _"5 Methoden, um Einkaufspreise in der Gastro zu überwachen"_.
- **Tool / how-to:** 1000–2000 words, transactional queries. Example: _"Metro-Preisliste automatisch überwachen: Schritt-für-Schritt-Anleitung"_.
- **Data / research posts:** original analysis from product data when available — strongest for backlinks. Example: _"Einkaufspreis-Entwicklung DACH-Gastro H1 2026: Analyse von 12.000 Preispunkten"_.

**Pipeline.** Weekly keyword research (Search Console + ahrefs/DataForSEO) → topic planning (2 articles/week with target keyword, category, outline, internal linking) → draft via LLM against strict brief → Reviewer Agent quality check → human approval (V1) / 10% sample (V2) → headless CMS publish (Payload, Ghost, or Next.js MDX) with schema markup, OG, reading time → distribution (LinkedIn auto-promo, newsletter teaser, 3 social posts) → weekly performance check; underperforming content rewritten after 90 days.

**Technical SEO baseline (automated).** Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms (regressions alert). Structured data: Article, Organization, BreadcrumbList, FAQ where applicable. Auto-suggested internal linking (semantic similarity, 3–5/article). Auto-generated sitemap (auto-submit GSC/Bing). Canonical, robots, hreflang for DE+EN.

**Anti-AI-collapse guardrails.** Min original data/screenshots per article (reject pure prose); required first-person product claims with specifics; no "In this article we will…" intros; forbidden phrase list ("delve", "navigate the complexities", "in today's fast-paced world"); real attributable author byline (founder or named beta users with consent); cap 2 articles/week per product in V1.

### 8.9 Channels 6–8 — Organic Social, Community/Forums, Directories
**Channel 6 — Organic Social (V1).** LinkedIn primary (3 posts/week from SEO + product insights + founder voice). X secondary (1–2 posts/week, dev-tool products + founder presence). Instagram/TikTok case-by-case for consumer-adjacent verticals. Facebook organic explicitly excluded (ROI).

**Content sources.** Every SEO blog article → 3 LinkedIn posts (hook + body + CTA) and 5 X posts (one per angle). Weekly product-metric or user-outcome posts (with consent). Industry commentary: Content Agent scans industry news daily, suggests commentary posts when a relevant story matches the product's narrative. Behind-the-scenes: data or chart-based posts showing product insights.

**Authenticity rules:** specific details (numbers, names, observations) — never generic; consistent named persona per product; human-like posting randomness; no auto-comments on others' posts in V1; only real screenshots, never stock AI imagery.

**Channel 7 — Community / Forums (V2+, V1 OUT).** Highest authenticity-risk channel. V1 excludes; V2 enables with heavy guardrails. **Rules:** one disclosed-identity persona per product (no anonymous); only communities where audience already is + promotion explicitly allowed/tolerated (NOT r/SaaS, r/Entrepreneur); 10:1 helpful-contribution-to-mention ratio (tracked); transparent operator disclosure on every product mention; **never** upvote manipulation, multi-account, fake testimonials, astroturfing; Community Agent drafts → operator reviews every post in V2; V3 may automate low-risk replies after track record.

**Channel 8 — Directories & Reviews (V1).** Underrated for SMB shortlist trust signal. V1 targets: Product Hunt (one launch per product, 4–6 weeks post-go-live, after genuine traction); G2 + Capterra listings at go-live; vertical directories per template. **Review generation built into lifecycle email** — activated users active ≥ 14 days get gentle review request; pre-filled G2/Capterra flow; **incentives nothing transactional** (discounts violate ToS) — submitters get early access to features. Negative review handling: Ops Agent auto-responds publicly with offer-to-resolve-privately, escalates internally.

### 8.10 Cross-channel orchestration

**Message Propagation Loop (weekly cron).** Top-N performers per channel → propagation candidates → human approval (V1):
- Top ad headline → tested as LP H1 → tested as email subject → promoted to `pain_statements` if winning after 14 days.
- Top SEO article → sliced into LinkedIn posts + X threads + newsletter issue.
- Top email subject → tested as ad primary text.
- Common email-reply objections → added to `objection_rebuttals` → trigger LP FAQ + ad copy updates.

**Cross-channel Frequency Cap.** Without coordination, a prospect could see 30 Meta + 15 Google + 8 LinkedIn + 4 retargeting emails per week. CDP enforces:
- Max 25 paid impressions / person / week across all paid channels.
- Retargeting stops after 3 weeks without conversion.
- Converted users auto-removed from acquisition audiences.
- Churned users removed from acquisition retargeting for 90 days.

**Sequence-aware stage progression.** CDP event patterns detect stage; routing is automatic.

| Stage | Content treatment |
| --- | --- |
| Unaware | Awareness content (problem-aware ads, top-of-funnel blog) |
| Problem-aware | Solution content (comparison ads, mechanism videos, solution blog) |
| Solution-aware | Product content (feature ads, screenshots, review content) |
| Evaluating | Trust content (testimonials, demos, risk-reversal offers) |
| Customer | Activation + expansion (feature education, upsell sequences) |

**Unified performance reporting.** Portfolio Control Plane outreach view per product: CAC by channel **and** by channel-sequence; LTV by first-touch **and** by multi-touch attribution; channel contribution to activation/conversion/retention; content top performers; creative fatigue indicators (CTR decay, time-to-fatigue).

### 8.11 Three-phase launch arc

| Phase | Window | Goal |
| --- | --- | --- |
| 1. Ignition | Week 1–4 | Maximum channel diversity at minimum budget per channel. **Signal collection, not conversion maximization.** Budgets sized for statistical significance |
| 2. Consolidation | Month 2–3 | Hard selection. Weak channels/segments paused. Reallocate to 2–3 winners. Sharpen messaging from Phase 1 signal. **Unit economics check — product proves itself or gets mutated** |
| 3. Scale or Kill | Month 4+ | If unit economics sustain → 2–5× budget on winners + content production scale + adjacent-segment second template. If not → pricing / segment / positioning mutation, or product kill |

### 8.12 Anti-patterns (forbidden — governance alert on detection)
- Mass-generated lookalike blog content identical in structure to 100 other products' blogs.
- Cold email sequences > 3 emails or > 2× / year to same recipient.
- Direct LinkedIn user-data scraping (ToS + legal).
- Purchasing reviews, followers, engagement.
- Sending to purchased lists of unverified provenance.
- Multi-account Reddit/forum manipulation.
- Competitor trademarks in ad copy without legal review.
- Medical/legal/financial claims without substantiation.
- Bait-and-switch landing pages (claim ≠ ad).
- Deceptive urgency (fake countdowns, fake "3 others viewing").

### 8.13 V1 Outreach scope checklist

| Channel | V1 | V2 |
| --- | --- | --- |
| Meta Ads | IN — full campaign automation | Expanded creative generation, lookalikes |
| Google Ads | OUT — defer | IN — full (Search + PMax + YouTube) |
| Cold Email | OUT — defer until legal review | IN — with full compliance stack |
| Lifecycle Email | IN — full sequences | A/B testing maturity |
| SEO Blog | IN — 2 articles/week per product, human-approved | Automated approval for 90% of content |
| LinkedIn organic | IN — 3 posts/week, human-approved | Automated posting with human sampling |
| X organic | IN — 1–2 posts/week, human-approved | Same |
| Communities/Forums | OUT — too high authenticity risk | IN with strict rules |
| Directory listings | IN — initial submissions, manual | Automated optimization |
| Product Hunt launches | IN — one per product at 4–6 weeks | Same |
| Review generation | IN — lifecycle integrated | Same |

## 9. Data model (high level)

| Entity | Purpose | Key fields |
| --- | --- | --- |
| `products` | Product registry | `id`, `slug`, `template`, `template_version`, `status`, `bspec_id`, `branding`, `domains`, `pricing_tier_set` |
| `tenants` | End-customer tenants of a product | `id`, `product_id`, `plan`, `limits`, `RLS keys` |
| `data_sources` | Per-tenant Monitoring source configs | `id`, `tenant_id`, `kind`, `config`, `auth_ref`, `rate_limit_per_hour`, `schedule` |
| `observations` | Time-series, per-product partitioned | `data_source_id`, `observed_at`, `dimensions`, `measures`, `raw_ref` |
| `alerts` | Triggered notifications | `id`, `rule_id`, `observation_id`, `notified_at`, `channels`, `status` |
| `pipelines` | Workflow-Automation pipelines | `id`, `tenant_id`, `trigger`, `steps`, `output_actions` |
| `pipeline_runs` | Execution instances + cost | `id`, `pipeline_id`, `started_at`, `ended_at`, `cost_eur`, `state` |
| `agent_runs` | Build/operate agent calls | `id`, `agent`, `input`, `output`, `cost_eur`, `latency_ms`, `correlation_id` |
| `core_messages` | Per-product messaging payload | `product_id`, `version`, JSON per §8.2 |
| `cdp_events` | Acquisition events (PostHog mirror) | `event`, `distinct_id`, `person_id`, `channel`, `campaign_id`, `ad_id`, `creative_id`, `utm_*`, `landing_variant_id`, `properties` |
| `unsubscribes` | Holding-wide block list | `email_hash`, `created_at`, `source_product_id` (Foundation) |
| `budget_envelopes` | Per-product build + monthly opex caps | `product_id`, `kind`, `cap_eur`, `spent_eur`, `period` |

## 10. Integrations

**Foundation-level (every product).** Clerk or Supabase Auth; Postgres (RLS); Redis; R2; Stripe; Postmark; SendGrid; Twilio; Slack; Doppler or SOPS; Sentry; OpenTelemetry; Crisp (or in-house support widget); GSC + Bing Webmaster.

**Template-specific.** Monitoring: HTTP / Cheerio / Playwright / RSS / IMAP / Google Sheets / pdfplumber. Workflow-Automation: Google Business Profile, DATEV, generic CRM connectors. Data-Enrichment-API: external data providers (Clearbit-class; vertical sources). Dashboard & Reporting: Meta Ads, Google Ads, GA4, Shopify, personio, HubSpot, Slack, plus 13+ more.

**Outreach.** PostHog (self-hosted CDP); Meta Business Manager; Google Ads; Postmark + SendGrid; Instantly / Lemlist / Smartlead (cold email); ahrefs or DataForSEO; LinkedIn Sales Navigator; Apollo / Clay / Ocean.io.

## 11. Non-functional requirements

### 11.1 Performance & SLAs
- Time-to-value (end-user first valuable action): < 2 min — hard KPI.
- Build pipeline: median ≤ 48h, p95 ≤ 72h.
- Data-Enrichment-API: p95 ≤ 1500 ms per call; cost target ≤ €0.02/call.
- SEO Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Cold-email reply SLA: ≤ 4 business hours for informational replies.

### 11.2 Security
- Tenant isolation via Postgres RLS, per-tenant Redis namespaces, per-tenant R2 prefixes.
- Per-product secret scoping (DB URL, Stripe keys, mail tokens, LLM keys).
- Rate limiting, CSRF, security headers — Foundation default.
- MFA available; SOC2-ready architecture (encrypted storage), but **not SOC2-attested in V1** — enterprise IT buyers excluded.

### 11.3 Compliance
- **DSGVO (Foundation):** TCF 2.2 cookie consent, Impressum + Datenschutzerklärung + AGB generators, Auskunftsrecht / Löschungs / Datenportabilität flows, consent ledger.
- **Email (UWG / DSGVO / ePrivacy):** §8.6 cold-email gating rules; double-opt-in for DE marketing; granular preference center; unsubscribe permanence across the holding.
- **Audit:** every cold-email send logged ≥ 3 years (legal basis, match score, content hash).
- **Content:** `forbidden_claims` enforced at Core Message level; medical/legal/financial claims blocked without substantiation.

### 11.4 Reliability & ops
- Idempotent, replayable jobs (BullMQ).
- Bounce/complaint auto-pause on email channels.
- Quality gates: integration test (§7.2 step 10) blocks launch on failure; eval-suite drop > 2% blocks template release.

### 11.5 Observability
- Structured logging (pino), OpenTelemetry tracing, Sentry error capture.
- Per-product dashboards.
- `agent_runs` ledger with cost per call (single source for unit-economics analysis).
- Portfolio Control Plane unified reporting (§8.10).

### 11.6 Cost economics (unit-level guardrails)
- Per-product build envelope and first-month operating envelope created at registry time.
- Workflow-Automation: per-pipeline-run cap, per-tenant-per-day cap, **auto-downshift to cheaper model** above threshold (mandatory `llm_cost_guardrails`).
- Personalization in cold email: ≤ €0.01/recipient.
- Semantic-change detection (LLM diff): used **sparingly** due to cost.
- Budget guardrails on every paid ad channel; > 50% campaign change requires human approval.

### 11.7 Data lifecycle, retention, and deletion
- **End-customer data** lives in per-product Postgres schemas under per-tenant RLS. History retention defaults to the tenant's pricing-tier `history_retention_days`. On cancellation, tenant data is purged within 30 days (configurable per product). Tenants exercising Löschungsrecht / Datenportabilität get full per-tenant export or purge within 30 days, audit-logged.
- **Platform data** (`agent_runs`, `core_messages`, `cdp_events`, `budget_envelopes`, `products` registry) retained ≥ 3 years for compliance and unit-economics analysis. PII fields encrypted at rest; access through the Operator Console only.
- **Holding-wide unsubscribe table** (Foundation): hashed email, lookup-only access from per-product send paths, no bulk export, no cross-product enumeration.
- **Cold-email audit log**: every send retained ≥ 3 years (legal basis, match score, content hash) — see §8.6.
- **Raw-fetch archives** (R2) per data source retained per tier; archives keyed so a per-tenant purge cleanly removes them.

### 11.8 Backup and disaster recovery
- **Postgres:** PITR with 7-day window per product schema; nightly logical dumps to R2, encrypted with per-product KMS key.
- **R2:** cross-region replication for raw-fetch archives.
- **Secrets:** Doppler/SOPS with documented break-glass per product; rotation cadence 90 days for shared keys, on-event for incident.
- **DR objectives:** RPO ≤ 1h, RTO ≤ 4h for any single product; full regional outage RTO ≤ 24h. Cold-email sending domains and DKIM keys are part of the DR scope.
- **Quarterly restore drill:** pick a random live product, restore to a staging environment from backup, run the integration test suite, document MTTR and any gaps.

### 11.9 Test strategy
| Layer | What | Gate |
| --- | --- | --- |
| Unit | Per-component (rule engine, diff/anomaly engine, schema validators, attribution model, frequency-cap enforcer) | Required before merge to template main |
| Eval | Per LLM prompt, ≥ 50 graded examples; regression on every update | > 2% accuracy drop blocks template release (§7.1 artifact 5) |
| Integration | Per template's `instantiate-script` against synthetic BuildSpecs covering happy path + each declared failure mode | Required before template version bump |
| Smoke | Per data-source connector at instantiation time (§7.2 step 5) | Failure routes back to Architect; product never reaches users |
| End-to-end (Playwright) | Per-product instantiation: signup → email verify → onboarding → first source → first rule → first notification → upgrade → cancel → export → delete | Failure blocks launch (§7.2 step 10) |
| Outreach guardrails | Anti-pattern detector on every generated artifact (§8.12); forbidden-claim validator on every Core Message version | Trip = governance alert + auto-pause |
| Compliance contract tests | Cold-email path is unreachable until V2 compliance flag is set; holding-wide unsub blocks across products; consent ledger writes on every cookie decision | Fails CI on regression |

## 12. UX, content, and onboarding

- **Onboarding wizard** is template-provided, product-customized; sample data source enables "use example" 30-second first-success path.
- **Theme & a11y:** shadcn/ui base, theme-aware (light/dark), i18n DE+EN, WCAG-AA audited.
- **Review inbox** (Workflow-Automation): the **most consequential UI** in that template — abandoned reviews kill the value loop.
- **Marketing site** is generated separately from app at `www.<product_domain>` (app at `app.<product_domain>`).
- **Voice & forbidden phrases:** enforced via `brand_voice` and `forbidden_claims`.
- **In-app help, runbook responses, and lifecycle copy** are all derived from the same Core Message + product config to prevent drift.

## 13. Constraints & assumptions

- **Region:** V1 is DACH-EU first; German-language compliance is first-class.
- **Stack:** TypeScript monorepo; Next.js (current major) for marketing + app; BullMQ; Postgres; Redis; R2; Pulumi or Terraform IaC; Kubernetes namespaces per product.
- **Approval:** human-in-the-loop for launches and channel-propagation candidates in V1; gradual automation in V2/V3.
- **Operator capacity:** founder hours are the scarce resource — every weekly ritual (pattern promotion, content approval, propagation approvals) is timeboxed.
- **Template additions are governance decisions**, not ad-hoc choices (see §7.8).

## 14. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Cold email compliance breach | Legal action, holding-wide reputational damage | V1 OUT; V2 only after lawyer-reviewed framework; encoded gating rules; dedicated infra; permanent unsub list |
| AI-content collapse (search penalties) | SEO channel collapses | Anti-AI-collapse guardrails (§8.8): original data, real authors, forbidden phrase list, 2 articles/week cap |
| Deliverability collapse on shared infra | Email fail across all products | Dedicated cold-email sending domains; Postmark vs SendGrid IP-pool separation; bounce/complaint auto-pause |
| Template misuse (over-extension) | Build time / cost explode; quality drops | Reviewer Agent rejects out-of-bounds extensions; bounded extension points; template eval gate |
| LLM cost runaway in Workflow-Automation | Negative unit economics | Mandatory `llm_cost_guardrails`; auto-downshift; per-tenant daily cap |
| Platform attribution drift | Wrong budget decisions | Owned PostHog CDP as sole truth; platform conversions stored separately, never used for budget |
| Authenticity ban (community/social) | Channel and product reputation loss | V1 excludes communities; V1 social only-likes-no-comments; disclosed-identity personas only |
| Template eval regression | Live-product quality drop | Eval-suite regression test on every update; > 2% drop blocks release |
| Cross-channel saturation | Diminishing returns, ad cost bleed | Frequency cap of 25 paid impressions/person/week; auto-removal of converters/churners |
| Operator overload (HITL bottleneck) | Pipeline stalls | Weekly rituals timeboxed; V2 auto-approval for low-risk content with sampling |

## 15. Milestones & release plan

| Milestone | Includes | Exit criteria |
| --- | --- | --- |
| **V1 (now)** | Foundation + Monitoring template + 5 outreach channels live; HITL on every launch | First product launched, V1 KPIs met (build < 72h, < €500); 10 patterns seeded |
| **V1.5** | Add Google Ads | Search campaigns live on ≥ 1 product; CPA target met |
| **V2** | + Workflow-Automation, + Data-Enrichment-API, + Dashboard & Reporting; cold email switched on; communities switched on; SEO 90% auto-approve | All four templates ship valid products; cold-email compliance signed off; ≥ 50 patterns |
| **V3** | Cold-email at scale; community auto-replies for low risk; full content gates | 3–5 new live products/month; ≤ €15k platform monthly opex; median product break-even ≤ 90 days; ≥ 200 patterns |

## 16. Open questions / follow-ups

1. **Base Briefing alignment.** Confirm agent role definitions (Architect, Implementer, Reviewer, QA, Release, Ops, Channel agents), portfolio-control architecture (§9 of Base Briefing), and budget-ledger semantics referenced throughout this PRD. _[Open: Base Briefing]_
2. **Validation Loop semantics.** The Outreach Engine consumes "Loop 1 / Loop 2 Keyword Gap Analysis" and `MarketSignalReports`. Need a normative spec for these artifacts. _[Open: Base Briefing]_
3. **Pricing reconciliation.** The marketing site exposes platform tiers (€99 / €299 / €899). The addendum specifies per-template pricing tiers for instantiated products. Confirm both scopes are intentional and surface separately in any operator-facing UI.
4. **Eval dataset sourcing.** Each prompt requires ≥ 50 graded examples. Standardize the dataset format, ownership, and refresh policy.
5. **Directory listing fees & legal review queue.** V1 directory submissions are manual — formalize an SLA and ownership.
6. **Holding-wide unsubscribe table.** Foundation-level. Confirm encryption-at-rest and lookup-only access from per-product send paths (no bulk export).
7. **White-label capability** in Dashboard & Reporting template (V2+) — secondary ICP sizing and pricing model not yet specified.
8. **Template freeze SLAs.** Spec the exact playbook when eval pass rate drops below 98%.

## 17. User stories (V1)

### 17.1 Operator persona
- **U-O-01 — Compose a BuildSpec.** As an operator, I can author a Monitoring-SaaS BuildSpec from an Idea Inbox entry, with field-level schema validation, so I can dispatch a build without leaving the console.
- **U-O-02 — Watch the build pipeline.** As an operator, I can see the live state of all 11 pipeline steps for a product with cost-per-step and links to failing artifacts, so I can decide retry / abort / escalate.
- **U-O-03 — Approve a launch.** As an operator, I can review the launch dashboard (staging URL, QA report, marketing preview, Stripe setup, first-fetch sample, cost estimate) and approve / request fix / reject — Release Agent only cuts DNS on my decision.
- **U-O-04 — Approve content (Friday batch).** As an operator, I can run a single weekly Friday batch reviewing SEO drafts, social posts, and propagation candidates with one-click approve/edit/reject, so my time is bounded.
- **U-O-05 — Promote a pattern.** As an operator, I can review the weekly Reviewer-flagged pattern queue and promote selected candidates to the Pattern Library, so the moat compounds.
- **U-O-06 — Watch portfolio health.** As an operator, I can see Portfolio Control Plane (per-product budget vs spend, CAC by channel, LTV, lifecycle stage mix, creative fatigue) so I spot drift fast.
- **U-O-07 — Pause a product.** As an operator, I can pause all paid spend and outbound outreach for a product in one click while leaving the running app untouched, so I can stop a misbehaving channel without taking the product down.
- **U-O-08 — Cold email gate (V2).** As an operator, before activating cold email I am forced through the compliance checklist (lawyer sign-off attached, recipient filter set, frequency cap configured, opt-out wired) — activation is blocked until all green.
- **U-O-09 — Inspect agent runs.** As an operator, I can filter `agent_runs` by agent / product / time / cost and export, so I can audit any decision and reconstruct unit economics.

### 17.2 End-customer (Monitoring-SaaS) persona
- **U-E-01 — First value in 2 minutes.** As a new tenant, I complete onboarding with a sample data source and see a first observation in under 2 minutes.
- **U-E-02 — Build an alert rule.** As a tenant, I can build an alert rule from the BuildSpec-enabled primitives in a UI without writing YAML, so I can set up monitoring without engineering help.
- **U-E-03 — Receive a notification.** As a tenant, when a rule triggers I receive a notification on my chosen channel within (next scheduled fetch + 60s).
- **U-E-04 — Read history.** As a tenant, I can browse the full timeline of observations per source with filters / search / export, so I can investigate a change.
- **U-E-05 — Self-serve billing.** As a tenant, I can upgrade and cancel via Stripe customer portal with limit changes effective immediately.
- **U-E-06 — Exercise Auskunfts/Löschungsrecht.** As a German tenant, I can request data export and account deletion from the support widget and have it fulfilled within 30 days, audit-logged.

### 17.3 End-customer (Workflow-Automation, V2)
- **U-W-01 — Configure a pipeline.** As a tenant, I configure a trigger → steps → output-action pipeline from the visual builder, with `llm_cost_guardrails` defaults visible.
- **U-W-02 — Review pending runs.** As a tenant, I see pending runs in the unified review inbox with input summary, generated output, edit-diff, approve / edit / reject, and SLA countdown — abandonment risks losing the value loop.

## 18. Acceptance criteria (V1 launch readiness)

| ID | Capability | Acceptance criteria |
| --- | --- | --- |
| A-01 | BuildSpec → live | A valid Monitoring-SaaS BuildSpec produces a green pipeline with all 11 steps passing within 72h and ≤ €500 build cost |
| A-02 | Foundation completeness | Auth, RLS tenant isolation, Stripe Billing + customer portal, DSGVO toolkit (TCF 2.2 + Impressum + Datenschutzerklärung + AGB + Auskunft / Löschung / Datenportabilität flows + consent ledger), Postmark + SendGrid IP-pool separation, Sentry, OpenTelemetry, i18n DE/EN — all wired and exercised by integration test |
| A-03 | Time-to-value | First user reaches a meaningful "first observation" in ≤ 2 min p50 in Playwright run with sample data source |
| A-04 | V1 outreach channels live | Meta Ads campaign created and live; SEO blog publishes ≥ 2 articles in week 1 with all SEO baseline checks; LinkedIn 3 posts/week scheduled; X 1–2 posts/week scheduled; lifecycle email sequences armed; directory submissions queued |
| A-05 | Attribution | PostHog self-hosted receives all V1 events with `product_id`, `channel`, `campaign_id`, `creative_id`, `utm_*`, `landing_variant_id` populated for every relevant event; multi-touch model produces non-platform CAC reports |
| A-06 | Cross-channel frequency cap | ≤ 25 paid impressions / person / week enforced in CDP and verified by automated test |
| A-07 | Forbidden claims | Core Message validator rejects every banned phrase from §8.2 list; test suite covers each banned phrase |
| A-08 | Cold email V1 OUT | No cold-email sending pathway is reachable in production until §8.6 compliance flag is set; verified by automated guard |
| A-09 | Eval gates | Each LLM prompt has ≥ 50 graded examples; regression test on every update; release blocked on > 2% accuracy drop |
| A-10 | Launch HITL | DNS cutover requires explicit operator approval — no agent path bypasses it |
| A-11 | Pattern promotion | Weekly Friday job collects flagged candidates and surfaces them in the operator queue with one-click approve/reject |
| A-12 | Holding-wide unsubscribe | An unsubscribe in product A blocks send to that hashed email from product B in the same holding, verified by integration test |
| A-13 | Bounce / complaint guardrails | Hard bounces > 3% or complaints > 0.1% on any email channel auto-pauses that channel within 1h |
| A-14 | Cost ledger | Every `agent_runs` row carries `cost_eur`; per-product unit-economics report reconstructs end-to-end build cost from ledger |
| A-15 | Audit trail | Every operator approval (launch, content, propagation, pattern promotion) is logged to the audit trail with actor, timestamp, target, decision |

## 19. Operator onboarding (first-product flow)

The operator's first hours with the platform are themselves a guided flow:

1. **Account creation + holding setup.** Operator signs up, names the holding, configures billing (Stripe), sets MFA.
2. **Holding integration setup.** Connect Postmark, SendGrid, R2, PostHog, Stripe Connect, Google Search Console, Bing Webmaster, Doppler/SOPS, Slack notifications channel. Each connection is tested before the operator can advance.
3. **Architect Agent ideation.** Operator answers a short briefing (target verticals, capital cap, language regions = DE/EN); Architect drafts up to 3 `MarketSignalReport`s with positive unit-economic estimates.
4. **Pick first idea + author BuildSpec.** Operator selects an idea and walks the BuildSpec form (Monitoring-SaaS in V1) with inline schema validation.
5. **Dispatch build + watch pipeline.** Operator can leave; pipeline runs autonomously; operator gets notification on failure or when launch approval is needed.
6. **Approve launch.** First-product approval is gated with extra inline guidance — cost-estimate explanation, Stripe sandbox confirmation, DNS cutover preview, "you can pause everything in one click" reminder.
7. **First weekly ritual.** At the first Friday, the operator is guided through Pattern Promotion + Content Approval + Propagation Candidates as a single timeboxed batch screen.

**Goal.** Operator goes from sign-up to a live first product within 7 days, spending < 5 active hours of their own time. This is itself an internal KPI for V1.

## 20. Appendices

### Appendix A — Glossary

| Term | Definition |
| --- | --- |
| BuildSpec | Validated configuration document a template instance is built from |
| Foundation | Layer 1 shared monorepo package every product depends on |
| Template | Layer 2 product archetype (Monitoring, Workflow-Automation, …) |
| Pattern | Layer 3 horizontal building block reusable across templates |
| Core Message | Per-product canonical messaging payload (Appendix C) |
| CDP | Customer Data Platform (PostHog self-hosted) — sole attribution truth |
| Portfolio Control Plane | Cross-product budget enforcement + unified reporting layer |
| HITL | Human-in-the-loop |
| ICP | Ideal Customer Profile |
| LP | Landing Page |
| RLS | Row-Level Security (Postgres) |
| RSA | Responsive Search Ad (Google Ads) |
| GTM | Go-to-Market |
| TCF 2.2 | IAB Transparency & Consent Framework v2.2 |
| UWG | Gesetz gegen den unlauteren Wettbewerb (German competition law) |

### Appendix B — `MonitoringSaaSBuildSpec` JSON Schema (verbatim from addendum)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MonitoringSaaSBuildSpec",
  "type": "object",
  "required": [
    "product_slug", "data_sources", "alert_primitives",
    "notification_channels", "pricing_tiers", "branding"
  ],
  "properties": {
    "product_slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "data_sources": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["type", "config"],
        "properties": {
          "type": {
            "enum": ["http_api", "webscrape", "rss", "email_inbound",
                     "csv_upload", "google_sheets", "pdf_watch"]
          },
          "config": { "type": "object" },
          "rate_limit_per_hour": { "type": "integer", "minimum": 1 },
          "auth_required": { "type": "boolean" }
        }
      }
    },
    "alert_primitives": {
      "type": "array",
      "items": {
        "enum": ["threshold", "change_rate", "absence", "presence",
                 "regex_match", "semantic_match", "statistical_anomaly",
                 "deadline_approaching"]
      }
    },
    "notification_channels": {
      "type": "array",
      "items": {
        "enum": ["email", "slack", "webhook", "sms", "whatsapp",
                 "in_app", "teams", "telegram"]
      }
    },
    "pricing_tiers": {
      "type": "array",
      "minItems": 1, "maxItems": 4,
      "items": {
        "type": "object",
        "required": ["name", "price_eur_monthly", "limits"],
        "properties": {
          "name": { "type": "string" },
          "price_eur_monthly": { "type": "number" },
          "annual_discount_pct": { "type": "number", "default": 17 },
          "limits": {
            "type": "object",
            "properties": {
              "max_data_sources": { "type": "integer" },
              "max_alert_rules": { "type": "integer" },
              "check_frequency_minutes": { "type": "integer" },
              "history_retention_days": { "type": "integer" },
              "team_members": { "type": "integer" }
            }
          }
        }
      }
    },
    "onboarding": {
      "type": "object",
      "properties": {
        "mode": { "enum": ["self_serve", "guided_wizard", "done_for_you"] },
        "sample_data_source": { "type": "object" }
      }
    },
    "branding": {
      "type": "object",
      "required": ["name", "logo_ref", "palette"],
      "properties": {
        "name": { "type": "string" },
        "tagline": { "type": "string", "maxLength": 140 },
        "logo_ref": { "type": "string", "format": "uri" },
        "palette": {
          "type": "object",
          "properties": {
            "primary": { "type": "string" },
            "secondary": { "type": "string" },
            "accent": { "type": "string" }
          }
        }
      }
    },
    "integrations_requested": {
      "type": "array",
      "items": {
        "enum": ["stripe", "sendgrid", "postmark", "slack",
                 "zapier", "make", "n8n", "google_workspace"]
      }
    }
  }
}
```

### Appendix C — Core Message structure (verbatim from addendum)

```jsonc
{
  "product_id": "prod_...",
  "version": 1,
  "created_at": "...",
  "created_from": {
    "validation_package_id": "valpkg_...",
    "winning_variant_signals": { },
    "top_performing_ad_hooks": ["...", "..."],
    "top_email_response_themes": ["...", "..."]
  },
  "target_audience": {
    "primary_persona": { "name": "...", "role": "...", "company_size": "...", "pains": [] },
    "alternative_personas": [],
    "disqualifiers": ["enterprise IT buyers", "consumers"]
  },
  "pain_statements": {
    "calm":        "<1 sentence, measured, for sophisticated audience>",
    "pointed":     "<1 sentence, specific problem>",
    "provocative": "<1 sentence, attention-grabbing hook for cold ads>"
  },
  "core_promise": {
    "tweet":     "<max 240 chars>",
    "sentence":  "<max 80 words>",
    "paragraph": "<max 200 words>",
    "full_page": "<max 600 words>"
  },
  "proof_elements": [
    { "type": "mechanism",  "content": "How it works in one specific step" },
    { "type": "number",     "content": "Measurable claim with source" },
    { "type": "comparison", "content": "vs alternative X, we do Y because Z" },
    { "type": "testimonial_placeholder", "content": "Synthetic quote based on beta feedback" }
  ],
  "objection_rebuttals": [
    { "objection": "...", "rebuttal": "...", "frequency_seen": 0 }
  ],
  "calls_to_action": [
    { "commitment": "low",    "text": "See how it works",       "target_action": "watch_30s_demo" },
    { "commitment": "medium", "text": "Try it free for 14 days", "target_action": "signup" },
    { "commitment": "high",   "text": "Book a setup call",       "target_action": "book_meeting" }
  ],
  "brand_voice": {
    "tone":  ["direct", "warm", "competent"],
    "avoid": ["hype", "superlatives", "enterprise-speak"],
    "example_good_phrasing": [],
    "example_bad_phrasing":  []
  },
  "forbidden_claims": [
    "100% accuracy",
    "GDPR certified",
    "AI-powered (where unsubstantiated)"
  ]
}
```

### Appendix D — Workflow-Automation pipeline + guardrails snippet

```yaml
pipelines:
  - id: "weekly_gbp_post"
    trigger: { kind: "schedule", cron: "0 9 * * MON" }
    steps:
      - { kind: "fetch_context", source: "product_data" }
      - { kind: "llm_generate",  prompt_ref: "gbp_post_v1",
          output_schema: "GbpPost", model: "sonnet" }
      - { kind: "human_review",  mode: "approve_or_edit",
          sla_hours: 48, skip_after_hours: 72 }
      - { kind: "publish", target: "google_business_profile" }

llm_cost_guardrails:
  per_pipeline_run_eur_max: 0.50
  per_tenant_per_day_eur_max: 10.00
  auto_downshift_to_cheaper_model_above_eur: 0.30

output_actions:
  - google_business_profile_post
  - email_send
  - crm_upsert
  - webhook_deliver
  - pdf_generate
  - slack_post
```

### Appendix E — Closing principle (verbatim)

> The Template Catalog determines what kind of products the system can ship. The Outreach Engine determines whether those products find customers. Without the first, the system produces nothing. Without the second, the system produces orphans.

— *Addendum II, closing.*
