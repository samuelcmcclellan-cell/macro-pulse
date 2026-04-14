import { YahooQuote } from "../types";

const CACHE_TTL = 14400; // 4 hours

export async function fetchYahooChart(
  symbol: string,
  range: string = "1y",
  interval: string = "1d"
): Promise<YahooQuote[]> {
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

  return timestamps.map((ts: number, i: number) => ({
    date: new Date(ts * 1000).toISOString().split("T")[0],
    close: quotes.close?.[i] ?? 0,
    open: quotes.open?.[i] ?? 0,
    high: quotes.high?.[i] ?? 0,
    low: quotes.low?.[i] ?? 0,
    volume: quotes.volume?.[i] ?? 0,
  }));
}

export async function fetchYahooQuoteSummary(symbol: string): Promise<{
  currentPrice: number;
  previousClose: number;
  ytdReturn: number;
  name: string;
}> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=ytd&interval=1d&includePrePost=false`;

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

  const meta = result.meta ?? {};
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
  const currentPrice = meta.regularMarketPrice ?? 0;
  const ytdReturn =
    previousClose !== 0
      ? ((currentPrice - previousClose) / previousClose) * 100
      : 0;

  return {
    currentPrice,
    previousClose,
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
