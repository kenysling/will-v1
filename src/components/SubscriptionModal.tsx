import React, { useEffect, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import { MEMBERSHIP_PLANS, PLAN_ORDER } from "../data/plans";
import { BillingCycle, MembershipTierId, SubscriptionState } from "../types/estate";

interface SubscriptionModalProps {
  isOpen: boolean;
  targetTierId: MembershipTierId;
  initialCycle: BillingCycle;
  currentSubscription: SubscriptionState;
  onClose: () => void;
  onConfirmSubscription: (payload: {
    tierId: MembershipTierId;
    billingCycle: BillingCycle;
    paymentMethodLabel: string;
    finalAmountSgd: number;
    promoCode?: string;
    isTrial?: boolean;
  }) => void;
}

const COMPACT_HIGHLIGHTS: Record<MembershipTierId, string[]> = {
  essential: [
    "2 AI-drafted Singapore wills",
    "5 Estate Counsel queries / month",
    "Up to 5 Asset Vault entries",
  ],
  family_guard: [
    "Unlimited Will drafts, Mirror Wills & Trusts",
    "AI Legal Risk Audit with one-click fixes",
    "100 Counsel queries / mo & clean print export",
  ],
  private_wealth: [
    "Unlimited Will drafts & Estate Counsel",
    "Business succession & overseas estate clauses",
    "1 annual Singapore Solicitor review credit",
  ],
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  targetTierId,
  initialCycle,
  currentSubscription,
  onClose,
  onConfirmSubscription,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<MembershipTierId>(targetTierId);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialCycle);
  const [activateMode, setActivateMode] = useState<"trial" | "paynow">("trial");

  useEffect(() => {
    if (isOpen) {
      setSelectedTierId(targetTierId);
      setBillingCycle(initialCycle);
      setActivateMode("trial");
    }
  }, [isOpen, targetTierId, initialCycle]);

  if (!isOpen) return null;

  const plan = MEMBERSHIP_PLANS[selectedTierId];
  const isFreeTier = selectedTierId === "essential";
  const isTrial = !isFreeTier && activateMode === "trial";
  const recurringAmount =
    billingCycle === "annual" ? plan.annualPriceSgd : plan.monthlyPriceSgd;
  const dueToday = isFreeTier || isTrial ? 0 : recurringAmount;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSubscription({
      tierId: selectedTierId,
      billingCycle,
      paymentMethodLabel: isFreeTier
        ? "Complimentary Tier"
        : isTrial
        ? "14-Day Free Trial (S$0 today)"
        : "PayNow Singapore (UEN 202619842L)",
      finalAmountSgd: dueToday,
      isTrial,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simple-subscribe-title"
    >
      <form
        onSubmit={handleConfirm}
        className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div>
            <h2
              id="simple-subscribe-title"
              className="font-display text-xl font-semibold text-[#111827]"
            >
              {isFreeTier ? "Essential Plan" : `Start ${plan.name}`}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isFreeTier ? "Free forever · No billing" : "Instant unlock · Cancel anytime"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Compact Tier Selector */}
          <div className="grid grid-cols-3 gap-2">
            {PLAN_ORDER.map((id) => {
              const p = MEMBERSHIP_PLANS[id];
              const active = selectedTierId === id;
              const priceLabel =
                p.monthlyPriceSgd === 0
                  ? "Free"
                  : billingCycle === "annual"
                  ? `S$${Math.round(p.annualPriceSgd / 12)}/mo`
                  : `S$${p.monthlyPriceSgd}/mo`;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedTierId(id)}
                  className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer ${
                    active
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#111827] truncate">{p.name}</div>
                  <div className="font-mono text-xs tabular-nums text-[#475569] mt-0.5">
                    {priceLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Monthly / Annual + Trial / PayNow Choice */}
          {!isFreeTier ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#475569]">Billing cycle</span>
                <div className="inline-flex p-0.5 bg-[#F1F5F9] rounded-md">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap shrink-0 ${
                      billingCycle === "monthly"
                        ? "bg-white text-[#111827] shadow-xs"
                        : "text-[#475569]"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap shrink-0 ${
                      billingCycle === "annual"
                        ? "bg-white text-[#111827] shadow-xs"
                        : "text-[#475569]"
                    }`}
                  >
                    Annual (-20%)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setActivateMode("trial")}
                  className={`p-3 text-left rounded-md border transition-colors cursor-pointer ${
                    activateMode === "trial"
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#111827]">14-Day Free Trial</div>
                  <div className="text-[11px] text-[#0F4C3A] font-mono tabular-nums mt-0.5">
                    S$0 today
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActivateMode("paynow")}
                  className={`p-3 text-left rounded-md border transition-colors cursor-pointer ${
                    activateMode === "paynow"
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#111827]">PayNow Instant</div>
                  <div className="text-[11px] text-[#475569] font-mono tabular-nums mt-0.5">
                    S${recurringAmount} {billingCycle === "annual" ? "/ yr" : "/ mo"}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#475569] leading-relaxed">
              {currentSubscription.tierId === "essential"
                ? "You are currently on the Essential free tier."
                : "Switching to Essential ends future billing while keeping your saved draft."}
            </p>
          )}

          {/* 3 Crisp Unlocked Features */}
          <ul className="space-y-2 pt-3 border-t border-[#E2E8F0] text-xs text-[#334155]">
            {COMPACT_HIGHLIGHTS[selectedTierId].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#0F4C3A] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Due Today + 1-Click Confirm */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-[#475569]">
                {isTrial
                  ? `Due today (then S$${recurringAmount}/${billingCycle === "annual" ? "yr" : "mo"})`
                  : "Due today"}
              </span>
              <span className="font-mono text-lg font-semibold text-[#111827] tabular-nums">
                S${dueToday.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isFreeTier
                ? "Confirm Free Plan"
                : isTrial
                ? `Start Free Trial of ${plan.name}`
                : `Pay S$${dueToday} & Activate`}
            </button>

            <p className="text-[11px] text-[#64748B] flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              No card required for trial · One-click switch anytime
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
