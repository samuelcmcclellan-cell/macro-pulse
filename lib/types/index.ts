export interface FredObservation {
  date: string;
  value: string;
}

export interface FredSeriesData {
  seriesId: string;
  observations: FredObservation[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface MultiSeriesPoint {
  date: string;
  [seriesKey: string]: string | number;
}

export interface YahooQuote {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface SectorPerformance {
  symbol: string;
  name: string;
  ytdReturn: number;
  currentPrice: number;
}

export interface ModuleSection {
  id: string;
  label: string;
  description: string;
  source: string;
}

export interface StatCalloutData {
  label: string;
  value: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
}

export interface FredApiResponse {
  series: Record<string, TimeSeriesPoint[]>;
  meta: Record<
    string,
    {
      lastUpdated: string;
      latestValue: number;
      latestDate: string;
    }
  >;
}

export interface YahooApiResponse {
  quotes: Record<string, YahooQuote[]>;
  meta: Record<
    string,
    {
      currentPrice: number;
      previousClose: number;
      ytdReturn: number;
      name: string;
    }
  >;
}
