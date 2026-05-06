import "server-only";

import type {
  DataSource,
  ValidationResult,
  FetchContext,
  FetchResult,
  NormalizedObservation,
  CostEstimate,
} from "./datasource";

// --- EmailInbound Connector -----------------------------------------------

export class EmailInboundSource implements DataSource {
  readonly kind = "email_inbound" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    if (!c.forward_address || typeof c.forward_address !== "string") {
      return { valid: false, errors: ["forward_address is required (the address emails are forwarded to)"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    // EmailInbound is push-based — emails arrive via forwarding.
    // This fetch checks the inbox for new messages since last check.
    // Full implementation requires IMAP connection.
    const start = Date.now();
    return {
      raw_payload: {
        _note: "EmailInbound requires IMAP configuration — returning empty for now",
        forward_address: context.config.forward_address,
        messages: [],
      },
      fetched_at: new Date().toISOString(),
      fetch_duration_ms: Date.now() - start,
      retries_used: 0,
    };
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const payload = raw.raw_payload as Record<string, unknown>;
    const messages = (payload.messages ?? []) as Array<Record<string, unknown>>;

    return messages.map((msg) => ({
      data_source_id: context.sourceId,
      observed_at: (msg.date as string) || raw.fetched_at,
      dimensions: {
        from: String(msg.from ?? ""),
        subject: String(msg.subject ?? ""),
        message_id: String(msg.message_id ?? ""),
      },
      measures: {
        has_attachments: !!msg.attachments,
        body_length: String(msg.body ?? "").length,
      },
    }));
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0, notes: "IMAP polling is free" };
  }
}

// --- CsvUpload Connector --------------------------------------------------

export class CsvUploadSource implements DataSource {
  readonly kind = "csv_upload" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    const columns = c.columns as string[] | undefined;
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return { valid: false, errors: ["columns array is required (list of expected column names)"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    // CsvUpload is user-triggered, not scheduled.
    // The fetch reads from a pending upload buffer.
    const start = Date.now();
    const pendingData = context.config._pending_csv_data as string | undefined;

    if (!pendingData) {
      return {
        raw_payload: { rows: [], _note: "No pending CSV upload" },
        fetched_at: new Date().toISOString(),
        fetch_duration_ms: Date.now() - start,
        retries_used: 0,
      };
    }

    const rows = parseCsv(pendingData, context.config.columns as string[]);

    return {
      raw_payload: { rows },
      fetched_at: new Date().toISOString(),
      fetch_duration_ms: Date.now() - start,
      retries_used: 0,
    };
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const payload = raw.raw_payload as Record<string, unknown>;
    const rows = (payload.rows ?? []) as Array<Record<string, string>>;

    return rows.map((row, i) => {
      const dimensions: Record<string, string> = {};
      const measures: Record<string, number | string | boolean> = {};

      for (const [k, v] of Object.entries(row)) {
        const num = Number(v);
        if (v !== "" && Number.isFinite(num)) {
          measures[k] = num;
        } else {
          dimensions[k] = v;
        }
      }

      return {
        data_source_id: context.sourceId,
        observed_at: raw.fetched_at,
        dimensions: { ...dimensions, _row_index: String(i) },
        measures,
      };
    });
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0, notes: "CSV processing is local" };
  }
}

// --- GoogleSheets Connector -----------------------------------------------

export class GoogleSheetsSource implements DataSource {
  readonly kind = "google_sheets" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    if (!c.spreadsheet_id || typeof c.spreadsheet_id !== "string") {
      return { valid: false, errors: ["spreadsheet_id is required"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    const spreadsheetId = context.config.spreadsheet_id as string;
    const range = (context.config.range as string) || "Sheet1!A1:Z1000";
    const start = Date.now();

    // Google Sheets API requires OAuth. For now, try the public CSV export URL.
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(range.split("!")[0] || "Sheet1")}`;

    try {
      const res = await globalThis.fetch(exportUrl, {
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        return {
          raw_payload: { error: `HTTP ${res.status}`, _note: "Sheet may not be publicly shared. Full OAuth integration needed for private sheets." },
          fetched_at: new Date().toISOString(),
          http_status: res.status,
          fetch_duration_ms: Date.now() - start,
          retries_used: 0,
        };
      }

      const csv = await res.text();
      return {
        raw_payload: csv,
        fetched_at: new Date().toISOString(),
        http_status: res.status,
        fetch_duration_ms: Date.now() - start,
        retries_used: 0,
      };
    } catch (err) {
      return {
        raw_payload: { error: (err as Error).message },
        fetched_at: new Date().toISOString(),
        fetch_duration_ms: Date.now() - start,
        retries_used: 0,
      };
    }
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const payload = raw.raw_payload;
    if (typeof payload !== "string") return [];

    const columns = (context.config.columns as string[]) || [];
    const rows = parseCsv(payload, columns);

    return rows.map((row, i) => {
      const dimensions: Record<string, string> = {};
      const measures: Record<string, number | string | boolean> = {};

      for (const [k, v] of Object.entries(row)) {
        const num = Number(v);
        if (v !== "" && Number.isFinite(num)) {
          measures[k] = num;
        } else {
          dimensions[k] = v;
        }
      }

      return {
        data_source_id: context.sourceId,
        observed_at: raw.fetched_at,
        dimensions: { ...dimensions, _row_index: String(i) },
        measures,
      };
    });
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0, notes: "Google Sheets public export is free; OAuth API has quotas" };
  }
}

// --- PdfWatch Connector ---------------------------------------------------

export class PdfWatchSource implements DataSource {
  readonly kind = "pdf_watch" as const;

  async validate(config: unknown): Promise<ValidationResult> {
    const c = config as Record<string, unknown>;
    if (!c.url || typeof c.url !== "string") {
      return { valid: false, errors: ["PDF url is required"] };
    }
    return { valid: true };
  }

  async fetch(context: FetchContext): Promise<FetchResult> {
    const url = context.config.url as string;
    const start = Date.now();

    const res = await globalThis.fetch(url, {
      headers: { "User-Agent": "ZECB-Monitor/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    const buffer = await res.arrayBuffer();
    const size = buffer.byteLength;

    // Full PDF text extraction would use pdfplumber or pdf-parse.
    // For now, track the PDF's metadata (size, status, content hash).
    const hashArray = new Uint8Array(buffer.slice(0, 1024));
    let hash = 0;
    for (const byte of hashArray) {
      hash = ((hash << 5) - hash) + byte;
      hash |= 0;
    }

    return {
      raw_payload: {
        url,
        size_bytes: size,
        content_hash: Math.abs(hash).toString(36),
        http_status: res.status,
        content_type: res.headers.get("content-type") ?? "",
        last_modified: res.headers.get("last-modified") ?? "",
        _note: "Full PDF text extraction requires pdf-parse package",
      },
      fetched_at: new Date().toISOString(),
      http_status: res.status,
      fetch_duration_ms: Date.now() - start,
      retries_used: 0,
    };
  }

  async normalize(raw: FetchResult, context: FetchContext): Promise<NormalizedObservation[]> {
    const payload = raw.raw_payload as Record<string, unknown>;

    return [{
      data_source_id: context.sourceId,
      observed_at: raw.fetched_at,
      dimensions: {
        url: String(payload.url ?? ""),
        content_hash: String(payload.content_hash ?? ""),
        content_type: String(payload.content_type ?? ""),
        last_modified: String(payload.last_modified ?? ""),
      },
      measures: {
        size_bytes: Number(payload.size_bytes ?? 0),
        http_status: raw.http_status ?? 0,
        fetch_ms: raw.fetch_duration_ms,
      },
    }];
  }

  estimateCostPerFetch(): CostEstimate {
    return { cost_eur_per_fetch: 0.001, notes: "PDF download is free; LLM extraction adds ~€0.001/page" };
  }
}

// --- CSV Parser Helper ---------------------------------------------------

function parseCsv(csv: string, expectedColumns?: string[]): Array<Record<string, string>> {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);

  const columns = expectedColumns && expectedColumns.length > 0
    ? expectedColumns
    : headers;

  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < columns.length; j++) {
      row[columns[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
