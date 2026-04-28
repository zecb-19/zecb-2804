import "server-only";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const USD_TO_EUR = Number(process.env.ZECB_USD_TO_EUR) || 0.93;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterCallOptions = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
  signal?: AbortSignal;
};

export type ChatUsage = {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  cost_eur: number;
};

export type ChatResult = {
  content: string;
  usage: ChatUsage;
  raw: unknown;
};

type OpenRouterResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
  };
  error?: { message?: string };
};

function getKey(): string {
  const key = process.env.OPENROUTER_KEY;
  if (!key) throw new Error("OPENROUTER_KEY is not set");
  return key;
}

export async function chatWithUsage(
  messages: ChatMessage[],
  opts: OpenRouterCallOptions = {},
): Promise<ChatResult> {
  const model =
    opts.model ?? process.env.OPENROUTER_PRIMARY_MODEL ?? "anthropic/claude-sonnet-4.5";

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "Zero Employee",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      response_format: opts.response_format,
      usage: { include: true },
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text || res.statusText}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error?.message) {
    throw new Error(`OpenRouter error: ${json.error.message}`);
  }
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenRouter returned no content");
  }

  const usd = json.usage?.cost ?? 0;
  const usage: ChatUsage = {
    model: json.model ?? model,
    prompt_tokens: json.usage?.prompt_tokens ?? 0,
    completion_tokens: json.usage?.completion_tokens ?? 0,
    total_tokens: json.usage?.total_tokens ?? 0,
    cost_usd: usd,
    cost_eur: Number((usd * USD_TO_EUR).toFixed(6)),
  };

  return { content, usage, raw: json };
}

export async function chat(
  messages: ChatMessage[],
  opts: OpenRouterCallOptions = {},
): Promise<string> {
  const r = await chatWithUsage(messages, opts);
  return r.content;
}
