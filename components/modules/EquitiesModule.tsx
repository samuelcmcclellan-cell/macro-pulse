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
import { CHART_COLORS, SECTOR_ETFS } from "@/lib/config";

interface YahooChartResponse {
  quotes: Record<string, { date: string; close: number }[]>;
  meta: Record<string, { currentPrice: number; ytdReturn: number }>;
}

interface YahooSummaryResponse {
  data: Record<
    string,
    { currentPrice: number; previousClose: number; ytdReturn: number; name: string }
  >;
}

export default function EquitiesModule() {
  const sp500 = useFetch<YahooChartResponse>(
    "/api/yahoo?symbols=^GSPC&range=ytd&interval=1d"
  );
  const sectors = useFetch<YahooSummaryResponse>(
    `/api/yahoo?symbols=${Object.keys(SECTOR_ETFS).join(",")}&mode=summary`
  );

  if (sp500.loading || sectors.loading) return <ModuleSkeleton />;

  const spData = sp500.data?.quotes?.["^GSPC"] ?? [];
  const spMeta = sp500.data?.meta?.["^GSPC"];
  const sectorData = sectors.data?.data ?? {};

  const chartData = spData
    .filter((p) => p.close > 0)
    .map((p) => ({
      date: p.date.slice(5),
      price: p.close,
    }));

  // Build sorted sector performance list
  const sectorPerf = Object.entries(SECTOR_ETFS)
    .map(([symbol, name]) => ({
      symbol,
      name,
      ytd: sectorData[symbol]?.ytdReturn ?? 0,
    }))
    .sort((a, b) => b.ytd - a.ytd);

  return (
    <ModuleCard
      title="Equities"
      source="Yahoo Finance"
      lastUpdated={new Date().toISOString()}
      error={sp500.error || sectors.error}
    >
      <div className="flex gap-8 mb-5">
        <StatCallout
          label="S&P 500"
          value={spMeta?.currentPrice ? spMeta.currentPrice.toFixed(0) : "—"}
        />
        <StatCallout
          label="YTD Return"
          value={
            spMeta?.ytdReturn !== undefined
              ? `${spMeta.ytdReturn >= 0 ? "+" : ""}${spMeta.ytdReturn.toFixed(1)}%`
              : "—"
          }
          direction={
            (spMeta?.ytdReturn ?? 0) >= 0 ? "up" : "down"
          }
        />
      </div>

      {/* S&P 500 YTD Chart */}
      <div className="h-40 mb-5">
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
              tickFormatter={(v) => (v / 1000).toFixed(1) + "K"}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip.bg,
                border: `1px solid ${CHART_COLORS.tooltip.border}`,
                borderRadius: 6,
                color: CHART_COLORS.tooltip.text,
                fontSize: 12,
              }}
              formatter={(value) => [Number(value).toFixed(2), "S&P 500"]}
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

      {/* Sector Performance Heatmap */}
      <div>
        <p className="text-[10px] text-[#5a6478] mb-2">
          Sector YTD Performance
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {sectorPerf.map((s) => {
            const intensity = Math.min(Math.abs(s.ytd) / 20, 1);
            const bgColor =
              s.ytd >= 0
                ? `rgba(34, 197, 94, ${0.15 + intensity * 0.4})`
                : `rgba(239, 68, 68, ${0.15 + intensity * 0.4})`;
            return (
              <div
                key={s.symbol}
                className="rounded px-2 py-1.5 text-center"
                style={{ backgroundColor: bgColor }}
              >
                <div className="text-[10px] text-[#8892a4]">{s.name}</div>
                <div
                  className={`text-xs font-semibold ${s.ytd >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {s.ytd >= 0 ? "+" : ""}
                  {s.ytd.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModuleCard>
  );
}
