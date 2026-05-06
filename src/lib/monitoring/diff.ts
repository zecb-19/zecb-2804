import "server-only";

import type { NormalizedObservation } from "./datasource";

export type DiffResult = {
  has_changes: boolean;
  strategy: "deterministic" | "statistical" | "semantic";
  changes: FieldChange[];
  summary: string;
};

export type FieldChange = {
  field: string;
  previous: unknown;
  current: unknown;
  change_type: "added" | "removed" | "modified";
  magnitude?: number;
};

/**
 * Deterministic diff: compare current observation to the N most recent,
 * emit changes when fields differ beyond configured tolerance.
 */
export function deterministicDiff(
  current: NormalizedObservation,
  previous: NormalizedObservation[],
  tolerance: number = 0,
): DiffResult {
  if (previous.length === 0) {
    return {
      has_changes: false,
      strategy: "deterministic",
      changes: [],
      summary: "First observation — no baseline to compare against",
    };
  }

  const prev = previous[0];
  const changes: FieldChange[] = [];

  // Compare measures
  const allMeasureKeys = new Set([
    ...Object.keys(current.measures),
    ...Object.keys(prev.measures),
  ]);

  for (const key of allMeasureKeys) {
    const curVal = current.measures[key];
    const prevVal = prev.measures[key];

    if (prevVal === undefined && curVal !== undefined) {
      changes.push({ field: key, previous: undefined, current: curVal, change_type: "added" });
    } else if (curVal === undefined && prevVal !== undefined) {
      changes.push({ field: key, previous: prevVal, current: undefined, change_type: "removed" });
    } else if (typeof curVal === "number" && typeof prevVal === "number") {
      const diff = Math.abs(curVal - prevVal);
      if (diff > tolerance) {
        changes.push({
          field: key,
          previous: prevVal,
          current: curVal,
          change_type: "modified",
          magnitude: prevVal !== 0 ? ((curVal - prevVal) / Math.abs(prevVal)) * 100 : undefined,
        });
      }
    } else if (String(curVal) !== String(prevVal)) {
      changes.push({ field: key, previous: prevVal, current: curVal, change_type: "modified" });
    }
  }

  // Compare dimensions
  const allDimKeys = new Set([
    ...Object.keys(current.dimensions),
    ...Object.keys(prev.dimensions),
  ]);

  for (const key of allDimKeys) {
    if (key.startsWith("_")) continue; // skip internal fields like _index
    const curVal = current.dimensions[key];
    const prevVal = prev.dimensions[key];

    if (prevVal === undefined && curVal !== undefined) {
      changes.push({ field: key, previous: undefined, current: curVal, change_type: "added" });
    } else if (curVal === undefined && prevVal !== undefined) {
      changes.push({ field: key, previous: prevVal, current: undefined, change_type: "removed" });
    } else if (curVal !== prevVal) {
      changes.push({ field: key, previous: prevVal, current: curVal, change_type: "modified" });
    }
  }

  const summary = changes.length === 0
    ? "No changes detected"
    : `${changes.length} field(s) changed: ${changes.map((c) => c.field).join(", ")}`;

  return {
    has_changes: changes.length > 0,
    strategy: "deterministic",
    changes,
    summary,
  };
}

/**
 * Statistical anomaly detection: compute rolling stats over a window
 * of previous observations and flag outliers.
 */
export function statisticalDiff(
  current: NormalizedObservation,
  previous: NormalizedObservation[],
  sigma: number = 2,
  windowSize: number = 10,
): DiffResult {
  const changes: FieldChange[] = [];
  const window = previous.slice(0, windowSize);

  if (window.length < 3) {
    return {
      has_changes: false,
      strategy: "statistical",
      changes: [],
      summary: "Insufficient data for statistical analysis (need ≥3 observations)",
    };
  }

  for (const [key, value] of Object.entries(current.measures)) {
    if (typeof value !== "number") continue;

    const historicalValues = window
      .map((o) => o.measures[key])
      .filter((v): v is number => typeof v === "number");

    if (historicalValues.length < 3) continue;

    const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
    const variance = historicalValues.reduce((a, b) => a + (b - mean) ** 2, 0) / historicalValues.length;
    const stddev = Math.sqrt(variance);

    if (stddev === 0) continue;

    const zScore = Math.abs((value - mean) / stddev);
    if (zScore > sigma) {
      changes.push({
        field: key,
        previous: mean,
        current: value,
        change_type: "modified",
        magnitude: zScore,
      });
    }
  }

  const summary = changes.length === 0
    ? `All measures within ${sigma}σ of rolling mean`
    : `${changes.length} anomaly(s) detected: ${changes.map((c) => `${c.field} (${(c.magnitude ?? 0).toFixed(1)}σ)`).join(", ")}`;

  return {
    has_changes: changes.length > 0,
    strategy: "statistical",
    changes,
    summary,
  };
}

/**
 * Run all applicable diff strategies and merge results.
 */
export function fullDiff(
  current: NormalizedObservation,
  previous: NormalizedObservation[],
  options?: { tolerance?: number; sigma?: number; windowSize?: number },
): DiffResult[] {
  const results: DiffResult[] = [];

  results.push(deterministicDiff(current, previous, options?.tolerance ?? 0));

  if (previous.length >= 3) {
    results.push(statisticalDiff(current, previous, options?.sigma ?? 2, options?.windowSize ?? 10));
  }

  return results;
}
