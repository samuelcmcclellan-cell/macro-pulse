"use client";

import {
  BarChart,
  Bar,
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

export default function LaborModule() {
  const payrolls = useFetch<FredApiResponse>(
    "/api/fred?series=PAYEMS&start=2020-01-01&transform=mom_change"
  );
  const rates = useFetch<FredApiResponse>(
    "/api/fred?series=UNRATE,ICSA&start=2020-01-01"
  );

  if (payrolls.loading || rates.loading) return <ModuleSkeleton />;

  const nfpData = (payrolls.data?.series?.PAYEMS ?? []).slice(-24);
  const unrate = rates.data?.series?.UNRATE ?? [];
  const claims = rates.data?.series?.ICSA ?? [];

  const latestNfp = payrolls.data?.meta?.PAYEMS;
  const latestUnrate = rates.data?.meta?.UNRATE;
  const latestClaims = rates.data?.meta?.ICSA;

  const barData = nfpData.map((p) => ({
    date: p.date.slice(0, 7),
    nfp: p.value,
    fill: p.value >= 0 ? CHART_COLORS.primary : "#ef4444",
  }));

  const unrateChart = unrate.slice(-60).map((p) => ({
    date: p.date.slice(0, 7),
    rate: p.value,
  }));

  return (
    <ModuleCard
      title="Labor Market"
      source="FRED"
      lastUpdated={latestNfp?.lastUpdated}
      error={payrolls.error || rates.error}
    >
      <div className="flex flex-wrap gap-6 mb-5">
        <StatCallout
          label="NFP Change (K)"
          value={`${latestNfp?.latestValue !== undefined ? (latestNfp.latestValue >= 0 ? "+" : "") + latestNfp.latestValue.toFixed(0) : "—"}K`}
          direction={
            (latestNfp?.latestValue ?? 0) >= 0 ? "up" : "down"
          }
        />
        <StatCallout
          label="Unemployment"
          value={`${latestUnrate?.latestValue?.toFixed(1) ?? "—"}%`}
        />
        <StatCallout
          label="Initial Claims"
          value={
            latestClaims?.latestValue
              ? `${(latestClaims.latestValue / 1000).toFixed(0)}K`
              : "—"
          }
        />
      </div>

      {/* NFP Bar Chart */}
      <div className="h-40 mb-4">
        <p className="text-[10px] text-[#5a6478] mb-1">
          Monthly Nonfarm Payrolls Change (thousands)
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART_COLORS.axis, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: CHART_COLORS.axis, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip.bg,
                border: `1px solid ${CHART_COLORS.tooltip.border}`,
                borderRadius: 6,
                color: CHART_COLORS.tooltip.text,
                fontSize: 12,
              }}
              formatter={(value) => [`${Number(value).toFixed(0)}K`, "NFP"]}
            />
            <Bar dataKey="nfp" radius={[2, 2, 0, 0]}>
              {barData.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Unemployment Rate Line */}
      <div className="h-32">
        <p className="text-[10px] text-[#5a6478] mb-1">
          Unemployment Rate (%)
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={unrateChart}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART_COLORS.axis, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: CHART_COLORS.axis, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip.bg,
                border: `1px solid ${CHART_COLORS.tooltip.border}`,
                borderRadius: 6,
                color: CHART_COLORS.tooltip.text,
                fontSize: 12,
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "Unemployment"]}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ModuleCard>
  );
}
