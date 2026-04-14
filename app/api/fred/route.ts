import { NextRequest } from "next/server";
import { fetchMultipleFredSeries, computeYoY, computeMonthlyChange } from "@/lib/api/fred";

export const revalidate = 14400; // 4 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seriesParam = searchParams.get("series");
  const startDate = searchParams.get("start") ?? undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : undefined;
  const transform = searchParams.get("transform"); // "yoy" | "mom_change" | null

  if (!seriesParam) {
    return Response.json(
      { error: "Missing 'series' parameter" },
      { status: 400 }
    );
  }

  const seriesIds = seriesParam.split(",").map((s) => s.trim());

  try {
    const rawData = await fetchMultipleFredSeries(seriesIds, {
      startDate,
      limit,
    });

    const series: Record<string, { date: string; value: number }[]> = {};
    const meta: Record<
      string,
      { lastUpdated: string; latestValue: number; latestDate: string }
    > = {};

    for (const [id, points] of Object.entries(rawData)) {
      let transformed = points;

      if (transform === "yoy") {
        transformed = computeYoY(points);
      } else if (transform === "mom_change") {
        transformed = computeMonthlyChange(points);
      }

      series[id] = transformed;

      const latest = transformed[transformed.length - 1];
      meta[id] = {
        lastUpdated: new Date().toISOString(),
        latestValue: latest?.value ?? 0,
        latestDate: latest?.date ?? "",
      };
    }

    const allEmpty = Object.values(series).every((arr) => arr.length === 0);
    if (allEmpty) {
      return Response.json(
        { error: "All FRED series returned empty data — check API key validity", series, meta },
        { status: 502 }
      );
    }

    return Response.json({ series, meta });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
