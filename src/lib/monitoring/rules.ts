import "server-only";

import { chat } from "@/lib/llm/openrouter";
import type { NormalizedObservation } from "./datasource";

export type ConditionType =
  | "threshold"
  | "change_rate"
  | "absence"
  | "presence"
  | "regex_match"
  | "semantic_match"
  | "statistical_anomaly"
  | "deadline_approaching";

export type RuleConfig = {
  condition_type: ConditionType;
  field: string;
  operator?: "gt" | "lt" | "gte" | "lte" | "eq" | "neq";
  value?: number | string;
  percentage?: number;
  window_size?: number;
  sigma?: number;
  pattern?: string;
  days_before?: number;
  date_field?: string;
};

export type EvaluationResult = {
  triggered: boolean;
  message: string;
  details: Record<string, unknown>;
};

export async function evaluateRule(
  config: RuleConfig,
  current: NormalizedObservation,
  previous: NormalizedObservation[],
): Promise<EvaluationResult> {
  switch (config.condition_type) {
    case "threshold":
      return evaluateThreshold(config, current);
    case "change_rate":
      return evaluateChangeRate(config, current, previous);
    case "absence":
      return evaluateAbsence(config, previous);
    case "presence":
      return evaluatePresence(config, current);
    case "regex_match":
      return evaluateRegexMatch(config, current);
    case "statistical_anomaly":
      return evaluateStatisticalAnomaly(config, current, previous);
    case "deadline_approaching":
      return evaluateDeadlineApproaching(config, current);
    case "semantic_match":
      return evaluateSemanticMatch(config, current);
    default:
      return { triggered: false, message: `Unknown condition: ${config.condition_type}`, details: {} };
  }
}

function getFieldValue(obs: NormalizedObservation, field: string): number | string | boolean | undefined {
  return obs.measures[field] ?? obs.dimensions[field] ?? undefined;
}

