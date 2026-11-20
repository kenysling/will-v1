import React, { useState } from "react";
import { ArrowRight, Check, FileText, Scale, ShieldCheck } from "lucide-react";
import { MEMBERSHIP_PLANS, PLAN_ORDER } from "../data/plans";
import { AppView, BillingCycle, MembershipTierId } from "../types/estate";

interface OverviewPageProps {
  currentTierId: MembershipTierId;
  onNavigate: (view: AppView) => void;
  onSelectPlan: (tierId: MembershipTierId, cycle: BillingCycle) => void;
  onLoadSampleAndOpenBuilder: () => void;
}

const HERO_IMAGE = "/src/assets/images/hero_singapore_estate_1795157604942.jpg";
const WILL_IMAGE = "/src/assets/images/editorial_will_execution_1795157604835.jpg";
const VAULT_IMAGE = "/src/assets/images/estate_vault_architecture_1795157604742.jpg";

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currentTierId,
  onNavigate,
  onSelectPlan,
  onLoadSampleAndOpenBuilder,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [heroImgErr, setHeroImgErr] = useState(false);
  const [willImgErr, setWillImgErr] = useState(false);
  const [vaultImgErr, setVaultImgErr] = useState(false);

  return (
    <div className="bg-[#F8F9FA]">
      {/* 1. Hero Section — Asymmetric 2-Column Split (items-stretch) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium text-[#475569] mb-4">
              Singapore Estate Planning · Wills Act (Cap. 352) Aligned
            </p>
            <h1
              className="font-display font-semibold text-[#111827] tracking-tight leading-[1.08] max-w-xl"
              style={{
                fontSize: "clamp(2.35rem, 4vw, 3.65rem)",
                textWrap: "balance",
              }}
            >
              Structured will drafting and AI estate counsel for Singapore families.
            </h1>
            <p className="text-base text-[#475569] leading-relaxed mt-6 max-w-xl">
              Assemble formal testamentary clauses, verify CPF and Joint Tenancy asset boundaries,
              and audit your draft for ambiguities before signing before two witnesses.
            </p>

            <div className="flex flex-wrap items-center gap-5 mt-8">
              <button
                type="button"
                onClick={() => onNavigate("builder")}
                className="animate-cta-flash inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md shadow-md shadow-[#1D4ED8]/25 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
              >
                Build Your Will Now With One Click
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onLoadSampleAndOpenBuilder}
                className="text-sm font-medium text-[#111827] hover:text-[#0F4C3A] underline underline-offset-4 decoration-[#CBD5E1] hover:decoration-[#0F4C3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Preview with Singapore sample family
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#475569]">
              <span>Section 6 Attestation Format</span>
              <span aria-hidden="true">·</span>
              <span>CPF &amp; Joint Tenancy Scope Checks</span>
              <span aria-hidden="true">·</span>
              <span>Private AI Estate Counsel</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[340px] lg:min-h-[460px] rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#E8ECEA] relative">
              {!heroImgErr ? (
                <img
                  src={HERO_IMAGE}
                  alt="Private wealth advisory study overlooking the Singapore Marina Bay skyline with legal folio and fountain pen"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center bg-gradient-to-br from-[#EDF2EF] to-[#DCE4DF]">
                  <Scale className="w-10 h-10 text-[#0F4C3A] mb-3" />
                  <p className="font-display text-lg font-semibold text-[#111827]">
                    Singapore Private Estate Study
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Statutory Key Strip Below Hero */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#E2E8F0] bg-white">
          <div className="p-6 border-b sm:border-b-0 sm:border-r border-[#E2E8F0]">
            <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums">
              6 Steps
            </p>
            <p className="text-xs font-medium text-[#475569] mt-1">
              Guided clause assembly from executors to attestation
            </p>
          </div>
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
            <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums">
              100% Check
            </p>
            <p className="text-xs font-medium text-[#475569] mt-1">
              Automatic validation of residuary shares &amp; substitutes
            </p>
          </div>
          <div className="p-6 border-b sm:border-b-0 sm:border-r border-[#E2E8F0]">
            <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums">
              Section 6
            </p>
            <p className="text-xs font-medium text-[#475569] mt-1">
              Formatted for physical signing with 2 independent witnesses
            </p>
          </div>
          <div className="p-6">
            <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums">
              3 Tiers
            </p>
            <p className="text-xs font-medium text-[#475569] mt-1">
              From Free Essential drafting to Private Wealth succession
            </p>
          </div>
        </div>
      </section>

      {/* 2. Mechanism-to-Outcome Capabilities (Asymmetric Editorial Showcase) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 border-t border-[#E2E8F0]">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium text-[#475569] mb-2">
            Estate Architecture
          </p>
          <h2
            className="font-display text-3xl font-semibold text-[#111827] tracking-tight"
            style={{ textWrap: "balance" }}
          >
            Built around how assets actually pass in Singapore.
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed mt-3">
            A valid will is only part of a sound estate plan. LegacyDraft separates will-covered
            property from CPF nominations, Joint Tenancy survivorship, and statutory insurance trusts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Marquee Left Panel */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-lg overflow-hidden flex flex-col">
            <div className="aspect-[16/9] w-full bg-[#ECEFED] overflow-hidden border-b border-[#E2E8F0]">
              {!willImgErr ? (
                <img
                  src={WILL_IMAGE}
                  alt="Formal bound cotton legal will portfolio with brass paperweight and fountain pen"
                  referrerPolicy="no-referrer"
                  onError={() => setWillImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-9 h-9 text-[#0F4C3A]" />
                </div>
              )}
            </div>
            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[#475569]">01. Guided Drafting &amp; Risk Audit</p>
                <h3 className="font-display text-2xl font-semibold text-[#111827] mt-1.5">
                  Formal Singapore clauses with AI ambiguity review
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed mt-3">
                  Enter executors, minor guardians, delayed vesting ages, and residuary splits.
                  Gemini drafts a complete Singapore Will and flags survivorship gaps, Section 10
                  witness conflicts, and missing substitute appointments with one-click revisions.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#475569]">
                  Includes Section 6 Attestation &amp; Print Packet
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate("builder")}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F4C3A] hover:text-[#0A3629] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Open Will Builder
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Editorial Insights */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden flex-1 flex flex-col">
              <div className="aspect-[16/9] w-full bg-[#ECEFED] overflow-hidden border-b border-[#E2E8F0]">
                {!vaultImgErr ? (
                  <img
                    src={VAULT_IMAGE}
                    alt="Contemporary Singapore private family office consultation room"
                    referrerPolicy="no-referrer"
                    onError={() => setVaultImgErr(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShieldCheck className="w-9 h-9 text-[#0F4C3A]" />
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-[#475569]">02. Asset Vault &amp; Intestate Simulator</p>
                  <h3 className="font-display text-xl font-semibold text-[#111827] mt-1.5">
                    Distinguish distributable vs. nominated wealth
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mt-2">
                    Track properties, CPF balances, brokerage accounts, and policies in one register,
                    and model statutory outcomes under Singapore&apos;s Intestate Succession Act.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => onNavigate("vault")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F4C3A] hover:text-[#0A3629] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Inspect Asset Vault
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
              <p className="text-xs font-medium text-[#475569]">03. AI Estate Counsel</p>
              <h3 className="font-display text-xl font-semibold text-[#111827] mt-1.5">
                On-demand answers grounded in Singapore rules
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mt-2">
                Ask scenario-specific questions on HDB joint tenancy, CPF revocations upon marriage,
                Lasting Power of Attorney (LPA), or Syariah AMLA one-third limits—using your active
                Will profile as context.
              </p>
              <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => onNavigate("counsel")}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F4C3A] hover:text-[#0A3629] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Ask Estate Counsel
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Membership Tiers & Subscription Preview */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-t border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-[#475569] mb-2">
              Membership &amp; Subscriptions
            </p>
            <h2
              className="font-display text-3xl font-semibold text-[#111827] tracking-tight"
              style={{ textWrap: "balance" }}
            >
              Transparent plans for every stage of estate planning.
            </h2>
          </div>

          {/* Interactive Billing Cycle Segmented Control */}
          <div className="inline-flex items-center p-1 bg-[#E2E8F0]/70 rounded-md self-start md:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-[#111827] shadow-xs"
                  : "text-[#475569] hover:text-[#111827]"
              }`}
            >
              Monthly Billing
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

        {/* Quick 10-Second Plan Matcher Bar */}
        <div className="mb-8 p-5 bg-white border border-[#E2E8F0] rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              Not sure which membership fits? Pick your situation to start a 14-day free trial:
            </p>
            <p className="text-xs text-[#475569] mt-0.5">
              Instant activation with S$0 due today — no card details required up front.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectPlan("essential", billingCycle)}
              className="px-3.5 py-2 text-xs font-medium text-[#111827] bg-[#F8F9FA] border border-[#CBD5E1] hover:border-[#0F4C3A] hover:text-[#0F4C3A] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Just Myself → Essential
            </button>
            <button
              type="button"
              onClick={() => onSelectPlan("family_guard", billingCycle)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Spouse &amp; Kids → Family Guard Trial
            </button>
            <button
              type="button"
              onClick={() => onSelectPlan("private_wealth", billingCycle)}
              className="px-3.5 py-2 text-xs font-medium text-[#111827] bg-[#F8F9FA] border border-[#CBD5E1] hover:border-[#0F4C3A] hover:text-[#0F4C3A] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Business / Overseas → Private Wealth Trial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLAN_ORDER.map((tierId) => {
            const plan = MEMBERSHIP_PLANS[tierId];
            const isCurrent = currentTierId === tierId;
            const displayPrice =
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
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold text-[#111827]">
                      {plan.name}
                    </h3>
                    {plan.highlight && (
                      <span className="text-xs font-medium text-[#0F4C3A]">
                        Most Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-1.5 min-h-[2rem]">
                    {plan.audience}
                  </p>

                  <div className="mt-6 pb-6 border-b border-[#E2E8F0]">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-semibold text-[#111827] tabular-nums">
                        {plan.monthlyPriceSgd === 0 ? "S$0" : `S$${displayPrice}`}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        {plan.monthlyPriceSgd === 0 ? "/ forever" : "/ month"}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] font-mono tabular-nums mt-1">
                      {plan.monthlyPriceSgd === 0
                        ? "No card required"
                        : billingCycle === "annual"
                        ? `Billed S$${plan.annualPriceSgd} annually`
                        : "Billed monthly · switch anytime"}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-[#334155]">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#0F4C3A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => onSelectPlan(tierId, billingCycle)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isCurrent
                        ? "bg-[#F1F5F9] text-[#64748B] cursor-default"
                        : plan.highlight
                        ? "bg-[#0F4C3A] text-white hover:bg-[#0A3629] cursor-pointer"
                        : "bg-white text-[#111827] border border-[#CBD5E1] hover:border-[#111827] cursor-pointer"
                    }`}
                  >
                    {isCurrent ? "Current Plan" : `Choose ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-right">
          <button
            type="button"
            onClick={() => onNavigate("membership")}
            className="text-xs font-medium text-[#0F4C3A] hover:underline underline-offset-4 cursor-pointer"
          >
            View full plan comparison matrix &amp; billing management →
          </button>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="font-display text-base font-semibold text-[#111827]">
              LegacyDraft
            </span>
            <p className="text-xs text-[#64748B] mt-1 max-w-xl leading-relaxed">
              LegacyDraft provides structured AI-assisted estate planning preparation aligned with
              Singapore statutory conventions. It is not a law practice under the Legal Profession Act
              and does not constitute formal legal representation. Complex trusts, overseas real
              property, or contested family estates should be reviewed by a Singapore Advocate &amp;
              Solicitor.
            </p>
          </div>
          <div className="text-xs text-[#64748B] whitespace-nowrap shrink-0">
            © 2026 LegacyDraft Pte. Ltd. · Republic of Singapore
          </div>
        </div>
      </footer>
    </div>
  );
};
