export type AppView = "overview" | "builder" | "counsel" | "vault" | "membership";

export type MembershipTierId = "essential" | "family_guard" | "private_wealth";
export type BillingCycle = "monthly" | "annual";

export interface PlanDefinition {
  id: MembershipTierId;
  name: string;
  audience: string;
  monthlyPriceSgd: number;
  annualPriceSgd: number;
  highlight?: boolean;
  limits: {
    counselQueriesPerMonth: number | "unlimited";
    maxVaultAssets: number | "unlimited";
    maxWillRevisions: number | "unlimited";
    familyVaultMembers: number;
    includesRiskAudit: boolean;
    includesMirrorWill: boolean;
    includesTestamentaryTrust: boolean;
    includesBusinessSuccession: boolean;
    includesCleanExport: boolean;
    solicitorReviewCredits: number;
  };
  features: string[];
}

export interface InvoiceRecord {
  id: string;
  date: string;
  description: string;
  billingCycle: BillingCycle | "one-time";
  amountSgd: number;
  status: "Paid" | "Scheduled";
  paymentMethod: string;
}

export interface SubscriptionState {
  tierId: MembershipTierId;
  billingCycle: BillingCycle;
  renewalDate: string;
  counselQueriesUsed: number;
  willGenerationsUsed: number;
  paymentMethodLabel: string;
  solicitorCreditsRemaining: number;
  promoCodeApplied?: string;
}

export interface Beneficiary {
  id: string;
  fullName: string;
  relationship: string;
  idLast4: string;
  percentage: number;
  substituteInstruction: string;
}

export interface SpecificGift {
  id: string;
  itemDescription: string;
  recipientName: string;
  recipientRelationship: string;
}

export interface PropertyHolding {
  id: string;
  address: string;
  holdingType: "sole" | "joint_tenancy" | "tenancy_in_common";
  ownershipShare: string;
  intendedRecipient: string;
}

export interface WillProfile {
  fullName: string;
  nricMasked: string;
  address: string;
  domicile: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  isMuslimEstate: boolean;
  includeMirrorWill: boolean;
  spouseName: string;
  primaryExecutorName: string;
  primaryExecutorRelationship: string;
  substituteExecutorName: string;
  substituteExecutorRelationship: string;
  hasMinorChildren: boolean;
  minorChildrenNames: string;
  primaryGuardianName: string;
  substituteGuardianName: string;
  minorVestingAge: 21 | 25 | 30;
  enableTestamentaryTrust: boolean;
  trustDistributionsNote: string;
  properties: PropertyHolding[];
  specificGifts: SpecificGift[];
  beneficiaries: Beneficiary[];
  survivorshipDays: 30 | 60;
  funeralWishes: "Cremation" | "Burial" | "Family Discretion";
  funeralNote: string;
  digitalAssetsNote: string;
  businessSuccessionNote: string;
  overseasAssetsNote: string;
}

export interface GeneratedWillClause {
  clauseNumber: string;
  title: string;
  plainEnglish: string;
}

export interface ComplianceNotice {
  severity: "Action Required" | "Important" | "Advisory" | string;
  title: string;
  guidance: string;
}

export interface GeneratedWillResult {
  documentTitle: string;
  formalWillText: string;
  summaryClauses: GeneratedWillClause[];
  complianceNotices: ComplianceNotice[];
  generatedAt: string;
  version: number;
}

export interface AuditFinding {
  id: string;
  severity: "High" | "Medium" | "Advisory" | string;
  clauseRef: string;
  issue: string;
  recommendation: string;
  suggestedClause: string;
  applied?: boolean;
}

export interface AuditResult {
  overallAssessment: string;
  findings: AuditFinding[];
  auditedAt: string;
}

export type AssetCategory =
  | "Property"
  | "Cash & Bank"
  | "CPF & SRS"
  | "Investments"
  | "Insurance"
  | "Digital Assets";

export type PassingMechanism =
  | "Covered by Will"
  | "CPF Nomination"
  | "Right of Survivorship"
  | "Insurance Nomination";

export interface VaultAsset {
  id: string;
  name: string;
  institution: string;
  category: AssetCategory;
  estimatedValueSgd: number;
  passingMechanism: PassingMechanism;
  notes: string;
  lastVerified: string;
}

export interface CounselMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
