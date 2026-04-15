import { NextRequest } from "next/server";
import { fetchYahooChart, fetchMultipleYahooQuotes } from "@/lib/api/yahoo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");
  const range = searchParams.get("range") ?? "1y";
  const interval = searchParams.get("interval") ?? "1d";
  const mode = searchParams.get("mode") ?? "chart"; // "chart" | "summary"

  if (!symbolsParam) {
    return Response.json(
      { error: "Missing 'symbols' parameter" },
      { status: 400 }
    );
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim());

  try {
    if (mode === "summary") {
      const summaries = await fetchMultipleYahooQuotes(symbols);
      return Response.json({ data: summaries });
    }

    // Chart mode — fetch full price history for each symbol
    const results = await Promise.allSettled(
      symbols.map((s) => fetchYahooChart(s, range, interval))
    );

    const quotes: Record<string, { date: string; close: number }[]> = {};
    const meta: Record<
      string,
      { currentPrice: number; ytdReturn: number }
    > = {};

    symbols.forEach((s, i) => {
      const result = results[i];
      if (result.status === "fulfilled") {
        const { quotes: q, chartPreviousClose } = result.value;
        quotes[s] = q.map((d) => ({ date: d.date, close: d.close }));
        const last = q[q.length - 1]?.close ?? 0;
        meta[s] = {
          currentPrice: last,
          ytdReturn: chartPreviousClose !== 0 ? ((last - chartPreviousClose) / chartPreviousClose) * 100 : 0,
        };
      } else {
        quotes[s] = [];
        meta[s] = { currentPrice: 0, ytdReturn: 0 };
      }
    });

    return Response.json({ quotes, meta });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
