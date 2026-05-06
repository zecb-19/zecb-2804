import "server-only";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __zecbPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __zecbSchemaInit: Promise<void> | undefined;
}

function buildPool(): Pool {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set in the environment");
  }
  // Parse explicitly so the `sslmode=require` query param is ignored —
  // recent pg-connection-string treats it as `verify-full`, which fails
  // against AWS RDS's cert chain. We pin our own ssl behavior instead.
  const u = new URL(raw);
  return new Pool({
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export const pool: Pool = global.__zecbPgPool ?? buildPool();
if (!global.__zecbPgPool) global.__zecbPgPool = pool;

export function ensureSchema(): Promise<void> {
  if (global.__zecbSchemaInit) return global.__zecbSchemaInit;
  global.__zecbSchemaInit = (async () => {
    // Postgres 13+ exposes gen_random_uuid() built-in (no pgcrypto needed).
    // The deployed RDS instance is 17.x. UUID PKs are required because the
    // wider schema (tenants, products, etc.) keys on UUIDs everywhere.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);`);
    // Additive migrations — idempotent. Safe to run on every cold start.
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;`);
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';`,
    );
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;`);
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;`,
    );
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;`);
    // Stripe billing (§6.1 #3)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'none';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;`);

    // Password reset tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // --- products / build_specs / agent_runs ----------------------------
    // Per PRD §9 — products registry, BuildSpec history, and the central
    // agent_runs ledger every cost number depends on. CREATE statements
    // mirror the schema already deployed on RDS so a fresh database lands
    // identical to prod; subsequent ALTERs add the columns the BuildSpec
    // form needs without disturbing existing rows.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        tagline TEXT,
        template_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'building',
        mrr_eur INTEGER NOT NULL DEFAULT 0,
        users_count INTEGER NOT NULL DEFAULT 0,
        growth_30d REAL NOT NULL DEFAULT 0,
        palette JSONB NOT NULL DEFAULT '{}'::jsonb,
        current_build_run_id TEXT,
        owner_user_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        phase TEXT NOT NULL DEFAULT 'ignition',
        phase_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS template_version TEXT NOT NULL DEFAULT '1.0.0';`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS build_step INT NOT NULL DEFAULT 1;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS build_total_steps INT NOT NULL DEFAULT 11;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS current_step_label TEXT;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_monthly_opex_eur NUMERIC(10,2);`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS branding JSONB NOT NULL DEFAULT '{}'::jsonb;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS products_owner_idx ON products (owner_user_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS products_status_idx ON products (status);`,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS build_specs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        run_id TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        spec_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS build_specs_product_idx ON build_specs (product_id);`,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        build_run_id TEXT,
        agent TEXT NOT NULL,
        task_name TEXT NOT NULL,
        input JSONB NOT NULL DEFAULT '{}'::jsonb,
        output JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'ok',
        error_message TEXT,
        llm_model TEXT,
        cost_eur REAL NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS agent_runs_product_idx ON agent_runs (product_id, created_at DESC);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS agent_runs_recent_idx ON agent_runs (created_at DESC);`,
    );
    // Attribute Architect-Agent runs (no product yet) to the operator
    // who triggered them, so the Audit Trail viewer can scope by user.
    await pool.query(
      `ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS owner_user_id UUID;`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS agent_runs_owner_idx ON agent_runs (owner_user_id, created_at DESC);`,
    );

    // --- market_signal_reports (Architect Agent output) ---------------
    // PRD §17.1 U-O-01 + §19 step 3: validated opportunities awaiting
    // operator approval, then promotable to a BuildSpec draft.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS market_signal_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_user_id UUID NOT NULL,
        generation_request_id UUID NOT NULL,
        vertical TEXT NOT NULL,
        persona JSONB NOT NULL DEFAULT '{}'::jsonb,
        opportunity TEXT NOT NULL,
        pain_statement TEXT NOT NULL,
        core_promise TEXT NOT NULL,
        mechanism TEXT,
        suggested_slug TEXT,
        suggested_data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
        suggested_alert_primitives JSONB NOT NULL DEFAULT '[]'::jsonb,
        suggested_notification_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
        suggested_pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
        unit_economics JSONB NOT NULL DEFAULT '{}'::jsonb,
        tam_estimate TEXT,
        reasoning TEXT,
        llm_model TEXT,
        cost_eur NUMERIC(10,4) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewer_note TEXT,
        reviewed_at TIMESTAMPTZ,
        promoted_to_product_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS msr_owner_idx ON market_signal_reports (owner_user_id, created_at DESC);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS msr_status_idx ON market_signal_reports (status);`,
    );
    // --- templates (§7.1 – §7.8) -------------------------------------------
    // Layer-2 product archetypes. Each row stores metadata, the 7 artifact
    // statuses, and supported product examples. Dynamic stats (products
    // built, cost) are derived from products + agent_runs at query time.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'draft',
        tier TEXT NOT NULL DEFAULT 'v1',
        description TEXT,
        identity TEXT,
        core_workflow TEXT,
        artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
        supported_examples JSONB NOT NULL DEFAULT '[]'::jsonb,
        governance_notes TEXT,
        eval_pass_rate REAL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed V1 + V2 templates (idempotent — ON CONFLICT DO NOTHING).
    await pool.query(`
      INSERT INTO templates (id, name, version, status, tier, description, identity, core_workflow, artifacts, supported_examples, governance_notes, eval_pass_rate)
      VALUES
        (
          'monitoring-saas',
          'Monitoring-SaaS',
          '1.0.0',
          'active',
          'v1',
          'Passive-observation product class. Watches data sources on a schedule, detects changes/anomalies via user-defined rules, notifies via chosen channels, maintains searchable history.',
          'Widest SMB-niche coverage, predictable unit economics, deterministic core workflow — well-suited to agentic instantiation.',
          'Observe data sources on schedule → detect changes via rules → notify user → store history',
          $1::jsonb,
          $2::jsonb,
          'V1 template. Freeze if eval pass rate drops below 98%.',
          100.0
        ),
        (
          'workflow-automation',
          'Workflow-Automation-SaaS',
          '0.1.0',
          'draft',
          'v2',
          'Active counterpart to Monitoring — executes work on the user''s behalf. LLM-heavy, more valuable per seat, more expensive to operate, more sensitive to quality failures.',
          'Different from Monitoring: active (executes work) vs passive (observes and notifies). Makes it LLM-heavy with mandatory cost guardrails.',
          'User configures trigger → pipeline of processing steps (often LLM-based) → output action',
          $3::jsonb,
          $4::jsonb,
          'V2 template. Requires mandatory llm_cost_guardrails in every BuildSpec.',
          NULL
        ),
        (
          'data-enrichment-api',
          'Data-Enrichment-API',
          '0.1.0',
          'draft',
          'v2',
          'Developer-facing. API-only consumption. Usage-based pricing. Sub-linear support cost. Weaker impulse-buy funnel; sticky integrations → strong retention.',
          'Consumers integrate via API. Different unit economics: usage-based pricing, scales sub-linearly with support cost.',
          'Client sends input (single or batch) → product-defined enrichment function → structured result',
          $5::jsonb,
          $6::jsonb,
          'V2 template. Requires OpenAPI docs, SDK generation, and playground.',
          NULL
        ),
        (
          'dashboard-reporting',
          'Dashboard & Reporting-SaaS',
          '0.1.0',
          'draft',
          'v2',
          'Integration-heavy. Value comes from integration breadth and metric sharpness. Most competitive category — only justified for clearly specific, under-served needs.',
          'Configuration schema explicitly forbids unfocused dashboards. Only justified when a clearly specific, under-served need exists.',
          'Integrate data sources → ETL with incremental sync → define metrics → build dashboards → scheduled reports',
          $7::jsonb,
          $8::jsonb,
          'V2+ template. White-label capability for agencies is an important secondary ICP.',
          NULL
        )
      ON CONFLICT (id) DO NOTHING;
    `, [
      // monitoring-saas artifacts
      JSON.stringify([
        { name: "Code scaffold", status: "complete", description: "TypeScript monorepo package with documented, typed extension points" },
        { name: "Configuration schema", status: "complete", description: "JSON Schema (draft 2020-12) — MonitoringSaaSBuildSpec validated by Build Orchestrator" },
        { name: "Workflow library", status: "in_progress", description: "Data-source connectors, alert rule evaluators, notification channels" },
        { name: "UI pattern kit", status: "in_progress", description: "shadcn/ui React components: dashboard grid, source configurator, rule builder, timeline" },
        { name: "Prompt and eval package", status: "not_started", description: "Versioned prompts with min 50 graded eval examples per prompt" },
        { name: "Operations runbook", status: "not_started", description: "Alert interpretation guide, 20-40 canned support replies, maintenance jobs" },
        { name: "Marketing & onboarding kit", status: "not_started", description: "Landing-page sections, onboarding flows, lifecycle email sequences" },
      ]),
      // monitoring-saas examples
      JSON.stringify([
        { name: "Einkaufspreis-Monitor", description: "Wholesale price tracking (Metro, Transgourmet)" },
        { name: "Fördermittel-Radar", description: "Federal/state/EU funding database alerts" },
        { name: "Wettbewerbs-Monitor", description: "Competitor sites, pricing, jobs tracking" },
        { name: "Vertragsfristen-Wächter", description: "Contract date extraction + deadline alerts" },
        { name: "Lieferanten-Compliance-Monitor", description: "Supplier certifications, ESG disclosures" },
        { name: "SEO-Rank-Tracker", description: "Local Google rankings for businesses" },
        { name: "Regulatory-Change-Radar", description: "Vertical-specific authority publications" },
      ]),
      // workflow-automation artifacts
      JSON.stringify([
        { name: "Code scaffold", status: "not_started", description: "TypeScript monorepo package with pipeline execution engine" },
        { name: "Configuration schema", status: "not_started", description: "Pipelines, review_modes, llm_cost_guardrails, output_actions" },
        { name: "Workflow library", status: "not_started", description: "12 pipeline steps: fetch_context, llm_generate, human_review, publish, etc." },
        { name: "UI pattern kit", status: "not_started", description: "Visual pipeline builder, unified review inbox with SLA countdown" },
        { name: "Prompt and eval package", status: "not_started", description: "LLM generation prompts with cost guardrails" },
        { name: "Operations runbook", status: "not_started", description: "Pipeline failure handling, cost escalation procedures" },
        { name: "Marketing & onboarding kit", status: "not_started", description: "Pipeline template gallery, quick-start wizard" },
      ]),
      // workflow-automation examples
      JSON.stringify([
        { name: "Local-SEO-Autopilot", description: "Weekly Google Business Profile posts, review replies" },
        { name: "Angebots-Generator", description: "Automated quote drafting for tradespeople" },
        { name: "Lead-Enrichment-Bot", description: "Inbound lead enrichment via APIs + LLM, CRM push" },
        { name: "Content-Repurposer", description: "Blog post → LinkedIn/X/newsletter versions" },
        { name: "Invoice-Triage", description: "Supplier PDFs → parsed, categorized, pre-booked for DATEV" },
        { name: "Outbound-Email-Generator", description: "Personalized cold emails with send throttling" },
      ]),
      // data-enrichment-api artifacts
      JSON.stringify([
        { name: "Code scaffold", status: "not_started", description: "API-first TypeScript package with rate limiting and usage metering" },
        { name: "Configuration schema", status: "not_started", description: "Enrichment input/output schemas, SLA targets, pricing model" },
        { name: "Workflow library", status: "not_started", description: "Sync and async batch processing, webhook callbacks" },
        { name: "UI pattern kit", status: "not_started", description: "API playground, usage dashboard, key management" },
        { name: "Prompt and eval package", status: "not_started", description: "Enrichment prompts with accuracy evaluation" },
        { name: "Operations runbook", status: "not_started", description: "Rate limit escalation, SLA breach response" },
        { name: "Marketing & onboarding kit", status: "not_started", description: "OpenAPI docs, SDK quickstart, Postman collection" },
      ]),
      // data-enrichment-api examples
      JSON.stringify([
        { name: "Firmendaten-Anreicherung", description: "Email/domain in → company details, industry, size, tech stack" },
        { name: "DACH-Adress-Validierung-Plus", description: "Address string in → validated, normalized, enriched" },
        { name: "Dokument-Klassifikation", description: "PDF in → document type + confidence + extracted fields" },
        { name: "SKR04 Kategorisierungs-API", description: "Transaction description in → SKR04 account suggestion" },
        { name: "Sentiment-Monitor-API", description: "Review text in → sentiment, themes, urgency, priority" },
      ]),
      // dashboard-reporting artifacts
      JSON.stringify([
        { name: "Code scaffold", status: "not_started", description: "Integration-heavy package with 20+ pre-built connectors" },
        { name: "Configuration schema", status: "not_started", description: "Integration selection, metric definitions, dashboard layout" },
        { name: "Workflow library", status: "not_started", description: "ETL scheduling with incremental sync, metric computation" },
        { name: "UI pattern kit", status: "not_started", description: "KPI card, time series, bar, funnel, cohort, geo map widgets" },
        { name: "Prompt and eval package", status: "not_started", description: "Metric insight generation prompts" },
        { name: "Operations runbook", status: "not_started", description: "Integration failure handling, data freshness monitoring" },
        { name: "Marketing & onboarding kit", status: "not_started", description: "Integration setup wizard, sample dashboards" },
      ]),
      // dashboard-reporting examples
      JSON.stringify([
        { name: "Gastro-Deckungsbeitrags-Dashboard", description: "Inventory + POS + staff costs in one view" },
        { name: "Baufortschritts-Cockpit", description: "Project milestones + spend + supplier delivery" },
        { name: "Webshop-Werbekosten-Dashboard", description: "Meta + Google + internal margin in one view" },
        { name: "Social-Media-Effectiveness-Dashboard", description: "Platform metrics + brand mentions + sentiment" },
      ]),
    ]);

    // --- patterns + pattern_candidates (§7.7, §7.8) -----------------------
    // Layer-3 horizontal building blocks. Compounding asset — every build
    // surfaces reusable components promoted via the weekly Friday ritual.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'active',
        source_product_id UUID,
        used_in_builds INT NOT NULL DEFAULT 0,
        complexity TEXT NOT NULL DEFAULT 'medium',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS patterns_category_idx ON patterns (category);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS patterns_status_idx ON patterns (status);`,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pattern_candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        pattern_name TEXT NOT NULL,
        description TEXT,
        reason TEXT,
        category TEXT NOT NULL DEFAULT 'uncategorized',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewer_note TEXT,
        reviewed_at TIMESTAMPTZ,
        promoted_to_pattern_id UUID,
        flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS pc_status_idx ON pattern_candidates (status);`,
    );

    // Seed V1 patterns (PRD §7.7) — idempotent.
    await pool.query(`
      INSERT INTO patterns (slug, name, description, category, version, status, complexity, tags)
      VALUES
        ('email-digest', 'Email Digest',
         'Build a recurring email summary from a data query. Supports daily, weekly, monthly cadence with per-user timezone handling and template rendering.',
         'reporting', '1.0.0', 'active', 'medium',
         '["email", "scheduling", "templating"]'::jsonb),
        ('csv-import-export', 'CSV Import / Export',
         'Upload a file, map columns to schema, validate rows, process with progress UI. Export any dataset as CSV with streaming for large files.',
         'data', '1.0.0', 'active', 'medium',
         '["file-upload", "validation", "streaming"]'::jsonb),
        ('webhook-receiver', 'Webhook Receiver',
         'Signed inbound webhooks with replay protection, HMAC verification, idempotency keys, and dead-letter queue for failed processing.',
         'integration', '1.0.0', 'active', 'high',
         '["webhooks", "security", "queue"]'::jsonb),
        ('api-poller', 'External API Poller',
         'Rate-limited, backoff-aware, durable external API consumption with ETag/Last-Modified caching and configurable retry policies.',
         'integration', '1.0.0', 'active', 'high',
         '["api", "rate-limiting", "retry"]'::jsonb),
        ('llm-extract', 'LLM Extract',
         'Structured extraction from unstructured input with JSON Schema validation, repair pass on schema failure, and cost tracking per call.',
         'ai', '1.0.0', 'active', 'high',
         '["llm", "extraction", "schema-validation"]'::jsonb),
        ('approval-queue', 'Approval Queue',
         'Items await human review with approve/reject/edit UI, SLA countdown, assignment, and bulk actions. Foundation for all HITL gates.',
         'workflow', '1.0.0', 'active', 'medium',
         '["review", "hitl", "queue"]'::jsonb),
        ('timeline-view', 'Timeline View',
         'Chronological event log with date range filters, full-text search, status badges, pagination, and CSV/JSON export.',
         'ui', '1.0.0', 'active', 'low',
         '["ui", "timeline", "filtering", "export"]'::jsonb),
        ('onboarding-wizard', 'Onboarding Wizard',
         'Multi-step setup with progress indicator, save-and-resume, sample data for "try it now" paths, and time-to-value tracking.',
         'ui', '1.0.0', 'active', 'medium',
         '["onboarding", "wizard", "ttv"]'::jsonb),
        ('scheduled-report', 'Scheduled Report',
         'Generate PDF/CSV/HTML reports on cron schedule, deliver via email. Supports per-user scheduling, timezone, and template customization.',
         'reporting', '1.0.0', 'active', 'medium',
         '["reporting", "scheduling", "pdf"]'::jsonb),
        ('slack-integration', 'Slack Integration',
         'OAuth install flow, workspace/channel selection, formatted message delivery with Block Kit, and slash command handling.',
         'integration', '1.0.0', 'active', 'high',
         '["slack", "oauth", "messaging"]'::jsonb)
      ON CONFLICT (slug) DO NOTHING;
    `);

    // --- outreach_queue_items (§7.9, §8.10, U-O-04) -----------------------
    // Weekly approval queue for content, propagation, and channel proposals.
    // Items are created by Channel Agents and reviewed during Friday ritual.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS outreach_queue_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        channel TEXT,
        content_preview TEXT,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewer_note TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS oqi_status_idx ON outreach_queue_items (status, item_type);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS oqi_product_idx ON outreach_queue_items (product_id);`,
    );

    // --- compliance_checks (§7.9, §8.6, §11.3) ----------------------------
    // Hard gates for regulated channels and DSGVO obligations.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS compliance_checks (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        required_for TEXT NOT NULL DEFAULT 'v1',
        status TEXT NOT NULL DEFAULT 'not_started',
        evidence_note TEXT,
        checked_at TIMESTAMPTZ,
        checked_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // --- unsubscribes (§9, §8.6, A-12) ------------------------------------
    // Holding-wide block list. Hashed email, lookup-only, no bulk export.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS unsubscribes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email_hash TEXT UNIQUE NOT NULL,
        source_product_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS unsub_hash_idx ON unsubscribes (email_hash);`,
    );

    // --- consent_ledger (§11.3 DSGVO) --------------------------------------
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consent_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL,
        user_id UUID,
        consent_type TEXT NOT NULL,
        granted BOOLEAN NOT NULL,
        categories JSONB NOT NULL DEFAULT '[]'::jsonb,
        ip_hash TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS consent_session_idx ON consent_ledger (session_id);`,
    );

    // Seed compliance checks (idempotent).
    await pool.query(`
      INSERT INTO compliance_checks (id, category, name, description, required_for, status)
      VALUES
        ('dsgvo-tcf22', 'dsgvo', 'TCF 2.2 Cookie Consent',
         'IAB Transparency & Consent Framework v2.2 implemented on every product surface.',
         'v1', 'not_started'),
        ('dsgvo-impressum', 'dsgvo', 'Impressum Generator',
         'Auto-generated legal Impressum page per product with correct entity data.',
         'v1', 'not_started'),
        ('dsgvo-datenschutz', 'dsgvo', 'Datenschutzerklärung',
         'Privacy policy generator compliant with DSGVO Art. 13/14.',
         'v1', 'not_started'),
        ('dsgvo-agb', 'dsgvo', 'AGB Template Loader',
         'Terms of service generator per product with template-specific clauses.',
         'v1', 'not_started'),
        ('dsgvo-auskunft', 'dsgvo', 'Auskunftsrecht Flow',
         'Data subject access request (DSAR) flow — export all personal data within 30 days.',
         'v1', 'not_started'),
        ('dsgvo-loeschung', 'dsgvo', 'Löschungsrecht Flow',
         'Right to erasure flow — purge tenant data within 30 days, audit-logged.',
         'v1', 'not_started'),
        ('dsgvo-portability', 'dsgvo', 'Datenportabilität Flow',
         'Data portability — machine-readable export of all tenant data.',
         'v1', 'not_started'),
        ('dsgvo-consent-ledger', 'dsgvo', 'Consent Ledger',
         'Immutable log of every consent decision per user with timestamp and context.',
         'v1', 'not_started'),
        ('email-dkim-spf', 'email', 'DKIM/SPF/DMARC',
         'Per-product sending domains verified with DKIM, SPF, and DMARC alignment.',
         'v1', 'not_started'),
        ('email-double-optin', 'email', 'Double Opt-In (DE)',
         'Marketing emails require confirmed double opt-in for German recipients.',
         'v1', 'not_started'),
        ('email-preference-center', 'email', 'Preference Center',
         'Granular opt-out per category. Global unsubscribe kills all marketing sends.',
         'v1', 'not_started'),
        ('email-unsub-holding', 'email', 'Holding-Wide Unsubscribe',
         'Unsubscribe in product A blocks sends from product B across the holding (A-12).',
         'v1', 'not_started'),
        ('cold-lawyer-signoff', 'cold_email', 'Lawyer-Reviewed Framework',
         'Signed-off legal compliance framework for cold B2B email in DACH/EU.',
         'v2', 'not_started'),
        ('cold-recipient-filter', 'cold_email', 'Recipient Filter',
         'Only role-based or publicly published business addresses. No private addresses.',
         'v2', 'not_started'),
        ('cold-relevance-filter', 'cold_email', 'Relevance Filter (LLM Match > 0.8)',
         'LLM-based match score > 0.8 between recipient profile and product segment.',
         'v2', 'not_started'),
        ('cold-frequency-cap', 'cold_email', 'Frequency Cap',
         'Max 2 emails/recipient/product/12mo. Holding-wide: 4/recipient/12mo.',
         'v2', 'not_started'),
        ('cold-optout', 'cold_email', 'One-Click Opt-Out',
         'Every cold email has one-click unsubscribe. Permanent block across all products.',
         'v2', 'not_started'),
        ('cold-impressum', 'cold_email', 'Impressum Footer',
         'Full Impressum in every cold email. Truthful sender, no pretextual subjects.',
         'v2', 'not_started'),
        ('cold-audit-log', 'cold_email', 'Audit Log (≥3 years)',
         'Every send logged with legal basis, match score, content hash for ≥3 years.',
         'v2', 'not_started'),
        ('cold-dedicated-infra', 'cold_email', 'Dedicated Sending Infrastructure',
         'Per-product outreach subdomain with own SPF/DKIM/DMARC. Never the holding domain.',
         'v2', 'not_started'),
        ('content-forbidden-claims', 'content', 'Forbidden Claims Validator',
         'Core Message validator rejects banned phrases (A-07). Test suite covers each phrase.',
         'v1', 'not_started'),
        ('audit-agent-runs', 'audit', 'Agent Runs Cost Ledger',
         'Every agent_runs row carries cost_eur. Unit-economics report reconstructable (A-14).',
         'v1', 'complete'),
        ('audit-operator-actions', 'audit', 'Operator Action Logging',
         'Every approval (launch, content, propagation, pattern) logged with actor/timestamp (A-15).',
         'v1', 'complete')
      ON CONFLICT (id) DO NOTHING;
    `);

  })().catch((err) => {
    global.__zecbSchemaInit = undefined;
    throw err;
  });
  return global.__zecbSchemaInit;
}
