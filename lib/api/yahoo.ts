import { YahooQuote } from "../types";

const CACHE_TTL = 14400; // 4 hours
const SUMMARY_CACHE_TTL = 900; // 15 minutes — sector/summary data should refresh more often

export interface YahooChartResult {
  quotes: YahooQuote[];
  chartPreviousClose: number;
}

export async function fetchYahooChart(
  symbol: string,
  range: string = "1y",
  interval: string = "1d"
): Promise<YahooChartResult> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  const res = await fetch(url, {
    next: { revalidate: CACHE_TTL },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance API error for ${symbol}: ${res.status}`);
  }

  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) {
    throw new Error(`No data returned for ${symbol}`);
  }

  const timestamps: number[] = result.timestamp ?? [];
  const quotes = result.indicators?.quote?.[0] ?? {};
  const meta = result.meta ?? {};

  return {
    quotes: timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      close: quotes.close?.[i] ?? 0,
      open: quotes.open?.[i] ?? 0,
      high: quotes.high?.[i] ?? 0,
      low: quotes.low?.[i] ?? 0,
      volume: quotes.volume?.[i] ?? 0,
    })),
    chartPreviousClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
  };
}

export async function fetchYahooQuoteSummary(symbol: string): Promise<{
  currentPrice: number;
  previousClose: number;
  ytdReturn: number;
  name: string;
}> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=ytd&interval=1d&includePrePost=false`;

  const res = await fetch(url, {
    next: { revalidate: SUMMARY_CACHE_TTL },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance API error for ${symbol}: ${res.status}`);
  }

  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) {
    throw new Error(`No data returned for ${symbol}`);
  }

  const meta = result.meta ?? {};
  const timestamps: number[] = result.timestamp ?? [];
  const indicatorQuotes = result.indicators?.quote?.[0] ?? {};
  const closes: (number | null)[] = indicatorQuotes.close ?? [];

  // Use the last valid close from chart data as a fallback for current price
  const lastValidClose = closes.filter((c): c is number => c != null && c > 0).pop() ?? 0;
  const currentPrice = meta.regularMarketPrice ?? lastValidClose;

  // For YTD base, use chartPreviousClose (the close before the YTD range, i.e. last
  // trading day of previous year). Do NOT fall back to meta.previousClose — that is
  // yesterday's close and would turn the YTD calc into a daily return.
  const ytdBase = meta.chartPreviousClose ?? 0;
  const ytdReturn =
    ytdBase !== 0
      ? ((currentPrice - ytdBase) / ytdBase) * 100
      : 0;

  return {
    currentPrice,
    previousClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
    ytdReturn,
    name: meta.shortName ?? meta.symbol ?? symbol,
  };
}

export async function fetchMultipleYahooQuotes(
  symbols: string[]
): Promise<
  Record<
    string,
    { currentPrice: number; previousClose: number; ytdReturn: number; name: string }
  >
> {
  const results = await Promise.allSettled(
    symbols.map((s) => fetchYahooQuoteSummary(s))
  );

  const data: Record<
    string,
    { currentPrice: number; previousClose: number; ytdReturn: number; name: string }
  > = {};
  symbols.forEach((s, i) => {
    const result = results[i];
    data[s] =
      result.status === "fulfilled"
        ? result.value
        : { currentPrice: 0, previousClose: 0, ytdReturn: 0, name: s };
  });

  return data;
}
