import React, { useState } from "react";
import { Check, Download, FileCheck2 } from "lucide-react";
import {
  MEMBERSHIP_PLANS,
  PLAN_COMPARISON_MATRIX,
  PLAN_ORDER,
} from "../data/plans";
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
  const revisionLimit = activePlan.limits.maxWillRevisions;

  const counselPct =
    counselLimit === "unlimited"
      ? 12
      : Math.min(100, Math.round((subscription.counselQueriesUsed / counselLimit) * 100));

  const assetPct =
    assetLimit === "unlimited"
      ? 15
      : Math.min(100, Math.round((vaultAssetCount / assetLimit) * 100));

  const handleDownloadInvoice = (invoice: InvoiceRecord) => {
    const content = [
      "LEGACYDRAFT PTE. LTD. — TAX RECEIPT / INVOICE",
      "Republic of Singapore",
      "------------------------------------------------------------",
      `Invoice ID:      ${invoice.id}`,
      `Date:            ${invoice.date}`,
      `Description:     ${invoice.description}`,
      `Billing Cycle:   ${invoice.billingCycle}`,
      `Payment Method:  ${invoice.paymentMethod}`,
      `Status:          ${invoice.status}`,
      `Amount Paid:     S$${invoice.amountSgd.toFixed(2)}`,
      "------------------------------------------------------------",
      "Thank you for planning your legacy with LegacyDraft.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSolicitorBooking = () => {
    onBookSolicitorReview();
    setBookingFeedback(
      subscription.solicitorCreditsRemaining > 0
        ? "Your complimentary Private Wealth solicitor review credit has been applied. A partner Singapore law firm confirmation has been logged in Billing History."
        : "Solicitor Review add-on scheduled and added to Billing History."
    );
  };

  const solicitorAddOnPrice =
    subscription.tierId === "private_wealth" && subscription.solicitorCreditsRemaining > 0
      ? 0
      : subscription.tierId === "family_guard"
      ? 180
      : 280;

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-12">
      {/* Page Header & Active Subscription Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E2E8F0]">
        <div>
          <p className="text-xs font-medium text-[#475569]">
            Account &amp; Subscriptions
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#111827] tracking-tight mt-1">
            Membership &amp; Billing
          </h1>
          <p className="text-sm text-[#475569] mt-2 max-w-2xl">
            Manage your subscription tier, monitor monthly AI Estate Counsel usage, and download
            Singapore SGD tax invoices.
          </p>
        </div>

        {/* Billing Cadence Toggle */}
        <div className="inline-flex items-center p-1 bg-[#E2E8F0]/70 rounded-md self-start">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              billingCycle === "annual"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#475569] hover:text-[#111827]"
            }`}
          >
            Annual · Save 20%
          </button>
        </div>
      </div>

      {/* Active Plan Summary & Metered Usage */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 lg:pr-6 lg:border-r border-[#E2E8F0]">
            <p className="text-xs font-medium text-[#475569]">Active Membership</p>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="font-display text-2xl font-semibold text-[#111827]">
                {activePlan.name}
              </h2>
              <span className="text-xs font-medium text-[#0F4C3A]">Active</span>
            </div>
            <p className="text-xs text-[#475569] mt-2">{activePlan.audience}</p>

            <dl className="mt-6 space-y-2.5 text-xs border-t border-[#E2E8F0] pt-4">
              <div className="flex justify-between">
                <dt className="text-[#64748B]">Billing cadence</dt>
                <dd className="font-medium text-[#111827] capitalize">
                  {subscription.tierId === "essential" ? "Complimentary" : subscription.billingCycle}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#64748B]">Next renewal date</dt>
                <dd className="font-mono tabular-nums text-[#111827]">
                  {subscription.tierId === "essential" ? "No renewal charge" : subscription.renewalDate}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#64748B]">Payment method</dt>
                <dd className="text-[#111827]">{subscription.paymentMethodLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#64748B]">Solicitor review credits</dt>
                <dd className="font-mono tabular-nums text-[#111827]">
                  {subscription.solicitorCreditsRemaining} remaining
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-medium text-[#475569]">Current Cycle Allowances</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-[#475569]">AI Estate Counsel</span>
                  <span className="font-mono tabular-nums font-medium text-[#111827]">
                    {subscription.counselQueriesUsed} /{" "}
                    {counselLimit === "unlimited" ? "∞" : counselLimit}
                  </span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      counselLimit !== "unlimited" &&
                      subscription.counselQueriesUsed >= counselLimit
                        ? "bg-[#DC2626]"
                        : "bg-[#0F4C3A]"
                    }`}
                    style={{ width: `${counselPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-[#475569]">Asset Vault Entries</span>
                  <span className="font-mono tabular-nums font-medium text-[#111827]">
                    {vaultAssetCount} / {assetLimit === "unlimited" ? "∞" : assetLimit}
                  </span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      assetLimit !== "unlimited" && vaultAssetCount >= assetLimit
                        ? "bg-[#D97706]"
                        : "bg-[#0F4C3A]"
                    }`}
                    style={{ width: `${assetPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-[#475569]">AI Will Revisions</span>
                  <span className="font-mono tabular-nums font-medium text-[#111827]">
                    {subscription.willGenerationsUsed} /{" "}
                    {revisionLimit === "unlimited" ? "∞" : revisionLimit}
                  </span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F4C3A] rounded-full transition-all"
                    style={{
                      width:
                        revisionLimit === "unlimited"
                          ? "15%"
                          : `${Math.min(
                              100,
                              Math.round((subscription.willGenerationsUsed / revisionLimit) * 100)
                            )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* On-Demand Singapore Advocate & Solicitor Review Add-on */}
            <div className="pt-5 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                  <FileCheck2 className="w-4 h-4 text-[#0F4C3A]" />
                  Singapore Advocate &amp; Solicitor Draft Review
                </div>
                <p className="text-xs text-[#475569] mt-1">
                  Have a practicing Singapore wills &amp; probate lawyer review your drafted clauses
                  and attestation instructions within 3 business days.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSolicitorBooking}
                className="px-4 py-2 text-xs font-medium text-[#0F4C3A] border border-[#0F4C3A] hover:bg-[#0F4C3A] hover:text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {solicitorAddOnPrice === 0
                  ? "Redeem Included Credit"
                  : `Book Review · S$${solicitorAddOnPrice}`}
              </button>
            </div>
            {bookingFeedback && (
              <p className="text-xs text-[#0F4C3A] font-medium">{bookingFeedback}</p>
            )}
          </div>
        </div>
      </section>

      {/* Tier Cards */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-[#111827] mb-5">
          Choose Membership Tier
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLAN_ORDER.map((tierId) => {
            const plan = MEMBERSHIP_PLANS[tierId];
            const isCurrent = subscription.tierId === tierId;
            const monthlyEquivalent =
              billingCycle === "annual"
                ? Math.round(plan.annualPriceSgd / 12)
                : plan.monthlyPriceSgd;

            return (
              <div
                key={tierId}
                className={`bg-white rounded-lg p-7 flex flex-col justify-between border ${
                  plan.highlight
                    ? "border-[#0F4C3A] ring-1 ring-[#0F4C3A]/15"
                    : "border-[#E2E8F0]"
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-[#111827]">
                      {plan.name}
                    </h3>
                    {isCurrent ? (
                      <span className="text-xs font-medium text-[#0F4C3A]">Active Plan</span>
                    ) : plan.highlight ? (
                      <span className="text-xs font-medium text-[#8C6D46]">Recommended</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[#475569] mt-1.5 min-h-[2rem]">{plan.audience}</p>

                  <div className="mt-5 pb-5 border-b border-[#E2E8F0]">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-semibold text-[#111827] tabular-nums">
                        S${monthlyEquivalent}
                      </span>
                      <span className="text-xs text-[#64748B]">/ month</span>
                    </div>
                    <p className="text-xs font-mono tabular-nums text-[#64748B] mt-1">
                      {plan.monthlyPriceSgd === 0
                        ? "Free indefinitely"
                        : billingCycle === "annual"
                        ? `S$${plan.annualPriceSgd} billed yearly (save S$${
                            plan.monthlyPriceSgd * 12 - plan.annualPriceSgd
                          })`
                        : "Billed monthly in SGD"}
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-sm text-[#334155]">
                    {plan.features.map((feat) => (
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
                      : isCurrent
                      ? `Switch to ${billingCycle === "annual" ? "Annual" : "Monthly"}`
                      : tierId === "essential"
                      ? "Downgrade to Essential"
                      : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Concrete Comparison Matrix */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-[#111827] mb-5">
          Plan Capabilities &amp; Limits
        </h2>
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA] text-xs font-semibold text-[#475569]">
                <th className="py-3.5 px-5">Capability</th>
                <th className="py-3.5 px-5">Essential (Free)</th>
                <th className="py-3.5 px-5 text-[#0F4C3A]">Family Guard</th>
                <th className="py-3.5 px-5">Private Wealth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {PLAN_COMPARISON_MATRIX.map((row) => (
                <tr key={row.metric} className="hover:bg-[#F8F9FA]/70 transition-colors">
                  <td className="py-3.5 px-5 font-medium text-[#111827]">{row.metric}</td>
                  <td className="py-3.5 px-5 text-[#475569]">{row.essential}</td>
                  <td className="py-3.5 px-5 font-medium text-[#111827]">{row.family_guard}</td>
                  <td className="py-3.5 px-5 text-[#111827]">{row.private_wealth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Billing & Invoice History */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-[#111827] mb-5">
          Billing History &amp; Receipts
        </h2>
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA] text-xs font-semibold text-[#475569]">
                <th className="py-3 px-5">Invoice</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Method</th>
                <th className="py-3 px-5 text-right">Amount (SGD)</th>
                <th className="py-3 px-5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8F9FA]/70 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs text-[#111827] tabular-nums">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#475569] tabular-nums">{inv.date}</td>
                  <td className="py-3.5 px-5 text-[#111827]">
                    {inv.description}
                    <span className="text-xs text-[#64748B] ml-2">· {inv.status}</span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#475569]">{inv.paymentMethod}</td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums text-[#111827]">
                    S${inv.amountSgd.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0F4C3A] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
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
