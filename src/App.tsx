import { useEffect, useState } from "react";
import { AssetVault } from "./components/AssetVault";
import { EstateCounsel } from "./components/EstateCounsel";
import { MembershipPage } from "./components/MembershipPage";
import { OverviewPage } from "./components/OverviewPage";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { TopBar } from "./components/TopBar";
import { WillBuilder } from "./components/WillBuilder";
import {
  EMPTY_WILL_PROFILE,
  INITIAL_INVOICES,
  INITIAL_SUBSCRIPTION,
  MEMBERSHIP_PLANS,
  SAMPLE_VAULT_ASSETS,
  SAMPLE_WILL_PROFILE,
} from "./data/plans";
import {
  AppView,
  AuditResult,
  BillingCycle,
  CounselMessage,
  GeneratedWillResult,
  InvoiceRecord,
  MembershipTierId,
  SubscriptionState,
  VaultAsset,
  WillProfile,
} from "./types/estate";

const STORAGE_KEY = "legacydraft_sg_state_v1";

interface PersistedState {
  subscription: SubscriptionState;
  invoices: InvoiceRecord[];
  willProfile: WillProfile;
  generatedWill: GeneratedWillResult | null;
  auditResult: AuditResult | null;
  vaultAssets: VaultAsset[];
  counselMessages: CounselMessage[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        subscription: parsed.subscription ?? INITIAL_SUBSCRIPTION,
        invoices: parsed.invoices ?? INITIAL_INVOICES,
        willProfile: parsed.willProfile ?? EMPTY_WILL_PROFILE,
        generatedWill: parsed.generatedWill ?? null,
        auditResult: parsed.auditResult ?? null,
        vaultAssets: parsed.vaultAssets ?? SAMPLE_VAULT_ASSETS,
        counselMessages: parsed.counselMessages ?? [],
      };
    }
  } catch {
    // Ignore storage read issues and fall back to defaults
  }
  return {
    subscription: INITIAL_SUBSCRIPTION,
    invoices: INITIAL_INVOICES,
    willProfile: EMPTY_WILL_PROFILE,
    generatedWill: null,
    auditResult: null,
    vaultAssets: SAMPLE_VAULT_ASSETS,
    counselMessages: [],
  };
}

