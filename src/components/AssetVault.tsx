import React, { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { INTESTATE_SCENARIOS, MEMBERSHIP_PLANS } from "../data/plans";
import {
  AssetCategory,
  BillingCycle,
  MembershipTierId,
  PassingMechanism,
  SubscriptionState,
  VaultAsset,
} from "../types/estate";

interface AssetVaultProps {
  assets: VaultAsset[];
  onAddAsset: (asset: Omit<VaultAsset, "id" | "lastVerified">) => void;
  onDeleteAsset: (id: string) => void;
  subscription: SubscriptionState;
  onPromptUpgrade: (tierId: MembershipTierId, cycle: BillingCycle) => void;
}

const CATEGORIES: Array<AssetCategory | "All"> = [
  "All",
  "Property",
  "Cash & Bank",
  "CPF & SRS",
  "Investments",
  "Insurance",
  "Digital Assets",
];

const MECHANISMS: PassingMechanism[] = [
  "Covered by Will",
  "CPF Nomination",
  "Right of Survivorship",
  "Insurance Nomination",
];

function formatSgd(amount: number): string {
  return `S$${amount.toLocaleString("en-SG")}`;
}

export const AssetVault: React.FC<AssetVaultProps> = ({
  assets,
  onAddAsset,
  onDeleteAsset,
  subscription,
  onPromptUpgrade,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "All">("All");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Asset Form State
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [category, setCategory] = useState<AssetCategory>("Cash & Bank");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [passingMechanism, setPassingMechanism] = useState<PassingMechanism>("Covered by Will");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Intestate Succession Simulator State
  const [intestateScenarioId, setIntestateScenarioId] = useState("spouse_children");

  const plan = MEMBERSHIP_PLANS[subscription.tierId];
  const assetLimit = plan.limits.maxVaultAssets;
  const isAtAssetCap = assetLimit !== "unlimited" && assets.length >= assetLimit;

  const totals = useMemo(() => {
    const total = assets.reduce((sum, a) => sum + a.estimatedValueSgd, 0);
    const willCovered = assets
      .filter((a) => a.passingMechanism === "Covered by Will")
      .reduce((sum, a) => sum + a.estimatedValueSgd, 0);
    const nonWill = total - willCovered;
    return { total, willCovered, nonWill };
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCat = selectedCategory === "All" || asset.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        asset.name.toLowerCase().includes(q) ||
        asset.institution.toLowerCase().includes(q) ||
        asset.notes.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [assets, selectedCategory, searchQuery]);

  const activeIntestate =
    INTESTATE_SCENARIOS.find((s) => s.id === intestateScenarioId) ?? INTESTATE_SCENARIOS[1];

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) {
      setFormError("Please enter both an asset title and holding institution.");
      return;
    }
    const numericValue = Number(estimatedValue.replace(/,/g, ""));
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setFormError("Please enter a valid SGD valuation.");
      return;
    }

    onAddAsset({
      name: name.trim(),
      institution: institution.trim(),
      category,
      estimatedValueSgd: numericValue,
      passingMechanism,
      notes: notes.trim() || "Recorded in LegacyDraft Estate Vault.",
    });

    setName("");
    setInstitution("");
    setEstimatedValue("");
    setNotes("");
    setFormError(null);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
        <div>
          <p className="text-xs font-medium text-[#475569]">
            Estate Schedule &amp; Scope Analysis
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#111827] tracking-tight mt-1">
            Asset Vault
          </h1>
          <p className="text-sm text-[#475569] mt-2 max-w-2xl">
            Catalogue Singapore properties, bank accounts, CPF savings, and investments so your
            executors know which assets pass under your Will and which require separate nominations.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs font-mono tabular-nums text-[#475569]">
            {assets.length} / {assetLimit === "unlimited" ? "Unlimited" : assetLimit} assets
          </span>
          {isAtAssetCap ? (
            <button
              type="button"
              onClick={() => onPromptUpgrade("family_guard", "annual")}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Unlock Unlimited Vault
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "Close Form" : "Add Asset"}
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Estate Valuation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-[#E2E8F0] rounded-lg divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
        <div className="p-6">
          <p className="text-xs font-medium text-[#475569]">Total Recorded Estate</p>
          <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums mt-1.5">
            {formatSgd(totals.total)}
          </p>
          <p className="text-xs text-[#64748B] mt-1">Combined Singapore &amp; overseas inventory</p>
        </div>
        <div className="p-6">
          <p className="text-xs font-medium text-[#0F4C3A]">Covered by Will (Probate Estate)</p>
          <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums mt-1.5">
            {formatSgd(totals.willCovered)}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Distributed strictly under your Will clauses
          </p>
        </div>
        <div className="p-6">
          <p className="text-xs font-medium text-[#8C6D46]">
            Passes Outside Will (Nominated / Survivorship)
          </p>
          <p className="font-mono text-2xl font-semibold text-[#111827] tabular-nums mt-1.5">
            {formatSgd(totals.nonWill)}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            CPF nominations, Joint Tenancy &amp; trust policies
          </p>
        </div>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <form
          onSubmit={handleSaveAsset}
          className="bg-white border border-[#0F4C3A]/30 rounded-lg p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#111827]">
              Record Estate Asset
            </h2>
            <span className="text-xs text-[#64748B]">Stored privately in your workspace</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">
                Asset Description
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OCBC 360 Joint Account or HDB Flat"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">
                Institution / Registry
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. DBS Bank, CPF Board, SLA"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">
                Estimated Value (SGD)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="250000"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">
                Legal Passing Mechanism
              </label>
              <select
                value={passingMechanism}
                onChange={(e) => setPassingMechanism(e.target.value as PassingMechanism)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
              >
                {MECHANISMS.map((mech) => (
                  <option key={mech} value={mech}>
                    {mech}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">
                Executor Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Account location, nomination status, co-owner"
                className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
              />
            </div>
          </div>

          {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-[#475569] hover:text-[#111827] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#0F4C3A] hover:bg-[#0A3629] rounded-md cursor-pointer"
            >
              Save to Vault
            </button>
          </div>
        </form>
      )}

      {/* Filter & Ledger Table */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Interactive Category Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#E2E8F0]/60 rounded-md overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white text-[#111827] shadow-xs"
                    : "text-[#475569] hover:text-[#111827]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets or institutions…"
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0F4C3A]"
            />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-x-auto">
          {filteredAssets.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <p className="font-display text-lg font-semibold text-[#111827]">
                No assets match this view
              </p>
              <p className="text-xs text-[#64748B] mt-1">
                Add a property, bank account, or CPF entry to map how your estate transfers.
              </p>
              {!isAtAssetCap && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 text-xs font-medium text-white bg-[#0F4C3A] rounded-md cursor-pointer"
                >
                  Log First Asset
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA] text-xs font-semibold text-[#475569]">
                  <th className="py-3 px-5">Asset &amp; Executor Note</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Legal Mechanism</th>
                  <th className="py-3 px-4 text-right">Est. Value (SGD)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {filteredAssets.map((asset) => {
                  const isWillCovered = asset.passingMechanism === "Covered by Will";
                  return (
                    <tr key={asset.id} className="hover:bg-[#F8F9FA]/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="font-medium text-[#111827]">{asset.name}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {asset.institution} · Updated {asset.lastVerified}
                        </p>
                        <p className="text-xs text-[#475569] mt-1">{asset.notes}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#475569] whitespace-nowrap">
                        {asset.category}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            isWillCovered ? "text-[#0F4C3A]" : "text-[#8C6D46]"
                          }`}
                        >
                          {asset.passingMechanism}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-[#111827] whitespace-nowrap">
                        {formatSgd(asset.estimatedValueSgd)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteAsset(asset.id)}
                          aria-label={`Remove ${asset.name}`}
                          className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Interactive Singapore Intestate Succession Act Simulator */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-[#475569]">
              Statutory Comparison · Non-Muslim Estates
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#111827] mt-1">
              Singapore Intestate Succession Simulator
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed mt-2">
              Without a valid Will, your Will-Covered Estate (currently{" "}
              <span className="font-mono tabular-nums font-medium text-[#111827]">
                {formatSgd(totals.willCovered)}
              </span>
              ) is distributed strictly under Section 7 of Singapore&apos;s Intestate Succession Act.
              Select a family structure to inspect statutory shares:
            </p>

            <div className="mt-5 space-y-1.5">
              {INTESTATE_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setIntestateScenarioId(sc.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    intestateScenarioId === sc.id
                      ? "border-[#0F4C3A] bg-[#0F4C3A]/[0.05] text-[#0F4C3A]"
                      : "border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-6 lg:border-l border-[#E2E8F0] flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono text-[#64748B]">{activeIntestate.statutoryRule}</p>
              <h3 className="font-display text-xl font-semibold text-[#111827] mt-1">
                Distribution if passing without a Will
              </h3>

              <div className="mt-5 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
                {activeIntestate.breakdown.map((item) => {
                  const pctNum = parseInt(item.share, 10) || 0;
                  const sgdShare = Math.round((totals.willCovered * pctNum) / 100);
                  return (
                    <div
                      key={item.recipient}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.recipient}</p>
                        <p className="text-xs text-[#475569] mt-0.5">{item.detail}</p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="font-mono text-lg font-semibold text-[#0F4C3A] tabular-nums">
                          {item.share}
                        </p>
                        <p className="font-mono text-xs text-[#64748B] tabular-nums">
                          {formatSgd(sgdShare)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-[#64748B] mt-6 leading-relaxed">
              Note: For Muslim citizens and permanent residents domiciled in Singapore, intestate
              distribution follows Syariah Faraid inheritance rules under the Administration of Muslim
              Law Act (AMLA) rather than the Intestate Succession Act.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
