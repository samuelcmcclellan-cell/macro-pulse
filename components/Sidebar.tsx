"use client";

import { SECTIONS } from "@/lib/config";

interface SidebarProps {
  activeSections: string[];
  onToggle: (sectionId: string) => void;
}

export default function Sidebar({ activeSections, onToggle }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-[#16213e] border-r border-[#1e2d4a] flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-[#1e2d4a]">
        <h1 className="text-xl font-bold text-white tracking-tight">
          <span className="text-[#FF6B2B]">Macro</span>Pulse
        </h1>
        <p className="text-[11px] text-[#5a6478] mt-1">
          Macro Research Dashboard
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a6478] mb-3 px-1">
          Modules
        </p>
        {SECTIONS.map((section) => {
          const isActive = activeSections.includes(section.id);
          return (
            <button
              key={section.id}
              onClick={() => onToggle(section.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left group hover:bg-[#1e2d4a]"
            >
              {/* Toggle switch */}
              <div
                className={`w-8 h-[18px] rounded-full transition-colors relative shrink-0 ${
                  isActive ? "bg-[#FF6B2B]" : "bg-[#2a2a4a]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${
                    isActive ? "left-[16px]" : "left-[2px]"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-[#5a6478]"
                  }`}
                >
                  {section.label}
                </div>
                <div className="text-[10px] text-[#4a5568] truncate">
                  {section.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e2d4a]">
        <p className="text-[10px] text-[#4a5568] text-center">
          Data cached 4hr &middot; {SECTIONS.length} modules
        </p>
      </div>
    </aside>
  );
}
