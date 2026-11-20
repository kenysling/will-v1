import React, { useEffect, useState } from "react";
import { Check, Lock, ShieldCheck, X } from "lucide-react";
import { MEMBERSHIP_PLANS, PLAN_ORDER, PROMO_CODES } from "../data/plans";
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

const ESTATE_SITUATIONS: Array<{
  id: string;
  label: string;
  recommendedTier: MembershipTierId;
  reason: string;
}> = [
  {
    id: "single",
    label: "Individual · Simple estate",
    recommendedTier: "essential",
    reason: "Essential covers straightforward single wills and 5 core assets at no cost.",
  },
  {
    id: "family",
    label: "Couple · Home or minor kids",
    recommendedTier: "family_guard",
    reason:
      "Family Guard unlocks Mirror Wills, minor guardianship trusts, AI Risk Audit, and clean print packets.",
  },
  {
    id: "wealth",
    label: "Business · Overseas assets",
    recommendedTier: "private_wealth",
    reason:
      "Private Wealth adds business succession clauses, multi-jurisdiction schedules, and an annual Singapore solicitor review credit.",
  },
];

const ExpressPayNowQr: React.FC = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-24 h-24 shrink-0 rounded border border-[#E2E8F0] bg-white p-1.5"
    aria-label="PayNow Singapore Express QR code"
  >
    <rect x="4" y="4" width="24" height="24" fill="none" stroke="#111827" strokeWidth="4" />
    <rect x="11" y="11" width="10" height="10" fill="#111827" />
    <rect x="72" y="4" width="24" height="24" fill="none" stroke="#111827" strokeWidth="4" />
    <rect x="79" y="11" width="10" height="10" fill="#111827" />
    <rect x="4" y="72" width="24" height="24" fill="none" stroke="#111827" strokeWidth="4" />
    <rect x="11" y="79" width="10" height="10" fill="#111827" />
    <rect x="36" y="8" width="8" height="8" fill="#0F4C3A" />
    <rect x="52" y="8" width="12" height="8" fill="#111827" />
    <rect x="36" y="22" width="16" height="8" fill="#111827" />
    <rect x="58" y="22" width="8" height="14" fill="#0F4C3A" />
    <rect x="8" y="38" width="12" height="8" fill="#111827" />
    <rect x="26" y="38" width="18" height="8" fill="#0F4C3A" />
    <rect x="48" y="42" width="14" height="14" fill="#0F4C3A" />
    <rect x="70" y="38" width="10" height="10" fill="#111827" />
    <rect x="84" y="44" width="10" height="14" fill="#111827" />
    <rect x="10" y="54" width="14" height="10" fill="#111827" />
    <rect x="32" y="54" width="10" height="12" fill="#111827" />
    <rect x="68" y="58" width="12" height="8" fill="#0F4C3A" />
    <rect x="36" y="74" width="12" height="8" fill="#111827" />
    <rect x="54" y="72" width="10" height="14" fill="#0F4C3A" />
    <rect x="70" y="74" width="14" height="10" fill="#111827" />
    <rect x="38" y="88" width="16" height="8" fill="#111827" />
    <rect x="72" y="88" width="22" height="8" fill="#0F4C3A" />
  </svg>
);

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
  const [useFreeTrial, setUseFreeTrial] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<"paynow" | "card">("paynow");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [matchedSituationId, setMatchedSituationId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTierId(targetTierId);
      setBillingCycle(initialCycle);
      setUseFreeTrial(targetTierId !== "essential");
      setPromoError(null);
      setMatchedSituationId(null);
    }
  }, [isOpen, targetTierId, initialCycle]);

  if (!isOpen) return null;

  const plan = MEMBERSHIP_PLANS[selectedTierId];
  const isFreeTier = selectedTierId === "essential";
  const isTrialActive = !isFreeTier && useFreeTrial;

  const basePrice =
    billingCycle === "annual" ? plan.annualPriceSgd : plan.monthlyPriceSgd;
  const promoObj = appliedPromo ? PROMO_CODES[appliedPromo] : null;
  const discountAmount = promoObj
    ? Math.round((basePrice * promoObj.discountPercent) / 100)
    : 0;
  const recurringAmount = Math.max(0, basePrice - discountAmount);
  const dueTodayAmount = isTrialActive ? 0 : recurringAmount;
  const annualSavings =
    plan.monthlyPriceSgd > 0 ? plan.monthlyPriceSgd * 12 - plan.annualPriceSgd : 0;

  const matchedSituation = ESTATE_SITUATIONS.find((s) => s.id === matchedSituationId);

  const handleSelectSituation = (sit: (typeof ESTATE_SITUATIONS)[number]) => {
    setMatchedSituationId(sit.id);
    setSelectedTierId(sit.recommendedTier);
    setUseFreeTrial(sit.recommendedTier !== "essential");
  };

  const handleApplyPromoCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoInput(code);
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError("Code not recognized. Try LEGACY20 or SYNTHESIS15.");
    }
  };

  const handleExpressConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentLabel = isFreeTier
      ? "Complimentary Tier"
      : isTrialActive
      ? "14-Day Free Trial (No charge today)"
      : paymentMethod === "paynow"
      ? "Express PayNow Singapore (SGD)"
      : "Express Card on File (Visa ••4242)";

    onConfirmSubscription({
      tierId: selectedTierId,
      billingCycle,
      paymentMethodLabel: paymentLabel,
      finalAmountSgd: dueTodayAmount,
      promoCode: appliedPromo ?? undefined,
      isTrial: isTrialActive,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#111827]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="express-drawer-title"
    >
      {/* Clickable backdrop */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Slide-over Express Subscription Drawer */}
      <div className="w-full max-w-lg bg-white h-full border-l border-[#E2E8F0] shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="text-xs font-medium text-[#475569]">
              Express Subscription · Instant Activation
            </p>
            <h2
              id="express-drawer-title"
              className="font-display text-2xl font-semibold text-[#111827] mt-0.5"
            >
              {isFreeTier ? "Switch to Essential" : `Activate ${plan.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close subscription drawer"
            className="p-2 text-[#64748B] hover:text-[#111827] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleExpressConfirm}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {/* 1. 10-Second Situation Matcher */}
          <div>
            <p className="text-xs font-semibold text-[#111827] mb-2">
              1. Match your estate profile (optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ESTATE_SITUATIONS.map((sit) => {
                const active = matchedSituationId === sit.id;
                return (
                  <button
                    key={sit.id}
                    type="button"
                    onClick={() => handleSelectSituation(sit)}
                    className={`px-3 py-2 text-left text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      active
                        ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.06] text-[#0F4C3A]"
                        : "border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {sit.label}
                  </button>
                );
              })}
            </div>
            {matchedSituation && (
              <p className="text-xs text-[#0F4C3A] mt-2 leading-relaxed">
                Recommended:{" "}
                <strong className="font-semibold">
                  {MEMBERSHIP_PLANS[matchedSituation.recommendedTier].name}
                </strong>{" "}
                — {matchedSituation.reason}
              </p>
            )}
          </div>

          {/* 2. Instant Tier Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#111827]">2. Select plan &amp; cadence</p>
              {!isFreeTier && (
                <div className="inline-flex items-center p-0.5 bg-[#F1F5F9] rounded-md">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      billingCycle === "annual"
                        ? "bg-white text-[#111827] shadow-xs"
                        : "text-[#475569]"
                    }`}
                  >
                    Annual · -20%
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PLAN_ORDER.map((id) => {
                const p = MEMBERSHIP_PLANS[id];
                const selected = selectedTierId === id;
                const priceDisplay =
                  p.monthlyPriceSgd === 0
                    ? "Free"
                    : billingCycle === "annual"
                    ? `S$${Math.round(p.annualPriceSgd / 12)}/mo`
                    : `S$${p.monthlyPriceSgd}/mo`;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedTierId(id);
                      if (id === "essential") setUseFreeTrial(false);
                    }}
                    className={`p-3 text-left rounded-md border transition-colors cursor-pointer ${
                      selected
                        ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05]"
                        : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#111827] truncate">{p.name}</div>
                    <div className="font-mono text-xs tabular-nums text-[#475569] mt-0.5">
                      {priceDisplay}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Zero-Friction 14-Day Free Trial OR Express Payment */}
          {!isFreeTier ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[#111827]">
                3. Choose how to activate
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setUseFreeTrial(true)}
                  className={`p-4 text-left rounded-md border transition-colors cursor-pointer ${
                    useFreeTrial
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#111827]">
                      14-Day Free Trial — S$0 due today
                    </span>
                    <span className="text-xs font-medium text-[#0F4C3A]">Fastest</span>
                  </div>
                  <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                    Unlock every {plan.name} clause, AI Risk Audit, and clean export immediately
                    with no card entry required today. Cancel before renewal at any time.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUseFreeTrial(false)}
                  className={`p-4 text-left rounded-md border transition-colors cursor-pointer ${
                    !useFreeTrial
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#111827]">
                      Pay Now &amp; Lock In{" "}
                      {billingCycle === "annual" ? `S$${annualSavings} Annual Savings` : "Monthly"}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[#111827]">
                      S${recurringAmount}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-1">
                    Instant PayNow Singapore QR or one-tap express card authorization.
                  </p>
                </button>
              </div>

              {/* Express PayNow / Card Sub-panel when Pay Now is selected */}
              {!useFreeTrial && (
                <div className="p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-md space-y-4">
                  <div className="inline-flex p-1 bg-[#E2E8F0]/70 rounded-md">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paynow")}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        paymentMethod === "paynow"
                          ? "bg-white text-[#111827] shadow-xs"
                          : "text-[#475569]"
                      }`}
                    >
                      PayNow QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        paymentMethod === "card"
                          ? "bg-white text-[#111827] shadow-xs"
                          : "text-[#475569]"
                      }`}
                    >
                      Express Card
                    </button>
                  </div>

                  {paymentMethod === "paynow" ? (
                    <div className="flex items-center gap-4">
                      <ExpressPayNowQr />
                      <div className="text-xs text-[#334155] space-y-1">
                        <p className="font-semibold text-[#111827]">
                          Scan with DBS, OCBC, or UOB app
                        </p>
                        <p>
                          UEN:{" "}
                          <span className="font-mono font-medium text-[#111827]">202619842L</span>
                        </p>
                        <p className="font-mono tabular-nums text-[#0F4C3A] font-medium">
                          Amount: S${recurringAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#334155]">
                      <div>
                        <p className="font-semibold text-[#111827]">Visa ending in 4242</p>
                        <p className="text-[#64748B]">Instant one-click Singapore SGD billing</p>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-[#0F4C3A]" />
                    </div>
                  )}
                </div>
              )}

              {/* One-Tap Promo Code */}
              <div className="pt-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium text-[#475569]">Partner discount</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPromoCode("LEGACY20")}
                      className="text-[11px] font-mono font-medium text-[#0F4C3A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Tap to apply LEGACY20 (-20%)
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Optional partner code"
                    className="flex-1 px-3 py-1.5 text-xs font-mono uppercase border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromoCode(promoInput)}
                    className="px-3 py-1.5 text-xs font-medium text-[#111827] border border-[#CBD5E1] hover:border-[#111827] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoObj && (
                  <p className="text-xs text-[#0F4C3A] mt-1">
                    Applied {appliedPromo} — {promoObj.label}.
                  </p>
                )}
                {promoError && <p className="text-xs text-[#DC2626] mt-1">{promoError}</p>}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-md text-xs text-[#475569] leading-relaxed">
              Switching from{" "}
              <strong className="text-[#111827]">
                {MEMBERSHIP_PLANS[currentSubscription.tierId].name}
              </strong>{" "}
              to Essential stops recurring billing immediately. Your saved Will draft and vault
              entries remain preserved.
            </div>
          )}

          {/* Included Summary */}
          <div className="border-t border-[#E2E8F0] pt-4">
            <p className="text-xs font-medium text-[#475569] mb-2">
              Immediately unlocked in {plan.name}
            </p>
            <ul className="space-y-1.5 text-xs text-[#334155]">
              {plan.features.slice(0, 4).map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0F4C3A] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </form>

        {/* Pinned Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#FAFAFA] shrink-0 space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[#475569]">
              {isTrialActive
                ? `Due today (then S$${recurringAmount}/${billingCycle === "annual" ? "yr" : "mo"} after 14 days)`
                : "Total due today"}
            </span>
            <span className="font-mono text-lg font-semibold text-[#111827] tabular-nums">
              S${dueTodayAmount.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExpressConfirm}
            className="w-full py-3 px-4 text-sm font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFreeTier
              ? "Confirm Essential Plan"
              : isTrialActive
              ? `Start 14-Day Free Trial of ${plan.name}`
              : `Activate ${plan.name} · S$${dueTodayAmount.toFixed(2)}`}
          </button>

          <p className="text-[11px] text-[#64748B] flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Instant workspace unlock · Switch or cancel in one click
          </p>
        </div>
      </div>
    </div>
  );
};
