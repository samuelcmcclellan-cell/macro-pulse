"use client";

import ModuleCard from "../ModuleCard";

export default function FlowsModule() {
  return (
    <ModuleCard title="Flows" source="—" lastUpdated={undefined}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#1e2d4a] flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-[#5a6478]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <p className="text-sm text-[#8892a4] mb-1">
          Fund Flows & Positioning
        </p>
        <p className="text-xs text-[#4a5568] max-w-xs">
          This module requires a premium data source (e.g., EPFR, ICI, or
          similar). Connect an API to populate fund flow data, ETF
          creation/redemption, and CFTC positioning.
        </p>
        <div className="mt-4 px-3 py-1.5 rounded bg-[#1e2d4a] text-[10px] text-[#5a6478]">
          Placeholder — awaiting data integration
        </div>
      </div>
    </ModuleCard>
  );
}
