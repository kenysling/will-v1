import {
  InvoiceRecord,
  MembershipTierId,
  PlanDefinition,
  SubscriptionState,
  VaultAsset,
  WillProfile,
} from "../types/estate";

export const MEMBERSHIP_PLANS: Record<MembershipTierId, PlanDefinition> = {
  essential: {
    id: "essential",
    name: "Essential",
    audience: "For individuals drafting a straightforward will",
    monthlyPriceSgd: 0,
    annualPriceSgd: 0,
    limits: {
      counselQueriesPerMonth: 5,
      maxVaultAssets: 5,
      maxWillRevisions: 2,
      familyVaultMembers: 1,
      includesRiskAudit: false,
      includesMirrorWill: false,
      includesTestamentaryTrust: false,
      includesBusinessSuccession: false,
      includesCleanExport: false,
      solicitorReviewCredits: 0,
    },
    features: [
      "Guided 6-step Singapore Will Builder",
      "Up to 2 AI-drafted will revisions",
      "5 AI Estate Counsel questions per month",
      "Up to 5 entries in the Estate Asset Vault",
      "Singapore Intestate Succession Act simulator",
      "Watermarked draft preview & Section 6 checklist",
    ],
  },
  family_guard: {
    id: "family_guard",
    name: "Family Guard",
    audience: "For couples, homeowners & parents with minor children",
    monthlyPriceSgd: 29,
    annualPriceSgd: 278,
    highlight: true,
    limits: {
      counselQueriesPerMonth: 100,
      maxVaultAssets: "unlimited",
      maxWillRevisions: "unlimited",
      familyVaultMembers: 3,
      includesRiskAudit: true,
      includesMirrorWill: true,
      includesTestamentaryTrust: true,
      includesBusinessSuccession: false,
      includesCleanExport: true,
      solicitorReviewCredits: 0,
    },
    features: [
      "Unlimited Will revisions & Mirror Will clauses",
      "100 AI Estate Counsel queries per month",
      "AI Clause Risk & Ambiguity Audit with one-click fixes",
      "Testamentary Trust & Minor Guardianship schedules",
      "Unlimited Asset Vault entries + CPF & Property scope flags",
      "Watermark-free Print & Execution Packet export",
    ],
  },
  private_wealth: {
    id: "private_wealth",
    name: "Private Wealth",
    audience: "For business owners, multi-jurisdiction estates & family offices",
    monthlyPriceSgd: 99,
    annualPriceSgd: 950,
    limits: {
      counselQueriesPerMonth: "unlimited",
      maxVaultAssets: "unlimited",
      maxWillRevisions: "unlimited",
      familyVaultMembers: 6,
      includesRiskAudit: true,
      includesMirrorWill: true,
      includesTestamentaryTrust: true,
      includesBusinessSuccession: true,
      includesCleanExport: true,
      solicitorReviewCredits: 1,
    },
    features: [
      "Everything in Family Guard",
      "Unlimited AI Estate Counsel & Clause Risk Audits",
      "Business Succession & Multi-Jurisdiction asset clauses",
      "Digital Asset & Private Key Fiduciary instructions",
      "1 Annual Singapore Advocate & Solicitor review credit",
      "Executor & Wealth Advisor Vault access (up to 6 seats)",
    ],
  },
};

export const PLAN_ORDER: MembershipTierId[] = ["essential", "family_guard", "private_wealth"];

export interface ComparisonRow {
  metric: string;
  essential: string;
  family_guard: string;
  private_wealth: string;
}

