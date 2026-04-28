import "server-only";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

function getKey(): string {
  const key = process.env.OPENROUTER_KEY;
  if (!key) throw new Error("OPENROUTER_KEY is not set");
  return key;
}

export async function chat(
  messages: ChatMessage[],
  opts: OpenRouterCallOptions = {},
): Promise<string> {
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
  return content;
}
