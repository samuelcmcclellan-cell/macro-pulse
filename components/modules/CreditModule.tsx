"use client";

import {
  AreaChart,
  Area,
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

// TODO(data-team): Verify IG OAS value against FRED series BAMLC0A0CM.
// Apr 2026 audit flagged 82 bps as unverifiable from public sources.
// If the FRED feed is correct, no action needed.
export default function CreditModule() {
  const { data, loading, error } = useFetch<FredApiResponse>(
    "/api/fred?series=BAMLC0A0CM,BAMLH0A0HYM2&start=2019-01-01"
  );

  if (loading) return <ModuleSkeleton />;

  const ig = data?.series?.BAMLC0A0CM ?? [];
  const hy = data?.series?.BAMLH0A0HYM2 ?? [];

  const dateMap = new Map<string, Record<string, number>>();
  for (const p of ig) {
    const d = p.date.slice(0, 7);
    if (!dateMap.has(d)) dateMap.set(d, {});
    dateMap.get(d)!.ig = p.value * 100; // convert % to bps
  }
  for (const p of hy) {
    const d = p.date.slice(0, 7);
    if (!dateMap.has(d)) dateMap.set(d, {});
    dateMap.get(d)!.hy = p.value * 100; // convert % to bps
  }

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-72)
    .map(([date, vals]) => ({ date, ...vals }));

  const latestIG = data?.meta?.BAMLC0A0CM;
  const latestHY = data?.meta?.BAMLH0A0HYM2;

  return (
    <ModuleCard
      title="Credit"
      source="FRED"
      lastUpdated={latestIG?.lastUpdated}
      error={error}
    >
      <div className="flex gap-8 mb-5">
        <StatCallout
          label="IG OAS (bps)"
          value={`${latestIG?.latestValue != null ? (latestIG.latestValue * 100).toFixed(0) : "—"} bps`}
          direction={
            (latestIG?.latestValue ?? 0) * 100 > 150 ? "down" : "neutral"
          }
        />
        <StatCallout
          label="HY OAS (bps)"
          value={`${latestHY?.latestValue != null ? (latestHY.latestValue * 100).toFixed(0) : "—"} bps`}
          direction={
            (latestHY?.latestValue ?? 0) * 100 > 400 ? "down" : "neutral"
          }
        />
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS.secondary}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS.secondary}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="hyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip.bg,
                border: `1px solid ${CHART_COLORS.tooltip.border}`,
                borderRadius: 6,
                color: CHART_COLORS.tooltip.text,
                fontSize: 12,
              }}
              formatter={(value) => `${Number(value).toFixed(0)} bps`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: CHART_COLORS.axis }}
            />
            <Area
              type="monotone"
              dataKey="hy"
              name="HY OAS"
              stroke={CHART_COLORS.primary}
              fill="url(#hyGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="ig"
              name="IG OAS"
              stroke={CHART_COLORS.secondary}
              fill="url(#igGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  );
}