export const PLAN_COMPARISON_MATRIX: ComparisonRow[] = [
  {
    metric: "AI Will Draft Revisions",
    essential: "2 drafts",
    family_guard: "Unlimited",
    private_wealth: "Unlimited",
  },
  {
    metric: "AI Estate Counsel Queries",
    essential: "5 / month",
    family_guard: "100 / month",
    private_wealth: "Unlimited",
  },
  {
    metric: "AI Risk & Ambiguity Audit",
    essential: "Not included",
    family_guard: "Included + 1-click fixes",
    private_wealth: "Included + priority depth",
  },
  {
    metric: "Mirror Will & Spouse Provisions",
    essential: "Not included",
    family_guard: "Included",
    private_wealth: "Included",
  },
  {
    metric: "Testamentary Trust Clauses",
    essential: "Standard age 21",
    family_guard: "Custom ages (21 / 25 / 30)",
    private_wealth: "Custom + discretionary notes",
  },
  {
    metric: "Business & Overseas Asset Schedules",
    essential: "Not included",
    family_guard: "Not included",
    private_wealth: "Included",
  },
  {
    metric: "Estate Asset Vault Capacity",
    essential: "Up to 5 assets",
    family_guard: "Unlimited assets",
    private_wealth: "Unlimited + 6 shared seats",
  },
  {
    metric: "Execution Packet Export",
    essential: "Draft watermark",
    family_guard: "Clean legal print & .doc",
    private_wealth: "Clean print, .doc & LPA guide",
  },
  {
    metric: "Singapore Solicitor Review Credit",
    essential: "S$280 add-on",
    family_guard: "S$180 member rate",
    private_wealth: "1 annual review included",
  },
];

export const PROMO_CODES: Record<string, { discountPercent: number; label: string }> = {
  LEGACY20: { discountPercent: 20, label: "20% off first billing cycle" },
  SYNTHESIS15: { discountPercent: 15, label: "15% wealth advisory partner discount" },
};

export const INITIAL_SUBSCRIPTION: SubscriptionState = {
  tierId: "essential",
  billingCycle: "annual",
  renewalDate: "19 Dec 2026",
  counselQueriesUsed: 1,
  willGenerationsUsed: 0,
  paymentMethodLabel: "No payment card on file",
  solicitorCreditsRemaining: 0,
};

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2026-0814",
    date: "19 Nov 2026",
    description: "Essential Membership Activation",
    billingCycle: "monthly",
    amountSgd: 0,
    status: "Paid",
    paymentMethod: "Complimentary Tier",
  },
];

export const EMPTY_WILL_PROFILE: WillProfile = {
  fullName: "",
  nricMasked: "",
  address: "",
  domicile: "Republic of Singapore",
  maritalStatus: "Married",
  isMuslimEstate: false,
  includeMirrorWill: false,
  spouseName: "",
  primaryExecutorName: "",
  primaryExecutorRelationship: "Spouse",
  substituteExecutorName: "",
  substituteExecutorRelationship: "Sibling",
  hasMinorChildren: false,
  minorChildrenNames: "",
  primaryGuardianName: "",
  substituteGuardianName: "",
  minorVestingAge: 21,
  enableTestamentaryTrust: false,
  trustDistributionsNote: "",
  properties: [],
  specificGifts: [],
  beneficiaries: [
    {
      id: "ben-1",
      fullName: "",
      relationship: "Spouse",
      idLast4: "",
      percentage: 100,
      substituteInstruction: "To my surviving children in equal shares",
    },
  ],
  survivorshipDays: 30,
  funeralWishes: "Cremation",
  funeralNote: "",
  digitalAssetsNote: "",
  businessSuccessionNote: "",
  overseasAssetsNote: "",
};

