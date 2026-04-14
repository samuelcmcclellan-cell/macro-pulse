"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo, Suspense } from "react";
import Sidebar from "./Sidebar";
import ModuleSkeleton from "./ModuleSkeleton";
import { DEFAULT_SECTIONS, SECTIONS } from "@/lib/config";

import GrowthModule from "./modules/GrowthModule";
import InflationModule from "./modules/InflationModule";
import LaborModule from "./modules/LaborModule";
import FedRatesModule from "./modules/FedRatesModule";
import CreditModule from "./modules/CreditModule";
import EquitiesModule from "./modules/EquitiesModule";
import EarningsModule from "./modules/EarningsModule";
import FlowsModule from "./modules/FlowsModule";

const MODULE_MAP: Record<string, React.ComponentType> = {
  growth: GrowthModule,
  inflation: InflationModule,
  labor: LaborModule,
  rates: FedRatesModule,
  credit: CreditModule,
  equities: EquitiesModule,
  earnings: EarningsModule,
  flows: FlowsModule,
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeSections = useMemo(() => {
    const param = searchParams.get("sections");
    if (!param) return DEFAULT_SECTIONS;
    const ids = param.split(",").filter((id) => SECTIONS.some((s) => s.id === id));
    return ids.length > 0 ? ids : DEFAULT_SECTIONS;
  }, [searchParams]);

  const handleToggle = useCallback(
    (sectionId: string) => {
      const next = activeSections.includes(sectionId)
        ? activeSections.filter((id) => id !== sectionId)
        : [...activeSections, sectionId];

      const params = new URLSearchParams();
      if (next.length > 0 && next.length < SECTIONS.length) {
        params.set("sections", next.join(","));
      }
      const qs = params.toString();
      router.replace(`/dashboard${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [activeSections, router]
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar activeSections={activeSections} onToggle={handleToggle} />

      <main className="flex-1 p-6 overflow-y-auto">
        {activeSections.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#5a6478]">
            <div className="text-center">
              <p className="text-lg">No modules selected</p>
              <p className="text-sm mt-1">
                Toggle modules in the sidebar to build your view.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-[1600px]">
            {activeSections.map((id) => {
              const Module = MODULE_MAP[id];
              if (!Module) return null;
              return <Module key={id} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardShell() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen">
          <div className="w-64 bg-[#16213e] border-r border-[#1e2d4a]" />
          <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <ModuleSkeleton />
            <ModuleSkeleton />
            <ModuleSkeleton />
            <ModuleSkeleton />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
