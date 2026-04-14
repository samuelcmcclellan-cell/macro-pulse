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

interface YahooChartResponse {
  quotes: Record<string, { date: string; close: number }[]>;
  meta: Record<string, { currentPrice: number; ytdReturn: number }>;
}

export default function EarningsModule() {
  // Use S&P 500 earnings yield as a proxy — P/E ratio from earnings data
  // SPY for price reference, and we can derive earnings-related metrics
  const { data, loading, error } = useFetch<YahooChartResponse>(
    "/api/yahoo?symbols=^GSPC&range=5y&interval=1mo"
  );

  if (loading) return <ModuleSkeleton />;

  const spData = data?.quotes?.["^GSPC"] ?? [];
  const spMeta = data?.meta?.["^GSPC"];

  // Approximate trailing P/E and earnings metrics
  // Using the S&P 500 monthly data to show trend
  const chartData = spData
    .filter((p) => p.close > 0)
    .map((p) => ({
      date: p.date.slice(0, 7),
      price: p.close,
    }));

  // Approximate earnings yield (inverse of P/E ~21x)
  const estimatedPE = 21.5;
  const currentPrice = spMeta?.currentPrice ?? 0;
  const estimatedEPS = currentPrice / estimatedPE;
  const earningsYield = (1 / estimatedPE) * 100;

  return (
    <ModuleCard
      title="Earnings"
      source="Yahoo Finance"
      lastUpdated={new Date().toISOString()}
      error={error}
    >
      <div className="flex flex-wrap gap-6 mb-5">
        <StatCallout
          label="S&P 500 Est. P/E"
          value={`${estimatedPE.toFixed(1)}x`}
        />
        <StatCallout
          label="Est. Trailing EPS"
          value={`$${estimatedEPS.toFixed(0)}`}
        />
        <StatCallout
          label="Earnings Yield"
          value={`${earningsYield.toFixed(1)}%`}
        />
      </div>

      <div className="h-48">
        <p className="text-[10px] text-[#5a6478] mb-1">
          S&P 500 — 5Y Monthly (proxy for earnings trend)
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              formatter={(value) => [Number(value).toFixed(0), "S&P 500"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-[#4a5568] mt-2 italic">
        Note: P/E and EPS are estimates. For detailed earnings data, connect a
        premium data source.
      </p>
    </ModuleCard>
  );
}
