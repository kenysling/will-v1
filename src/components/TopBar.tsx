import React from "react";
import { AppView, MembershipTierId } from "../types/estate";

interface TopBarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  currentTier: MembershipTierId;
  onPrimaryAction: () => void;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "builder", label: "Will Builder" },
  { id: "counsel", label: "Estate Counsel" },
  { id: "vault", label: "Asset Vault" },
  { id: "membership", label: "Membership" },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  currentTier,
  onPrimaryAction,
}) => {
  const ctaLabel =
    activeView === "overview"
      ? "Draft Will"
      : currentTier === "essential"
      ? "Upgrade Plan"
      : "Manage Plan";

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          className="font-display text-xl font-semibold tracking-tight text-[#111827] hover:text-[#0F4C3A] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F4C3A] cursor-pointer"
        >
          LegacyDraft
        </button>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F4C3A] ${
                  isActive
                    ? "text-[#0F4C3A] font-semibold"
                    : "text-[#475569] hover:text-[#111827]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[19px] h-[2px] bg-[#0F4C3A]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C3A]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {/* Compact single-row mobile navigation */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden border-t border-[#E2E8F0] px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium bg-white"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive ? "text-[#0F4C3A] font-semibold border-b-2 border-[#0F4C3A]" : "text-[#475569]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