export const SAMPLE_WILL_PROFILE: WillProfile = {
  fullName: "Jonathan Tan Wei Ming",
  nricMasked: "S****482E",
  address: "18 Bukit Timah Avenue, #12-04, Singapore 269708",
  domicile: "Republic of Singapore",
  maritalStatus: "Married",
  isMuslimEstate: false,
  includeMirrorWill: true,
  spouseName: "Rachel Lim Hui Ling",
  primaryExecutorName: "Rachel Lim Hui Ling",
  primaryExecutorRelationship: "Spouse",
  substituteExecutorName: "Daniel Tan Wei Jie",
  substituteExecutorRelationship: "Brother",
  hasMinorChildren: true,
  minorChildrenNames: "Ethan Tan Kai En (age 9) and Chloe Tan Xin Yi (age 6)",
  primaryGuardianName: "Daniel Tan Wei Jie",
  substituteGuardianName: "Grace Lim Shu Fen",
  minorVestingAge: 25,
  enableTestamentaryTrust: true,
  trustDistributionsNote:
    "Trustees may apply income and up to 25% of capital annually for university education, healthcare, and housing maintenance prior to vesting at age 25.",
  properties: [
    {
      id: "prop-1",
      address: "18 Bukit Timah Avenue, #12-04, Singapore 269708",
      holdingType: "joint_tenancy",
      ownershipShare: "Joint Tenants with Rachel Lim Hui Ling",
      intendedRecipient: "Surviving Joint Tenant (outside Will); if simultaneous passing, into Residuary Estate",
    },
    {
      id: "prop-2",
      address: "42 Meyer Road, #08-02, Singapore 437868",
      holdingType: "tenancy_in_common",
      ownershipShare: "50% undivided share",
      intendedRecipient: "Residuary Estate",
    },
  ],
  specificGifts: [
    {
      id: "gift-1",
      itemDescription: "Patek Philippe Calatrava wristwatch and heirloom gold cufflinks",
      recipientName: "Ethan Tan Kai En",
      recipientRelationship: "Son",
    },
    {
      id: "gift-2",
      itemDescription: "Cash legacy of S$30,000 for charitable education bursary",
      recipientName: "Community Chest Singapore",
      recipientRelationship: "Charity",
    },
  ],
  beneficiaries: [
    {
      id: "ben-1",
      fullName: "Rachel Lim Hui Ling",
      relationship: "Spouse",
      idLast4: "914G",
      percentage: 50,
      substituteInstruction: "Equally to my surviving children per stirpes",
    },
    {
      id: "ben-2",
      fullName: "Ethan Tan Kai En",
      relationship: "Son",
      idLast4: "205D",
      percentage: 25,
      substituteInstruction: "To his issue, or failing which to Chloe Tan Xin Yi",
    },
    {
      id: "ben-3",
      fullName: "Chloe Tan Xin Yi",
      relationship: "Daughter",
      idLast4: "718A",
      percentage: 25,
      substituteInstruction: "To her issue, or failing which to Ethan Tan Kai En",
    },
  ],
  survivorshipDays: 30,
  funeralWishes: "Cremation",
  funeralNote: "Simple private Christian memorial service; ashes interred at Mandai Columbarium.",
  digitalAssetsNote:
    "Password manager master recovery sheet is stored in DBS Safe Deposit Box #412 (Raffles Place). Executors may archive or close personal email, cloud storage, and brokerage portals.",
  businessSuccessionNote:
    "My 60% shareholding in Meridian Precision Engineering Pte. Ltd. (UEN 201812940K) shall be offered first to my co-founder under our existing Buy-Sell Shareholder Agreement, with sale proceeds forming part of my Residuary Estate.",
  overseasAssetsNote:
    "Separate Australian Will covers Melbourne investment apartment; this Singapore Will expressly does not revoke my Australian testamentary instrument.",
};

export const SAMPLE_VAULT_ASSETS: VaultAsset[] = [
  {
    id: "asset-1",
    name: "Bukit Timah Residence (Condominium)",
    institution: "SLA Title — Joint Tenancy",
    category: "Property",
    estimatedValueSgd: 2450000,
    passingMechanism: "Right of Survivorship",
    notes: "Held as Joint Tenants with spouse; passes automatically outside this Will unless severed.",
    lastVerified: "14 Nov 2026",
  },
  {
    id: "asset-2",
    name: "Meyer Road Investment Share (50%)",
    institution: "SLA Title — Tenancy-in-Common",
    category: "Property",
    estimatedValueSgd: 920000,
    passingMechanism: "Covered by Will",
    notes: "50% undivided share distributes strictly according to Residuary Estate clauses.",
    lastVerified: "14 Nov 2026",
  },
  {
    id: "asset-3",
    name: "CPF Ordinary, Special & MediSave Accounts",
    institution: "Central Provident Fund Board",
    category: "CPF & SRS",
    estimatedValueSgd: 485000,
    passingMechanism: "CPF Nomination",
    notes: "Cash nomination updated March 2026 (Spouse 60%, Children 20% each). Wills cannot override CPF nominations.",
    lastVerified: "02 Nov 2026",
  },
  {
    id: "asset-4",
    name: "DBS Treasures Multi-Currency & Equities",
    institution: "DBS Bank Singapore",
    category: "Investments",
    estimatedValueSgd: 640000,
    passingMechanism: "Covered by Will",
    notes: "Sole-named brokerage & SGD/USD fixed deposits. Requires Grant of Probate.",
    lastVerified: "10 Nov 2026",
  },
];

