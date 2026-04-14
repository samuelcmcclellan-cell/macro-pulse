"use client";

export default function ModuleSkeleton() {
  return (
    <div className="bg-[#16213e] rounded-lg border border-[#1e2d4a] p-6 animate-pulse">
      <div className="flex justify-between items-center mb-5">
        <div className="h-5 w-32 bg-[#1e2d4a] rounded" />
        <div className="h-3 w-24 bg-[#1e2d4a] rounded" />
      </div>

      {/* Stat callouts skeleton */}
      <div className="flex gap-6 mb-6">
        <div>
          <div className="h-9 w-24 bg-[#1e2d4a] rounded mb-1" />
          <div className="h-3 w-16 bg-[#1e2d4a] rounded" />
        </div>
        <div>
          <div className="h-9 w-24 bg-[#1e2d4a] rounded mb-1" />
          <div className="h-3 w-16 bg-[#1e2d4a] rounded" />
        </div>
        <div>
          <div className="h-9 w-24 bg-[#1e2d4a] rounded mb-1" />
          <div className="h-3 w-16 bg-[#1e2d4a] rounded" />
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="h-48 bg-[#1e2d4a] rounded" />

      <div className="mt-5 pt-3 border-t border-[#1e2d4a]">
        <div className="h-3 w-20 bg-[#1e2d4a] rounded" />
      </div>
    </div>
  );
}
