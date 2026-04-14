"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ModuleCard from "../ModuleCard";
import ModuleSkeleton from "../ModuleSkeleton";
import StatCallout from "../StatCallout";
import { useFetch } from "../hooks/useFetch";
import { CHART_COLORS } from "@/lib/config";
import type { FredApiResponse } from "@/lib/types";

export default function GrowthModule() {
  const { data, loading, error } = useFetch<FredApiResponse>(
    "/api/fred?series=A191RL1Q225SBEA,GDPC1&start=2015-01-01"
  );

  if (loading) return <ModuleSkeleton />;

  const growthRate = data?.series?.A191RL1Q225SBEA ?? [];
  const gdpLevel = data?.series?.GDPC1 ?? [];
  const latestGrowth = data?.meta?.A191RL1Q225SBEA;
  const latestGdp = data?.meta?.GDPC1;

  const chartData = growthRate.slice(-40).map((p) => ({
    date: p.date.slice(0, 7),
    growth: p.value,
  }));

  return (
    <ModuleCard
      title="Growth"
      source="FRED"
      lastUpdated={latestGrowth?.lastUpdated}
      error={error}
    >
      <div className="flex gap-8 mb-5">
        <StatCallout
          label="Real GDP Growth (SAAR)"
          value={`${latestGrowth?.latestValue?.toFixed(1) ?? "—"}%`}
          subValue={latestGrowth?.latestDate?.slice(0, 7)}
          direction={
            (latestGrowth?.latestValue ?? 0) >= 0 ? "up" : "down"
          }
        />
        <StatCallout
          label="Real GDP Level ($B)"
          value={
            latestGdp?.latestValue
              ? `$${(latestGdp.latestValue / 1000).toFixed(1)}T`
              : "—"
          }
          subValue={latestGdp?.latestDate?.slice(0, 7)}
        />
      </div>

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
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "GDP Growth"]}
            />
            <Line
              type="monotone"
              dataKey="growth"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CHART_COLORS.primary }}
            />
            {/* Zero line */}
            <Line
              type="monotone"
              dataKey={() => 0}
              stroke="#4a5568"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  );
}
