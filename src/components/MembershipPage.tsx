import React, { useState } from "react";
import { Check, Download } from "lucide-react";
import { MEMBERSHIP_PLANS, PLAN_ORDER } from "../data/plans";
import {
  BillingCycle,
  InvoiceRecord,
  MembershipTierId,
  SubscriptionState,
} from "../types/estate";

interface MembershipPageProps {
  subscription: SubscriptionState;
  invoices: InvoiceRecord[];
  vaultAssetCount: number;
  onSelectPlan: (tierId: MembershipTierId, cycle: BillingCycle) => void;
  onBookSolicitorReview: () => void;
}

const SHORT_FEATURES: Record<MembershipTierId, string[]> = {
  essential: [
    "2 AI Will drafts & Section 6 checklist",
    "5 AI Estate Counsel questions / month",
    "Up to 5 Asset Vault entries",
  ],
  family_guard: [
    "Unlimited Will drafts, Mirror Wills & Trusts",
    "AI Risk Audit + 100 Counsel queries / month",
    "Unlimited Asset Vault & clean print export",
  ],
  private_wealth: [
    "Everything in Family Guard + unlimited Counsel",
    "Business succession & overseas asset clauses",
    "1 annual Singapore Solicitor review credit",
  ],
};

export const MembershipPage: React.FC<MembershipPageProps> = ({
  subscription,
  invoices,
  vaultAssetCount,
  onSelectPlan,
  onBookSolicitorReview,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription.billingCycle
  );
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  const activePlan = MEMBERSHIP_PLANS[subscription.tierId];
  const counselLimit = activePlan.limits.counselQueriesPerMonth;
  const assetLimit = activePlan.limits.maxVaultAssets;

  const handleDownloadInvoice = (invoice: InvoiceRecord) => {
    const content = [
      "LEGACYDRAFT — RECEIPT",
      `Invoice: ${invoice.id}`,
      `Date: ${invoice.date}`,
      `Item: ${invoice.description}`,
      `Method: ${invoice.paymentMethod}`,
      `Amount: S$${invoice.amountSgd.toFixed(2)}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const solicitorPrice =
    subscription.tierId === "private_wealth" && subscription.solicitorCreditsRemaining > 0
      ? 0
      : subscription.tierId === "family_guard"
      ? 180
      : 280;

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10">
      {/* Header + Billing Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#111827] tracking-tight">
            Membership &amp; Billing
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Active plan: <strong className="text-[#111827]">{activePlan.name}</strong> · Counsel{" "}
            <span className="font-mono tabular-nums">
              {subscription.counselQueriesUsed}/{counselLimit === "unlimited" ? "∞" : counselLimit}
            </span>{" "}
            · Vault{" "}
            <span className="font-mono tabular-nums">
              {vaultAssetCount}/{assetLimit === "unlimited" ? "∞" : assetLimit}
            </span>
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-[#E2E8F0]/70 rounded-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#475569] hover:text-[#111827]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              billingCycle === "annual"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#475569] hover:text-[#111827]"
            }`}
          >
            Annual · Save 20%
          </button>
        </div>
      </div>

      {/* 3 Simple Tier Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLAN_ORDER.map((tierId) => {
          const plan = MEMBERSHIP_PLANS[tierId];
          const isCurrent = subscription.tierId === tierId;
          const monthlyPrice =
            billingCycle === "annual"
              ? Math.round(plan.annualPriceSgd / 12)
              : plan.monthlyPriceSgd;

          return (
            <div
              key={tierId}
              className={`bg-white rounded-lg p-6 flex flex-col justify-between border ${
                plan.highlight
                  ? "border-[#0F4C3A] ring-1 ring-[#0F4C3A]/15"
                  : "border-[#E2E8F0]"
              }`}
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-xl font-semibold text-[#111827]">
                    {plan.name}
                  </h2>
                  {isCurrent ? (
                    <span className="text-xs font-medium text-[#0F4C3A]">Active</span>
                  ) : plan.highlight ? (
                    <span className="text-xs font-medium text-[#8C6D46]">Popular</span>
                  ) : null}
                </div>

                <div className="mt-4 pb-5 border-b border-[#E2E8F0] flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-semibold text-[#111827] tabular-nums">
                    S${monthlyPrice}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {plan.monthlyPriceSgd === 0
                      ? "/ free forever"
                      : billingCycle === "annual"
                      ? `/ mo · S$${plan.annualPriceSgd}/yr`
                      : "/ month"}
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-[#334155]">
                  {SHORT_FEATURES[tierId].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#0F4C3A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => onSelectPlan(tierId, billingCycle)}
                  disabled={isCurrent && subscription.billingCycle === billingCycle}
                  className={`w-full py-2.5 px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isCurrent && subscription.billingCycle === billingCycle
                      ? "bg-[#F1F5F9] text-[#64748B] cursor-default"
                      : plan.highlight
                      ? "bg-[#0F4C3A] text-white hover:bg-[#0A3629] cursor-pointer"
                      : "bg-white text-[#111827] border border-[#CBD5E1] hover:border-[#111827] cursor-pointer"
                  }`}
                >
                  {isCurrent && subscription.billingCycle === billingCycle
                    ? "Current Plan"
                    : tierId === "essential"
                    ? "Switch to Free"
                    : "Start 14-Day Free Trial"}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Optional Solicitor Review Row */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#111827]">
            Optional: Singapore Solicitor Draft Review
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Have a Singapore Advocate &amp; Solicitor review your completed draft within 3 business
            days.
          </p>
          {bookingFeedback && (
            <p className="text-xs font-medium text-[#0F4C3A] mt-2">{bookingFeedback}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            onBookSolicitorReview();
            setBookingFeedback("Solicitor review scheduled and recorded in Billing History.");
          }}
          className="px-4 py-2 text-xs font-medium text-[#0F4C3A] border border-[#0F4C3A] hover:bg-[#0F4C3A] hover:text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {solicitorPrice === 0
            ? "Redeem Included Credit"
            : `Add Review · S$${solicitorPrice}`}
        </button>
      </section>

      {/* Compact Billing History */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl font-semibold text-[#111827]">Billing History</h2>
          <span className="text-xs text-[#64748B]">
            Next renewal:{" "}
            <span className="font-mono tabular-nums text-[#111827]">
              {subscription.tierId === "essential" ? "None" : subscription.renewalDate}
            </span>
          </span>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA] text-xs font-semibold text-[#475569]">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Plan / Item</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8F9FA]/70">
                  <td className="py-3 px-5 text-xs text-[#475569] tabular-nums">{inv.date}</td>
                  <td className="py-3 px-5 text-xs text-[#111827]">{inv.description}</td>
                  <td className="py-3 px-5 text-right font-mono text-xs tabular-nums text-[#111827]">
                    S${inv.amountSgd.toFixed(2)}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0F4C3A] hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
