"use client";

interface StatCalloutProps {
  label: string;
  value: string;
  subValue?: string;
  direction?: "up" | "down" | "neutral";
}

export default function StatCallout({
  label,
  value,
  subValue,
  direction,
}: StatCalloutProps) {
  const dirColor =
    direction === "up"
      ? "text-emerald-400"
      : direction === "down"
        ? "text-red-400"
        : "text-[#8892a4]";

  return (
    <div className="min-w-0">
      <div className="text-3xl font-bold text-[#FF6B2B] leading-tight tracking-tight">
        {value}
      </div>
      <div className="text-xs text-[#8892a4] mt-0.5">{label}</div>
      {subValue && (
        <div className={`text-xs mt-0.5 ${dirColor}`}>{subValue}</div>
      )}
    </div>
  );
}
