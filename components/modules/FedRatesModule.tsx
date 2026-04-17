"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ModuleCard from "../ModuleCard";
import ModuleSkeleton from "../ModuleSkeleton";
import StatCallout from "../StatCallout";
import { useFetch } from "../hooks/useFetch";
import { CHART_COLORS } from "@/lib/config";
import type { FredApiResponse } from "@/lib/types";

export default function FedRatesModule() {
  const { data, loading, error } = useFetch<FredApiResponse>(
    "/api/fred?series=FEDFUNDS,DGS2,DGS10,T10Y2Y&start=2019-01-01"
  );

  if (loading) return <ModuleSkeleton />;

  const fedfunds = data?.series?.FEDFUNDS ?? [];
  const dgs2 = data?.series?.DGS2 ?? [];
  const dgs10 = data?.series?.DGS10 ?? [];
  const spread = data?.series?.T10Y2Y ?? [];

  // Merge by date (monthly sampling for cleaner charts)
  const dateMap = new Map<string, Record<string, number>>();
  const addSeries = (
    series: { date: string; value: number }[],
    key: string
  ) => {
    for (const p of series) {
      const d = p.date.slice(0, 7);
      if (!dateMap.has(d)) dateMap.set(d, {});
      dateMap.get(d)![key] = p.value;
    }
  };

  addSeries(fedfunds, "fedfunds");
  addSeries(dgs2, "dgs2");
  addSeries(dgs10, "dgs10");
  addSeries(spread, "spread");

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-72)
    .map(([date, vals]) => ({ date, ...vals }));

  return (
    <ModuleCard
      title="Fed & Rates"
      source="FRED"
      lastUpdated={data?.meta?.FEDFUNDS?.lastUpdated}
      error={error}
    >
      {(() => {
        const dgs10Val = data?.meta?.DGS10?.latestValue;
        const dgs2Val = data?.meta?.DGS2?.latestValue;
        // Compute spread from displayed yields so it's always internally consistent
        const spreadBps =
          dgs10Val != null && dgs2Val != null
            ? Math.round((dgs10Val - dgs2Val) * 100)
            : null;
        return (
          <div className="flex flex-wrap gap-6 mb-5">
            <StatCallout
              label="Fed Funds Rate"
              value={`${data?.meta?.FEDFUNDS?.latestValue?.toFixed(2) ?? "—"}%`}
            />
            <StatCallout
              label="2Y Treasury"
              value={`${dgs2Val?.toFixed(2) ?? "—"}%`}
            />
            <StatCallout
              label="10Y Treasury"
              value={`${dgs10Val?.toFixed(2) ?? "—"}%`}
            />
            <StatCallout
              label="2s10s Spread"
              value={`${spreadBps != null ? spreadBps : "—"} bps`}
              direction={
                spreadBps != null ? (spreadBps >= 0 ? "up" : "down") : undefined
              }
            />
          </div>
        );
      })()}

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip.bg,
                border: `1px solid ${CHART_COLORS.tooltip.border}`,
                borderRadius: 6,
                color: CHART_COLORS.tooltip.text,
                fontSize: 12,
              }}
              formatter={(value) => `${Number(value).toFixed(2)}%`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: CHART_COLORS.axis }}
            />
            <Line
              type="stepAfter"
              dataKey="fedfunds"
              name="Fed Funds"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="dgs2"
              name="2Y"
              stroke={CHART_COLORS.secondary}
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="dgs10"
              name="10Y"
              stroke={CHART_COLORS.tertiary}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  );
}