export default function App() {
  const initial = loadInitialState();

  const [activeView, setActiveView] = useState<AppView>("overview");
  const [subscription, setSubscription] = useState<SubscriptionState>(initial.subscription);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(initial.invoices);
  const [willProfile, setWillProfile] = useState<WillProfile>(initial.willProfile);
  const [generatedWill, setGeneratedWill] = useState<GeneratedWillResult | null>(
    initial.generatedWill
  );
  const [auditResult, setAuditResult] = useState<AuditResult | null>(initial.auditResult);
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>(initial.vaultAssets);
  const [counselMessages, setCounselMessages] = useState<CounselMessage[]>(
    initial.counselMessages
  );

  // Subscription Checkout Modal state
  const [checkoutModal, setCheckoutModal] = useState<{
    open: boolean;
    tierId: MembershipTierId;
    cycle: BillingCycle;
  }>({
    open: false,
    tierId: "family_guard",
    cycle: "annual",
  });

  // Subtle status toast on plan change
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stateToSave: PersistedState = {
        subscription,
        invoices,
        willProfile,
        generatedWill,
        auditResult,
        vaultAssets,
        counselMessages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore quota errors
    }
  }, [
    subscription,
    invoices,
    willProfile,
    generatedWill,
    auditResult,
    vaultAssets,
    counselMessages,
  ]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const openCheckoutModal = (tierId: MembershipTierId, cycle: BillingCycle) => {
    setCheckoutModal({ open: true, tierId, cycle });
  };

  const handleConfirmSubscription = ({
    tierId,
    billingCycle,
    paymentMethodLabel,
    finalAmountSgd,
    promoCode,
  }: {
    tierId: MembershipTierId;
    billingCycle: BillingCycle;
    paymentMethodLabel: string;
    finalAmountSgd: number;
    promoCode?: string;
  }) => {
    const plan = MEMBERSHIP_PLANS[tierId];
    const now = new Date();
    const renewal = new Date(now);
    if (billingCycle === "annual") {
      renewal.setFullYear(renewal.getFullYear() + 1);
    } else {
      renewal.setMonth(renewal.getMonth() + 1);
    }

    const formattedRenewal = renewal.toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedToday = now.toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setSubscription((prev) => ({
      ...prev,
      tierId,
      billingCycle,
      renewalDate: formattedRenewal,
      paymentMethodLabel,
      promoCodeApplied: promoCode,
      solicitorCreditsRemaining:
        tierId === "private_wealth"
          ? Math.max(prev.solicitorCreditsRemaining, 1)
          : prev.solicitorCreditsRemaining,
    }));

    const newInvoice: InvoiceRecord = {
      id: `INV-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: formattedToday,
      description: `${plan.name} Membership (${
        tierId === "essential" ? "Complimentary" : billingCycle === "annual" ? "Annual" : "Monthly"
      })${promoCode ? ` · Promo ${promoCode}` : ""}`,
      billingCycle,
      amountSgd: finalAmountSgd,
      status: "Paid",
      paymentMethod: paymentMethodLabel,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setCheckoutModal((prev) => ({ ...prev, open: false }));
    setToastMessage(`${plan.name} membership is now active.`);
  };

  const handleBookSolicitorReview = () => {
    const now = new Date();
    const formattedToday = now.toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const usingCredit =
      subscription.tierId === "private_wealth" && subscription.solicitorCreditsRemaining > 0;
    const amount = usingCredit ? 0 : subscription.tierId === "family_guard" ? 180 : 280;

    if (usingCredit) {
      setSubscription((prev) => ({
        ...prev,
        solicitorCreditsRemaining: Math.max(0, prev.solicitorCreditsRemaining - 1),
      }));
    }

    const newInvoice: InvoiceRecord = {
      id: `INV-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: formattedToday,
      description: usingCredit
        ? "Singapore Advocate & Solicitor Will Review (Included Credit)"
        : "Singapore Advocate & Solicitor Will Review (Add-on)",
      billingCycle: "one-time",
      amountSgd: amount,
      status: "Paid",
      paymentMethod: usingCredit
        ? "Private Wealth Included Credit"
        : subscription.paymentMethodLabel === "No payment card on file"
        ? "PayNow Singapore"
        : subscription.paymentMethodLabel,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setToastMessage("Singapore Solicitor Draft Review scheduled.");
  };

  const handleAddAsset = (assetInput: Omit<VaultAsset, "id" | "lastVerified">) => {
    const today = new Date().toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const nextAsset: VaultAsset = {
      ...assetInput,
      id: `asset-${Date.now()}`,
      lastVerified: today,
    };
    setVaultAssets((prev) => [nextAsset, ...prev]);
  };

  const handleDeleteAsset = (id: string) => {
    setVaultAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePrimaryHeaderAction = () => {
    if (activeView === "overview") {
      setActiveView("builder");
      return;
    }
    if (subscription.tierId === "essential") {
      openCheckoutModal("family_guard", "annual");
    } else {
      setActiveView("membership");
    }
  };

  const handleLoadSampleAndOpenBuilder = () => {
    const plan = MEMBERSHIP_PLANS[subscription.tierId];
    setWillProfile({
      ...SAMPLE_WILL_PROFILE,
      includeMirrorWill: plan.limits.includesMirrorWill,
      enableTestamentaryTrust: plan.limits.includesTestamentaryTrust,
    });
    setActiveView("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827]">
      <TopBar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentTier={subscription.tierId}
        onPrimaryAction={handlePrimaryHeaderAction}
      />

      {toastMessage && (
        <div
          role="status"
          className="no-print fixed bottom-6 right-6 z-50 bg-[#111827] text-white px-5 py-3 rounded-md shadow-lg text-xs font-medium flex items-center gap-4"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1">
        {activeView === "overview" && (
          <OverviewPage
            currentTierId={subscription.tierId}
            onNavigate={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSelectPlan={openCheckoutModal}
            onLoadSampleAndOpenBuilder={handleLoadSampleAndOpenBuilder}
          />
        )}

        {activeView === "builder" && (
          <WillBuilder
            profile={willProfile}
            onChangeProfile={setWillProfile}
            generatedWill={generatedWill}
            onSetGeneratedWill={setGeneratedWill}
            auditResult={auditResult}
            onSetAuditResult={setAuditResult}
            subscription={subscription}
            onIncrementWillGeneration={() =>
              setSubscription((prev) => ({
                ...prev,
                willGenerationsUsed: prev.willGenerationsUsed + 1,
              }))
            }
            onPromptUpgrade={openCheckoutModal}
          />
        )}

        {activeView === "counsel" && (
          <EstateCounsel
            messages={counselMessages}
            onAddMessages={(newMsgs) =>
              setCounselMessages((prev) => [...prev, ...newMsgs])
            }
            onResetThread={() => setCounselMessages([])}
            subscription={subscription}
            onIncrementQueryUsage={() =>
              setSubscription((prev) => ({
                ...prev,
                counselQueriesUsed: prev.counselQueriesUsed + 1,
              }))
            }
            willProfile={willProfile}
            onPromptUpgrade={openCheckoutModal}
          />
        )}

        {activeView === "vault" && (
          <AssetVault
            assets={vaultAssets}
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
            subscription={subscription}
            onPromptUpgrade={openCheckoutModal}
          />
        )}

        {activeView === "membership" && (
          <MembershipPage
            subscription={subscription}
            invoices={invoices}
            vaultAssetCount={vaultAssets.length}
            onSelectPlan={openCheckoutModal}
            onBookSolicitorReview={handleBookSolicitorReview}
          />
        )}
      </main>

      <SubscriptionModal
        isOpen={checkoutModal.open}
        targetTierId={checkoutModal.tierId}
        initialCycle={checkoutModal.cycle}
        currentSubscription={subscription}
        onClose={() => setCheckoutModal((prev) => ({ ...prev, open: false }))}
        onConfirmSubscription={handleConfirmSubscription}
      />
    </div>
  );
}
