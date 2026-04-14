# MacroPulse

Modular macro research dashboard for investment strategy teams. Toggle sections on/off to build custom views across the full macro landscape — growth, inflation, labor, rates, credit, equities, and more.

Built with Next.js, TypeScript, Recharts, and Tailwind CSS. Designed in a BII (BlackRock Institutional Inspired) dark theme.

## Features

- **8 macro modules** — Growth, Inflation, Labor Market, Fed & Rates, Credit, Equities, Earnings, Flows
- **Toggle system** — sidebar switches to show/hide modules
- **Shareable URLs** — active modules encoded in query params (`/dashboard?sections=growth,inflation,rates`)
- **Auto-caching** — 4-hour TTL on all API data (ISR via Next.js fetch revalidation)
- **Loading skeletons** — smooth loading states per module
- **Source labels & timestamps** — every module shows its data source and last update time
- **Responsive** — optimized for desktop, works on tablet

## Data Sources

| Source | Data | API |
|--------|------|-----|
| **FRED** (Federal Reserve) | GDP, CPI, PCE, unemployment, fed funds, yields, credit spreads | `api.stlouisfed.org` |
| **Yahoo Finance** | S&P 500, sector ETFs, price data | `query1.finance.yahoo.com` |

## Getting Started

### 1. Get API Keys

- **FRED API Key** (required): Sign up at [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html) — free, instant approval
- **Yahoo Finance**: No API key required (uses public chart endpoint)

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your FRED API key:

```
FRED_API_KEY=your_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/dashboard`.

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add `FRED_API_KEY` as an environment variable in Vercel project settings
4. Deploy

The app uses Next.js ISR-compatible caching, so FRED/Yahoo data is fetched server-side and cached for 4 hours automatically.

## Project Structure

```
macro-pulse/
  app/
    layout.tsx              # Root layout (Inter font, dark theme)
    page.tsx                # Redirects to /dashboard
    globals.css             # BII dark theme styles
    dashboard/
      page.tsx              # Dashboard page
    api/
      fred/route.ts         # FRED API proxy with caching
      yahoo/route.ts        # Yahoo Finance API proxy with caching
  components/
    DashboardShell.tsx      # Main dashboard client component
    Sidebar.tsx             # Module toggle sidebar
    ModuleCard.tsx          # Shared card wrapper for modules
    ModuleSkeleton.tsx      # Loading skeleton
    StatCallout.tsx         # Big number stat display
    hooks/
      useFetch.ts           # Client-side data fetching hook
    modules/
      GrowthModule.tsx      # Real GDP, growth rate
      InflationModule.tsx   # CPI, Core CPI, PCE, Core PCE (YoY)
      LaborModule.tsx       # NFP bar chart, unemployment line
      FedRatesModule.tsx    # Fed funds, 2Y, 10Y, 2s10s spread
      CreditModule.tsx      # IG and HY OAS area chart
      EquitiesModule.tsx    # S&P 500 YTD + sector heatmap
      EarningsModule.tsx    # Estimated P/E, EPS, earnings yield
      FlowsModule.tsx       # Placeholder (needs premium data)
  lib/
    config.ts               # Section definitions, FRED series, colors
    types/
      index.ts              # TypeScript interfaces
    api/
      fred.ts               # FRED API client functions
      yahoo.ts              # Yahoo Finance API client functions
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FRED_API_KEY` | Yes | Federal Reserve Economic Data API key |

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Recharts** — charts and data visualization
- **Tailwind CSS v4** — styling
- **Inter** — typography (via next/font)
