import { TimeSeriesPoint } from "../types";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";
const CACHE_TTL = 14400; // 4 hours

export async function fetchFredSeries(
  seriesId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortOrder?: "asc" | "desc";
  }
): Promise<TimeSeriesPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error("FRED_API_KEY environment variable is not set");
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: options?.sortOrder ?? "asc",
  });

  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.startDate) params.set("observation_start", options.startDate);
  if (options?.endDate) params.set("observation_end", options.endDate);

  const res = await fetch(`${FRED_BASE_URL}?${params}`, {
    next: { revalidate: CACHE_TTL },
  });

  if (!res.ok) {
    throw new Error(`FRED API error for ${seriesId}: ${res.status}`);
  }

  const data = await res.json();

  if (data.error_code || data.error_message) {
    throw new Error(`FRED API error for ${seriesId}: ${data.error_message ?? data.error_code}`);
  }

  const observations = data.observations ?? [];

  return observations
    .filter(
      (obs: { value: string }) => obs.value !== "." && obs.value !== ""
    )
    .map((obs: { date: string; value: string }) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));
}

export async function fetchMultipleFredSeries(
  seriesIds: string[],
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<Record<string, TimeSeriesPoint[]>> {
  const results = await Promise.allSettled(
    seriesIds.map((id) => fetchFredSeries(id, options))
  );

  const data: Record<string, TimeSeriesPoint[]> = {};
  seriesIds.forEach((id, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      data[id] = result.value;
    } else {
      console.error(`FRED fetch failed for ${id}:`, result.reason);
      data[id] = [];
    }
  });

  return data;
}

export function computeYoY(series: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (series.length < 12) return [];

  const monthly = series.filter((_, i, arr) => {
    if (i === 0) return true;
    return arr[i].date.slice(0, 7) !== arr[i - 1].date.slice(0, 7);
  });

  const result: TimeSeriesPoint[] = [];
  for (let i = 12; i < monthly.length; i++) {
    const current = monthly[i].value;
    const yearAgo = monthly[i - 12].value;
    if (yearAgo !== 0) {
      result.push({
        date: monthly[i].date,
        value: parseFloat((((current - yearAgo) / yearAgo) * 100).toFixed(2)),
      });
    }
  }
  return result;
}

export function computeMonthlyChange(
  series: TimeSeriesPoint[]
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  for (let i = 1; i < series.length; i++) {
    result.push({
      date: series[i].date,
      value: parseFloat(
        ((series[i].value - series[i - 1].value) * 1000).toFixed(1)
      ),
    });
  }
  return result;
}
