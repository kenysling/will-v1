import React, { useState } from "react";
import { Check, Lock, X } from "lucide-react";
import { MEMBERSHIP_PLANS, PROMO_CODES } from "../data/plans";
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
  }) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  targetTierId,
  initialCycle,
  currentSubscription,
  onClose,
  onConfirmSubscription,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialCycle);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paynow">("card");
  const [cardHolder, setCardHolder] = useState("Jonathan Tan Wei Ming");
  const [cardLast4, setCardLast4] = useState("4242");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const plan = MEMBERSHIP_PLANS[targetTierId];
  const isDowngradeToFree = targetTierId === "essential";

  const basePrice =
    billingCycle === "annual" ? plan.annualPriceSgd : plan.monthlyPriceSgd;
  const promoObj = appliedPromo ? PROMO_CODES[appliedPromo] : null;
  const discountAmount = promoObj
    ? Math.round((basePrice * promoObj.discountPercent) / 100)
    : 0;
  const finalAmount = Math.max(0, basePrice - discountAmount);
  const annualSavings =
    plan.monthlyPriceSgd > 0 ? plan.monthlyPriceSgd * 12 - plan.annualPriceSgd : 0;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError("Code not recognized. Try LEGACY20 or SYNTHESIS15.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDowngradeToFree && paymentMethod === "card" && !cardHolder.trim()) {
      setFormError("Please enter the cardholder name.");
      return;
    }
    setFormError(null);

    const paymentLabel = isDowngradeToFree
      ? "Complimentary Tier"
      : paymentMethod === "paynow"
      ? "PayNow Corporate (SGD)"
      : `Visa ending in ${cardLast4.replace(/\D/g, "").slice(-4) || "4242"}`;

    onConfirmSubscription({
      tierId: targetTierId,
      billingCycle,
      paymentMethodLabel: paymentLabel,
      finalAmountSgd: finalAmount,
      promoCode: appliedPromo ?? undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-modal-title"
    >
      <div className="w-full max-w-xl bg-white border border-[#E2E8F0] rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <div>
            <p className="text-xs font-medium text-[#475569]">
              Membership Checkout · Singapore (SGD)
            </p>
            <h2
              id="subscription-modal-title"
              className="font-display text-2xl font-semibold text-[#111827] mt-0.5"
            >
              {isDowngradeToFree ? "Switch to Essential Plan" : `Activate ${plan.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close subscription checkout"
            className="p-2 text-[#64748B] hover:text-[#111827] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Billing Cadence Selector */}
          {!isDowngradeToFree && (
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-2">
                Billing Cadence
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-3 text-left rounded-md border transition-colors cursor-pointer ${
                    billingCycle === "monthly"
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.04]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="text-sm font-semibold text-[#111827]">Monthly</div>
                  <div className="text-xs text-[#475569] font-mono tabular-nums mt-0.5">
                    S${plan.monthlyPriceSgd} / month
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  className={`px-4 py-3 text-left rounded-md border transition-colors cursor-pointer ${
                    billingCycle === "annual"
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.04]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#111827]">Annual</span>
                    <span className="text-xs font-medium text-[#0F4C3A]">
                      Save S${annualSavings}
                    </span>
                  </div>
                  <div className="text-xs text-[#475569] font-mono tabular-nums mt-0.5">
                    S${plan.annualPriceSgd} / year
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Included Highlights */}
          <div className="border-y border-[#E2E8F0] py-4">
            <p className="text-xs font-medium text-[#475569] mb-2.5">
              Included with {plan.name}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#334155]">
              {plan.features.slice(0, 4).map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0F4C3A] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Method & Promo (paid tiers only) */}
          {!isDowngradeToFree && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-2">
                  Payment Method
                </label>
                <div className="inline-flex p-1 bg-[#F1F5F9] rounded-md">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      paymentMethod === "card"
                        ? "bg-white text-[#111827] shadow-xs"
                        : "text-[#475569] hover:text-[#111827]"
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paynow")}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      paymentMethod === "paynow"
                        ? "bg-white text-[#111827] shadow-xs"
                        : "text-[#475569] hover:text-[#111827]"
                    }`}
                  >
                    PayNow Singapore
                  </button>
                </div>
              </div>

              {paymentMethod === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="cardholder-input"
                      className="block text-xs font-medium text-[#475569] mb-1"
                    >
                      Name on Card
                    </label>
                    <input
                      id="cardholder-input"
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-md text-[#111827] focus:outline-none focus:border-[#0F4C3A]"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-digits-input"
                      className="block text-xs font-medium text-[#475569] mb-1"
                    >
                      Card Last 4 (Demo)
                    </label>
                    <input
                      id="card-digits-input"
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#CBD5E1] rounded-md text-[#111827] focus:outline-none focus:border-[#0F4C3A]"
                      placeholder="4242"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-md text-xs text-[#334155]">
                  Instant Singapore PayNow billing authorization via UEN{" "}
                  <span className="font-mono font-medium text-[#111827]">202619842L</span>. Your membership activates immediately upon confirmation.
                </div>
              )}

              {/* Promo Code */}
              <div>
                <label
                  htmlFor="promo-code-input"
                  className="block text-xs font-medium text-[#475569] mb-1"
                >
                  Advisory Partner Code (try LEGACY20)
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo-code-input"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 text-sm font-mono uppercase border border-[#CBD5E1] rounded-md text-[#111827] focus:outline-none focus:border-[#0F4C3A]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 text-xs font-medium text-[#111827] border border-[#CBD5E1] hover:border-[#111827] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Apply Code
                  </button>
                </div>
                {promoObj && (
                  <p className="text-xs text-[#0F4C3A] mt-1.5">
                    Applied {appliedPromo} — {promoObj.label}.
                  </p>
                )}
                {promoError && <p className="text-xs text-[#DC2626] mt-1.5">{promoError}</p>}
              </div>
            </div>
          )}

          {isDowngradeToFree && (
            <p className="text-sm text-[#475569] leading-relaxed">
              Switching from{" "}
              <span className="font-medium text-[#111827]">
                {MEMBERSHIP_PLANS[currentSubscription.tierId].name}
              </span>{" "}
              to Essential removes paid renewal charges. Your existing Will draft and recorded assets remain saved, subject to Essential tier editing limits.
            </p>
          )}

          {/* Order Total */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-1.5">
            {!isDowngradeToFree && discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-[#475569]">
                <span>Partner discount ({appliedPromo})</span>
                <span className="font-mono tabular-nums text-[#0F4C3A]">
                  -S${discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-semibold text-[#111827]">
              <span>Total due today</span>
              <span className="font-mono tabular-nums">
                S${finalAmount.toFixed(2)}
                <span className="text-xs font-sans font-normal text-[#64748B] ml-1">
                  {isDowngradeToFree
                    ? "/ free"
                    : billingCycle === "annual"
                    ? "/ year"
                    : "/ month"}
                </span>
              </span>
            </div>
          </div>

          {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B]">
              <Lock className="w-3.5 h-3.5" />
              Instant tier activation · Cancel anytime
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#111827] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isDowngradeToFree ? "Confirm Switch" : "Confirm Membership"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
