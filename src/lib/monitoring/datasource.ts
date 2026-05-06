import "server-only";

import { log } from "@/lib/log";

export type DataSourceKind =
  | "http_api"
  | "webscrape"
  | "rss"
  | "email_inbound"
  | "csv_upload"
  | "google_sheets"
  | "pdf_watch";

export type ValidationResult = { valid: true } | { valid: false; errors: string[] };

export type FetchContext = {
  sourceId: string;
  productId: string;
  config: Record<string, unknown>;
};

export type FetchResult = {
  raw_payload: unknown;
  fetched_at: string;
  http_status?: number;
  fetch_duration_ms: number;
  retries_used: number;
};

export type NormalizedObservation = {
  data_source_id: string;
  observed_at: string;
  dimensions: Record<string, string>;
  measures: Record<string, number | string | boolean>;
  raw_ref?: string;
};

export type CostEstimate = {
  cost_eur_per_fetch: number;
  notes: string;
};

export interface DataSource {
  readonly kind: DataSourceKind;

  validate(config: unknown): Promise<ValidationResult>;
  fetch(context: FetchContext): Promise<FetchResult>;
  normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]>;
  estimateCostPerFetch(): CostEstimate;
}

// --- HttpApi Connector ---------------------------------------------------

export class HttpApiSource implements DataSource {
  readonly kind = "http_api" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    if (!c.url || typeof c.url !== "string") {
      return { valid: false, errors: ["url is required and must be a string"] };
    }
    try {
      new URL(c.url as string);
    } catch {
      return { valid: false, errors: ["url is not a valid URL"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    const url = context.config.url as string;
    const method = (context.config.method as string) || "GET";
    const headers = (context.config.headers as Record<string, string>) || {};
    const jsonPath = context.config.json_path as string | undefined;

    const start = Date.now();
    let retries = 0;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await globalThis.fetch(url, {
          method,
          headers: { "User-Agent": "ZECB-Monitor/1.0", ...headers },
          signal: AbortSignal.timeout(30_000),
        });

        const body = await res.text();
        let payload: unknown = body;
        try {
          payload = JSON.parse(body);
        } catch { /* keep as string */ }

        if (jsonPath && typeof payload === "object" && payload !== null) {
          payload = extractJsonPath(payload, jsonPath);
        }

        return {
          raw_payload: payload,
          fetched_at: new Date().toISOString(),
          http_status: res.status,
          fetch_duration_ms: Date.now() - start,
          retries_used: retries,
        };
      } catch (err) {
        lastError = err as Error;
        retries++;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    log.error({ url, error: lastError?.message }, "http_api fetch failed after retries");
    throw lastError ?? new Error("Fetch failed");
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const payload = raw.raw_payload;
    const items = Array.isArray(payload) ? payload : [payload];

    return items.map((item, i) => {
      const dimensions: Record<string, string> = {};
      const measures: Record<string, number | string | boolean> = {};

      if (typeof item === "object" && item !== null) {
        for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
          if (typeof v === "number") {
            measures[k] = v;
          } else if (typeof v === "boolean") {
            measures[k] = v;
          } else if (typeof v === "string") {
            if (/^\d+(\.\d+)?$/.test(v)) {
              measures[k] = Number(v);
            } else {
              dimensions[k] = v;
            }
          }
        }
      }

      return {
        data_source_id: context.sourceId,
        observed_at: raw.fetched_at,
        dimensions: { ...dimensions, _index: String(i) },
        measures,
      };
    });
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0, notes: "HTTP API calls are free (external API costs may apply)" };
  }
}

// --- Webscrape Connector -------------------------------------------------

export class WebscrapeSource implements DataSource {
  readonly kind = "webscrape" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    if (!c.url || typeof c.url !== "string") {
      return { valid: false, errors: ["url is required"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    const url = context.config.url as string;
    const start = Date.now();

    const res = await globalThis.fetch(url, {
      headers: { "User-Agent": "ZECB-Monitor/1.0 (compatible)" },
      signal: AbortSignal.timeout(30_000),
    });

    const html = await res.text();

    return {
      raw_payload: html,
      fetched_at: new Date().toISOString(),
      http_status: res.status,
      fetch_duration_ms: Date.now() - start,
      retries_used: 0,
    };
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const html = String(raw.raw_payload);
    const contentHash = simpleHash(html);

    return [{
      data_source_id: context.sourceId,
      observed_at: raw.fetched_at,
      dimensions: {
        url: (context.config.url as string) || "",
        content_hash: contentHash,
      },
      measures: {
        content_length: html.length,
        http_status: raw.http_status ?? 0,
        fetch_ms: raw.fetch_duration_ms,
      },
    }];
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0, notes: "HTML fetch is free" };
  }
}

// --- RSS Connector -------------------------------------------------------

export class RssSource implements DataSource {
  readonly kind = "rss" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    if (!c.url || typeof c.url !== "string") {
      return { valid: false, errors: ["Feed URL is required"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    const url = context.config.url as string;
    const start = Date.now();

    const res = await globalThis.fetch(url, {
      headers: { "User-Agent": "ZECB-Monitor/1.0" },
      signal: AbortSignal.timeout(15_000),
    });

    const xml = await res.text();

    return {
      raw_payload: xml,
      fetched_at: new Date().toISOString(),
      http_status: res.status,
      fetch_duration_ms: Date.now() - start,
      retries_used: 0,
    };
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const xml = String(raw.raw_payload);
    const items = parseRssItems(xml);

    return items.map((item) => ({
      data_source_id: context.sourceId,
      observed_at: item.pubDate || raw.fetched_at,
      dimensions: {
        title: item.title || "",
        link: item.link || "",
        guid: item.guid || item.link || "",
      },
      measures: {
        has_description: !!item.description,
        title_length: (item.title || "").length,
      },
    }));
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0, notes: "RSS feeds are free" };
  }
}

// --- Lazy imports for additional connectors (avoid circular) ---------------

function loadConnectors(): Record<string, new () => DataSource> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const extra = require("./connectors");
  return {
    http_api: HttpApiSource,
    webscrape: WebscrapeSource,
    rss: RssSource,
    email_inbound: extra.EmailInboundSource,
    csv_upload: extra.CsvUploadSource,
    google_sheets: extra.GoogleSheetsSource,
    pdf_watch: extra.PdfWatchSource,
  };
}

// --- Factory -------------------------------------------------------------

let _connectors: Record<string, new () => DataSource> | null = null;

function getConnectors(): Record<string, new () => DataSource> {
  if (!_connectors) _connectors = loadConnectors();
  return _connectors;
}

const CONNECTORS: Record<string, new () => DataSource> = {
  http_api: HttpApiSource,
  webscrape: WebscrapeSource,
  rss: RssSource,
};

export function createDataSource(kind: string): DataSource {
  const all = getConnectors();
  const Ctor = all[kind] ?? CONNECTORS[kind];
  if (!Ctor) throw new Error(`Unknown data source kind: ${kind}`);
  return new Ctor();
}

// --- Helpers -------------------------------------------------------------

function extractJsonPath(obj: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return current;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function parseRssItems(xml: string): Array<{ title?: string; link?: string; guid?: string; description?: string; pubDate?: string }> {
  const items: Array<{ title?: string; link?: string; guid?: string; description?: string; pubDate?: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    items.push({
      title: extractTag(content, "title"),
      link: extractTag(content, "link"),
      guid: extractTag(content, "guid"),
      description: extractTag(content, "description"),
      pubDate: extractTag(content, "pubDate"),
    });
  }
  return items;
}

function extractTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(xml);
  return m?.[1] ?? m?.[2] ?? undefined;
}
