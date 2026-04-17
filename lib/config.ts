import { ModuleSection } from "./types";

export const SECTIONS: ModuleSection[] = [
  {
    id: "growth",
    label: "Growth",
    description: "Real GDP, growth rates, leading indicators",
    source: "FRED",
  },
  {
    id: "inflation",
    label: "Inflation",
    description: "CPI, Core CPI, PCE, Core PCE",
    source: "FRED",
  },
  {
    id: "labor",
    label: "Labor Market",
    description: "Nonfarm payrolls, unemployment, initial claims",
    source: "FRED",
  },
  {
    id: "rates",
    label: "Fed & Rates",
    description: "Fed funds, 2Y, 10Y yields, 2s10s spread",
    source: "FRED",
  },
  {
    id: "credit",
    label: "Credit",
    description: "IG and HY spreads (OAS)",
    source: "FRED",
  },
  {
    id: "equities",
    label: "Equities",
    description: "S&P 500 performance, sector heatmap",
    source: "Yahoo Finance",
  },
  {
    id: "earnings",
    label: "Earnings",
    description: "S&P 500 EPS, earnings growth",
    source: "FRED",
  },
  {
    id: "flows",
    label: "Flows",
    description: "Fund flows and positioning",
    source: "—",
  },
];

export const DEFAULT_SECTIONS = [
  "growth",
  "inflation",
  "labor",
  "rates",
  "credit",
  "equities",
  "earnings",
  "flows",
];

export const FRED_SERIES = {
  // Growth
  GDPC1: "Real GDP",
  A191RL1Q225SBEA: "Real GDP Growth Rate",
  // Inflation
  CPIAUCSL: "CPI All Urban",
  CPILFESL: "Core CPI",
  PCEPI: "PCE Price Index",
  PCEPILFE: "Core PCE",
  // Labor
  PAYEMS: "Nonfarm Payrolls",
  UNRATE: "Unemployment Rate",
  ICSA: "Initial Claims",
  // Fed & Rates
  FEDFUNDS: "Fed Funds Rate",
  DGS2: "2-Year Treasury",
  DGS10: "10-Year Treasury",
  T10Y2Y: "10Y-2Y Spread",
  // Credit
  BAMLC0A0CM: "IG OAS",
  BAMLH0A0HYM2: "HY OAS",
  // Earnings
  SP500_PE: "S&P 500 P/E Ratio",
} as const;

export const SECTOR_ETFS: Record<string, string> = {
  XLK: "Technology",
  XLV: "Health Care",
  XLF: "Financials",
  XLE: "Energy",
  XLI: "Industrials",
  XLY: "Consumer Disc.",
  XLP: "Consumer Staples",
  XLU: "Utilities",
  XLRE: "Real Estate",
  XLC: "Comm. Services",
  XLB: "Materials",
};

export const CHART_COLORS = {
  primary: "#FF6B2B",
  secondary: "#4A9EFF",
  tertiary: "#22c55e",
  quaternary: "#a855f7",
  grid: "#1e2d4a",
  axis: "#8892a4",
  tooltip: {
    bg: "#16213e",
    border: "#1e2d4a",
    text: "#f0f0f0",
  },
};