function getNumericValue(obs: NormalizedObservation, field: string): number | undefined {
  const v = getFieldValue(obs, field);
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function evaluateThreshold(config: RuleConfig, current: NormalizedObservation): EvaluationResult {
  const val = getNumericValue(current, config.field);
  if (val === undefined) {
    return { triggered: false, message: `Field "${config.field}" not found or not numeric`, details: { field: config.field } };
  }
  const target = Number(config.value);
  const op = config.operator ?? "gt";

  const ops: Record<string, (a: number, b: number) => boolean> = {
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    gte: (a, b) => a >= b,
    lte: (a, b) => a <= b,
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
  };

  const check = ops[op];
  const triggered = check ? check(val, target) : false;

  return {
    triggered,
    message: triggered
      ? `${config.field} = ${val} (${op} ${target})`
      : `${config.field} = ${val} (within threshold)`,
    details: { field: config.field, value: val, operator: op, target },
  };
}

function evaluateChangeRate(
  config: RuleConfig,
  current: NormalizedObservation,
  previous: NormalizedObservation[],
): EvaluationResult {
  const currentVal = getNumericValue(current, config.field);
  if (currentVal === undefined) {
    return { triggered: false, message: `Field "${config.field}" not found`, details: {} };
  }

  const prev = previous[0];
  if (!prev) {
    return { triggered: false, message: "No previous observation to compare", details: {} };
  }

  const prevVal = getNumericValue(prev, config.field);
  if (prevVal === undefined || prevVal === 0) {
    return { triggered: false, message: "Previous value missing or zero", details: {} };
  }

  const changeRate = ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
  const threshold = config.percentage ?? 10;
  const triggered = Math.abs(changeRate) > threshold;

  return {
    triggered,
    message: triggered
      ? `${config.field} changed ${changeRate.toFixed(1)}% (threshold: ±${threshold}%)`
      : `${config.field} change ${changeRate.toFixed(1)}% within threshold`,
    details: { field: config.field, current: currentVal, previous: prevVal, changeRate, threshold },
  };
}

function evaluateAbsence(
  config: RuleConfig,
  previous: NormalizedObservation[],
): EvaluationResult {
  const windowSize = config.window_size ?? 3;
  const recentCount = previous.slice(0, windowSize).length;
  const triggered = recentCount === 0;

  return {
    triggered,
    message: triggered
      ? `No observations in the last ${windowSize} checks`
      : `${recentCount} observations found in window`,
    details: { windowSize, recentCount },
  };
}

function evaluatePresence(config: RuleConfig, current: NormalizedObservation): EvaluationResult {
  const val = getFieldValue(current, config.field);
  const target = config.value;

  if (target !== undefined) {
    const triggered = String(val) === String(target);
    return {
      triggered,
      message: triggered
        ? `${config.field} = "${val}" matches target`
        : `${config.field} = "${val}" does not match "${target}"`,
      details: { field: config.field, value: val, target },
    };
  }

  const triggered = val !== undefined && val !== null && val !== "";
  return {
    triggered,
    message: triggered
      ? `${config.field} is present (value: "${val}")`
      : `${config.field} is absent`,
    details: { field: config.field, value: val },
  };
}

function evaluateRegexMatch(config: RuleConfig, current: NormalizedObservation): EvaluationResult {
  const val = String(getFieldValue(current, config.field) ?? "");
  const pattern = config.pattern ?? "";

  try {
    const re = new RegExp(pattern);
    const triggered = re.test(val);
    return {
      triggered,
      message: triggered
        ? `${config.field} matches pattern /${pattern}/`
        : `${config.field} does not match /${pattern}/`,
      details: { field: config.field, value: val, pattern },
    };
  } catch {
    return { triggered: false, message: `Invalid regex: ${pattern}`, details: {} };
  }
}

function evaluateStatisticalAnomaly(
  config: RuleConfig,
  current: NormalizedObservation,
  previous: NormalizedObservation[],
): EvaluationResult {
  const currentVal = getNumericValue(current, config.field);
  if (currentVal === undefined) {
    return { triggered: false, message: `Field "${config.field}" not numeric`, details: {} };
  }

  const windowSize = config.window_size ?? 10;
  const sigma = config.sigma ?? 2;

  const values = previous
    .slice(0, windowSize)
    .map((o) => getNumericValue(o, config.field))
    .filter((v): v is number => v !== undefined);

  if (values.length < 3) {
    return { triggered: false, message: "Not enough data for statistical analysis", details: { dataPoints: values.length } };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);

  if (stddev === 0) {
    return { triggered: false, message: "Zero variance — all values identical", details: { mean } };
  }

  const zScore = Math.abs((currentVal - mean) / stddev);
  const triggered = zScore > sigma;

  return {
    triggered,
    message: triggered
      ? `${config.field} = ${currentVal} is ${zScore.toFixed(1)}σ from mean (threshold: ${sigma}σ)`
      : `${config.field} = ${currentVal} within ${sigma}σ (z=${zScore.toFixed(1)})`,
    details: { field: config.field, value: currentVal, mean, stddev, zScore, sigma },
  };
}

function evaluateDeadlineApproaching(config: RuleConfig, current: NormalizedObservation): EvaluationResult {
  const dateField = config.date_field ?? config.field;
  const daysBefore = config.days_before ?? 7;
  const val = getFieldValue(current, dateField);

  if (!val) {
    return { triggered: false, message: `Date field "${dateField}" not found`, details: {} };
  }

  const deadline = new Date(String(val));
  if (isNaN(deadline.getTime())) {
    return { triggered: false, message: `"${val}" is not a valid date`, details: {} };
  }

  const now = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const triggered = daysRemaining > 0 && daysRemaining <= daysBefore;

  return {
    triggered,
    message: triggered
      ? `Deadline in ${daysRemaining} days (alert threshold: ${daysBefore} days)`
      : daysRemaining <= 0
        ? `Deadline has passed (${Math.abs(daysRemaining)} days ago)`
        : `Deadline in ${daysRemaining} days (safe, threshold: ${daysBefore})`,
    details: { dateField, deadline: deadline.toISOString(), daysRemaining, daysBefore },
  };
}

async function evaluateSemanticMatch(
  config: RuleConfig,
  current: NormalizedObservation,
): Promise<EvaluationResult> {
  const val = String(getFieldValue(current, config.field) ?? "");
  const target = String(config.value ?? "");

  if (!val || !target) {
    return { triggered: false, message: "Field or target value missing for semantic match", details: {} };
  }

  try {
    const response = await chat(
      [
        {
          role: "system",
          content: `You are a semantic similarity judge. Compare the two texts and decide if Text A is meaningfully related to the concept described in Text B. Respond with ONLY a JSON object: {"match": true/false, "confidence": 0.0-1.0, "reason": "one sentence"}`,
        },
        {
          role: "user",
          content: `Text A (observed data):\n${val.slice(0, 1000)}\n\nText B (target concept):\n${target.slice(0, 500)}`,
        },
      ],
      {
        model: process.env.OPENROUTER_REPAIR_MODEL ?? "openai/gpt-4o-mini",
        temperature: 0,
        max_tokens: 200,
      },
    );

    let parsed: { match?: boolean; confidence?: number; reason?: string } = {};
    try {
      const start = response.indexOf("{");
      const end = response.lastIndexOf("}");
      if (start !== -1 && end > start) {
        parsed = JSON.parse(response.slice(start, end + 1));
      }
    } catch {
      return { triggered: false, message: "LLM returned unparseable response", details: { raw: response.slice(0, 200) } };
    }

    const triggered = parsed.match === true && (parsed.confidence ?? 0) >= 0.7;

    return {
      triggered,
      message: triggered
        ? `Semantic match: "${target}" detected (${((parsed.confidence ?? 0) * 100).toFixed(0)}% confidence)`
        : `No semantic match for "${target}" (${((parsed.confidence ?? 0) * 100).toFixed(0)}% confidence)`,
      details: {
        field: config.field,
        target,
        match: parsed.match ?? false,
        confidence: parsed.confidence ?? 0,
        reason: parsed.reason ?? "",
      },
    };
  } catch (err) {
    return {
      triggered: false,
      message: `Semantic match failed: ${err instanceof Error ? err.message : "unknown error"}`,
      details: {},
    };
  }
}
