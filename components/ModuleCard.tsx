"use client";

import { ReactNode } from "react";

interface ModuleCardProps {
  title: string;
  source: string;
  lastUpdated?: string;
  children: ReactNode;
  error?: string | null;
}

export default function ModuleCard({
  title,
  source,
  lastUpdated,
  children,
  error,
}: ModuleCardProps) {
  return (
    <div className="bg-[#16213e] rounded-lg border border-[#1e2d4a] p-6">
      <div className="flex justify-between items-start mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {lastUpdated && (
          <span className="text-[11px] text-[#5a6478] whitespace-nowrap ml-4">
            Updated{" "}
            {new Date(lastUpdated).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {error ? (
        <div className="text-red-400/80 text-sm py-8 text-center">
          Failed to load data. Check API configuration.
        </div>
      ) : (
        children
      )}

      <div className="mt-5 pt-3 border-t border-[#1e2d4a]">
        <span className="text-[11px] text-[#4a5568]">Source: {source}</span>
      </div>
    </div>
  );
}
