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

function formatDataPeriod(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function InflationModule() {
  const { data, loading, error } = useFetch<FredApiResponse>(
    "/api/fred?series=CPIAUCSL,CPILFESL,PCEPI,PCEPILFE&start=2020-01-01&units=pc1"
  );

  if (loading) return <ModuleSkeleton />;

  const cpi = data?.series?.CPIAUCSL ?? [];
  const coreCpi = data?.series?.CPILFESL ?? [];
  const pce = data?.series?.PCEPI ?? [];
  const corePce = data?.series?.PCEPILFE ?? [];

  // Merge into unified chart data by date
  const dateMap = new Map<string, Record<string, number>>();
  const addSeries = (series: typeof cpi, key: string) => {
    for (const p of series) {
      const d = p.date.slice(0, 7);
      const existing = dateMap.get(d) ?? {};
      existing[key] = p.value;
      dateMap.set(d, existing);
    }
  };
  addSeries(cpi, "cpi");
  addSeries(coreCpi, "coreCpi");
  addSeries(pce, "pce");
  addSeries(corePce, "corePce");

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-48)
    .map(([date, vals]) => ({ date, ...vals }));

  return (
    <ModuleCard
      title="Inflation"
      source="FRED"
      lastUpdated={data?.meta?.CPIAUCSL?.lastUpdated}
      error={error}
    >
      <div className="flex flex-wrap gap-6 mb-5">
        <StatCallout
          label="CPI YoY"
          value={`${data?.meta?.CPIAUCSL?.latestValue?.toFixed(1) ?? "—"}%`}
          direction={
            (data?.meta?.CPIAUCSL?.latestValue ?? 0) > 3 ? "up" : "neutral"
          }
        />
        <StatCallout
          label="Core CPI YoY"
          value={`${data?.meta?.CPILFESL?.latestValue?.toFixed(1) ?? "—"}%`}
          direction={
            (data?.meta?.CPILFESL?.latestValue ?? 0) > 3 ? "up" : "neutral"
          }
        />
        <StatCallout
          label="Core PCE YoY"
          value={`${data?.meta?.PCEPILFE?.latestValue?.toFixed(1) ?? "—"}%`}
          direction={
            (data?.meta?.PCEPILFE?.latestValue ?? 0) > 2.5 ? "up" : "neutral"
          }
        />
      </div>
      {(() => {
        const cpiPeriod = formatDataPeriod(data?.meta?.CPIAUCSL?.latestDate);
        const pcePeriod = formatDataPeriod(data?.meta?.PCEPILFE?.latestDate);
        if (cpiPeriod && pcePeriod && cpiPeriod !== pcePeriod) {
          return (
            <p className="text-[10px] text-[#5a6478] -mt-3 mb-4">
              CPI, Core CPI: {cpiPeriod} · Core PCE: {pcePeriod}
            </p>
          );
        }
        return null;
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
              type="monotone"
              dataKey="cpi"
              name="CPI"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="coreCpi"
              name="Core CPI"
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="corePce"
              name="Core PCE"
              stroke={CHART_COLORS.tertiary}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  );
}