export interface IntestateScenario {
  id: string;
  label: string;
  statutoryRule: string;
  breakdown: Array<{ recipient: string; share: string; detail: string }>;
}

export const INTESTATE_SCENARIOS: IntestateScenario[] = [
  {
    id: "spouse_only",
    label: "Spouse only (no children, no parents)",
    statutoryRule: "Intestate Succession Act — Section 7, Rule 1",
    breakdown: [
      { recipient: "Surviving Spouse", share: "100%", detail: "Inherits the entire distributable estate." },
    ],
  },
  {
    id: "spouse_children",
    label: "Spouse & Children",
    statutoryRule: "Intestate Succession Act — Section 7, Rule 2",
    breakdown: [
      { recipient: "Surviving Spouse", share: "50%", detail: "Half of the estate regardless of how many children." },
      {
        recipient: "Children (equally)",
        share: "50%",
        detail: "Shared equally among surviving children (descendants of a deceased child take their parent's share).",
      },
    ],
  },
  {
    id: "spouse_parents",
    label: "Spouse & Parents (no children)",
    statutoryRule: "Intestate Succession Act — Section 7, Rule 4",
    breakdown: [
      { recipient: "Surviving Spouse", share: "50%", detail: "Half of the estate passes to the spouse." },
      {
        recipient: "Surviving Parents",
        share: "50%",
        detail: "Half divided equally between surviving parents (often unexpected for young married couples without a will).",
      },
    ],
  },
  {
    id: "children_only",
    label: "Children only (no surviving spouse)",
    statutoryRule: "Intestate Succession Act — Section 7, Rule 3",
    breakdown: [
      { recipient: "Children (equally)", share: "100%", detail: "Divided equally among all legally recognized children." },
    ],
  },
  {
    id: "parents_only",
    label: "Parents only (unmarried, no children)",
    statutoryRule: "Intestate Succession Act — Section 7, Rule 5",
    breakdown: [
      { recipient: "Surviving Parents", share: "100%", detail: "Divided equally between both parents, or 100% to the sole surviving parent." },
    ],
  },
  {
    id: "siblings_only",
    label: "Siblings only (no spouse, children, or parents)",
    statutoryRule: "Intestate Succession Act — Section 7, Rule 6",
    breakdown: [
      { recipient: "Brothers & Sisters", share: "100%", detail: "Shared equally among siblings; children of deceased siblings inherit per stirpes." },
    ],
  },
];

export const COUNSEL_SUGGESTED_TOPICS = [
  {
    title: "CPF Savings & Wills",
    prompt: "Do my CPF savings pass through my Singapore Will, or do I need a separate CPF Nomination? What happens if I get married?",
  },
  {
    title: "Joint Tenancy vs Tenancy-in-Common",
    prompt: "My spouse and I hold our HDB flat as Joint Tenants. Can I leave my half to my parents in my Will, or does right of survivorship override it?",
  },
  {
    title: "Valid Execution Under Section 6",
    prompt: "What are the exact witnessing requirements under Section 6 and Section 10 of the Singapore Wills Act so my Will isn't invalidated?",
  },
  {
    title: "Minor Children & Testamentary Trust",
    prompt: "How should I structure guardianship and a delayed vesting age (age 25) for my minor children in a Singapore Will?",
  },
  {
    title: "Will vs Lasting Power of Attorney",
    prompt: "What is the practical difference between a Will and a Lasting Power of Attorney (LPA) in Singapore, and why do advisors recommend both?",
  },
];
