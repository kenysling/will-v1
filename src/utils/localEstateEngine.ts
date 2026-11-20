import {
  AuditFinding,
  ComplianceNotice,
  GeneratedWillClause,
  MembershipTierId,
  WillProfile,
} from "../types/estate";

export function generateLocalSingaporeWill(
  profile: WillProfile,
  tier: MembershipTierId
): {
  documentTitle: string;
  formalWillText: string;
  summaryClauses: GeneratedWillClause[];
  complianceNotices: ComplianceNotice[];
} {
  const fullName = profile.fullName.trim() || "TESTATOR";
  const upperName = fullName.toUpperCase();
  const nric = profile.nricMasked.trim() || "[NRIC / Passport Number]";
  const address = profile.address.trim() || "[Singapore Residential Address]";
  const domicile = profile.domicile.trim() || "Republic of Singapore";

  const clauses: string[] = [];
  const summaryClauses: GeneratedWillClause[] = [];
  const complianceNotices: ComplianceNotice[] = [];
  let clauseNum = 1;

  // Header
  const header = [
    `LAST WILL AND TESTAMENT OF ${upperName}`,
    "",
    `THIS LAST WILL AND TESTAMENT is made by me, ${fullName} (NRIC/FIN: ${nric}), of ${address}, being of sound mind, memory, and understanding, and domiciled in the ${domicile}.`,
  ].join("\n");

  // Clause 1: Revocation
  const overseasExclusion =
    tier === "private_wealth" && profile.overseasAssetsNote.trim()
      ? ` Save and except for any separate testamentary instrument expressly stated to govern assets outside Singapore (${profile.overseasAssetsNote.trim()}), I hereby revoke all former wills, codicils, and testamentary dispositions made by me.`
      : " I hereby REVOKE all former wills, codicils, and testamentary dispositions heretofore made by me and declare this to be my Last Will and Testament.";

  clauses.push(`${clauseNum}. REVOCATION\n${overseasExclusion.trim()}`);
  summaryClauses.push({
    clauseNumber: String(clauseNum),
    title: "Revocation of Prior Wills",
    plainEnglish:
      tier === "private_wealth" && profile.overseasAssetsNote.trim()
        ? "Cancels all prior Singapore wills while preserving your declared separate overseas will."
        : "Cancels all previous wills and codicils so this document stands as your sole valid will.",
  });
  clauseNum++;

  // Clause 2: Executors & Trustees
  const primaryExec = `${profile.primaryExecutorName.trim()}${
    profile.primaryExecutorRelationship.trim()
      ? ` (${profile.primaryExecutorRelationship.trim()})`
      : ""
  }`;
  const subExecText = profile.substituteExecutorName.trim()
    ? ` If my said Executor predeceases me, or is unwilling or unable to act or continue acting, I appoint ${profile.substituteExecutorName.trim()}${
        profile.substituteExecutorRelationship.trim()
          ? ` (${profile.substituteExecutorRelationship.trim()})`
          : ""
      } to be the substitute Executor and Trustee of this my Will.`
    : "";

  clauses.push(
    `${clauseNum}. APPOINTMENT OF EXECUTORS AND TRUSTEES\nI appoint ${primaryExec} to be the sole Executor and Trustee of this my Will.${subExecText} In this Will, the expression "my Trustees" shall mean the Executor(s) and Trustee(s) for the time being acting hereunder.`
  );
  summaryClauses.push({
    clauseNumber: String(clauseNum),
    title: "Appointment of Executors & Trustees",
    plainEnglish: `Names ${profile.primaryExecutorName.trim()} to apply for Grant of Probate and administer your estate${
      profile.substituteExecutorName.trim()
        ? `, with ${profile.substituteExecutorName.trim()} as backup`
        : ""
    }.`,
  });
  clauseNum++;

  // Clause 3: Guardianship (if minor children)
  if (profile.hasMinorChildren) {
    const guardianLine = profile.primaryGuardianName.trim()
      ? `I appoint ${profile.primaryGuardianName.trim()}`
      : "I appoint my Executor";
    const subGuardianLine = profile.substituteGuardianName.trim()
      ? `, and failing them, ${profile.substituteGuardianName.trim()},`
      : "";
    const childrenRef = profile.minorChildrenNames.trim()
      ? ` (${profile.minorChildrenNames.trim()})`
      : "";

    clauses.push(
      `${clauseNum}. GUARDIANSHIP OF MINOR CHILDREN\nIf my spouse predeceases me or does not survive me, ${guardianLine}${subGuardianLine} to be the testamentary guardian(s) of my minor children${childrenRef} during their respective minorities under Singapore law.`
    );
    summaryClauses.push({
      clauseNumber: String(clauseNum),
      title: "Testamentary Guardianship",
      plainEnglish: `Designates ${
        profile.primaryGuardianName.trim() || "your appointed guardian"
      } to care for your minor children if neither parent survives.`,
    });
    clauseNum++;
  }

  // Clause: Debts & Expenses
  clauses.push(
    `${clauseNum}. PAYMENT OF DEBTS AND EXPENSES\nI direct my Trustees to pay all my just debts, funeral, and testamentary expenses as soon as conveniently possible after my death out of my general estate.`
  );
  clauseNum++;

  // Clause: Real Property Notes (if any)
  if (profile.properties.length > 0) {
    const propLines = profile.properties.map((p, idx) => {
      const addr = p.address.trim() || `Property ${idx + 1}`;
      if (p.holdingType === "joint_tenancy") {
        return `(${String.fromCharCode(97 + idx)}) My interest in ${addr} held under Joint Tenancy (${p.ownershipShare || "Joint Tenants"}) passes by right of survivorship outside this Will unless severed prior to my death; should I become the sole surviving owner, such property shall pass to ${p.intendedRecipient || "my Residuary Estate"}.`;
      }
      return `(${String.fromCharCode(97 + idx)}) My ${p.ownershipShare || "beneficial"} interest in ${addr} (${p.holdingType === "tenancy_in_common" ? "Tenancy-in-Common" : "Sole Ownership"}) shall pass to ${p.intendedRecipient || "my Residuary Estate"}.`;
    });
    clauses.push(`${clauseNum}. REAL PROPERTY DECLARATIONS\n${propLines.join("\n")}`);
    summaryClauses.push({
      clauseNumber: String(clauseNum),
      title: "Real Property & Holding Type",
      plainEnglish:
        "Clarifies how your Singapore properties pass based on Joint Tenancy survivorship vs. Tenancy-in-Common / Sole Ownership.",
    });
    clauseNum++;
  }

  // Clause: Specific Bequests (if any)
  const validGifts = profile.specificGifts.filter((g) => g.itemDescription.trim() && g.recipientName.trim());
  if (validGifts.length > 0) {
    const giftLines = validGifts.map(
      (g, idx) =>
        `(${String.fromCharCode(97 + idx)}) I give free of tax ${g.itemDescription.trim()} to ${g.recipientName.trim()}${
          g.recipientRelationship.trim() ? ` (${g.recipientRelationship.trim()})` : ""
        }, provided they survive me by ${profile.survivorshipDays} days.`
    );
    clauses.push(`${clauseNum}. SPECIFIC BEQUESTS AND LEGACIES\n${giftLines.join("\n")}`);
    summaryClauses.push({
      clauseNumber: String(clauseNum),
      title: "Specific Gifts & Cash Legacies",
      plainEnglish: `Distributes ${validGifts.length} designated personal heirloom(s) or cash legacy(ies) before the residuary estate.`,
    });
    clauseNum++;
  }

  // Clause: Residuary Estate
  const benLines = profile.beneficiaries.map((b, idx) => {
    const name = b.fullName.trim() || `Beneficiary ${idx + 1}`;
    const rel = b.relationship.trim() ? ` (${b.relationship.trim()})` : "";
    const idNote = b.idLast4.trim() ? ` [ID ending ${b.idLast4.trim()}]` : "";
    const subNote = b.substituteInstruction.trim()
      ? ` If ${name} fails to survive me by ${profile.survivorshipDays} days, their share shall pass as follows: ${b.substituteInstruction.trim()}.`
      : "";
    return `(${String.fromCharCode(97 + idx)}) ${b.percentage}% to ${name}${rel}${idNote}.${subNote}`;
  });

  clauses.push(
    `${clauseNum}. RESIDUARY ESTATE\nSubject to the payment of my debts, funeral and testamentary expenses, and the specific gifts herein, I give, devise, and bequeath all the rest and residue of my movable and immovable estate whatsoever and wheresoever situate (not otherwise disposed of by nomination or right of survivorship) to my Trustees UPON TRUST for the following residuary beneficiaries who survive me by at least ${profile.survivorshipDays} days:\n${benLines.join("\n")}`
  );
  summaryClauses.push({
    clauseNumber: String(clauseNum),
    title: "Residuary Estate Distribution",
    plainEnglish: `Allocates 100% of your remaining estate across ${profile.beneficiaries.length} named beneficiary(ies) with a ${profile.survivorshipDays}-day survivorship rule.`,
  });
  clauseNum++;

  // Clause: Testamentary Trust / Minor Vesting
  if (profile.enableTestamentaryTrust || profile.hasMinorChildren) {
    const vestingAge = profile.enableTestamentaryTrust ? profile.minorVestingAge : 21;
    const trustDetail =
      profile.enableTestamentaryTrust && profile.trustDistributionsNote.trim()
        ? ` ${profile.trustDistributionsNote.trim()}`
        : " Pending absolute vesting, my Trustees may apply income and capital at their discretion for the maintenance, education, healthcare, and advancement of such beneficiary.";
    clauses.push(
      `${clauseNum}. DELAYED VESTING AND TESTAMENTARY TRUST\nWhere any beneficiary under this Will has not attained the age of ${vestingAge} years at the date of my death, my Trustees shall hold such beneficiary's share upon trust until they attain the age of ${vestingAge} years.${trustDetail}`
    );
    summaryClauses.push({
      clauseNumber: String(clauseNum),
      title: `Delayed Vesting (Age ${vestingAge})`,
      plainEnglish: `Holds inheritances for younger beneficiaries in trust until age ${vestingAge}, allowing trustees to fund education and care.`,
    });
    clauseNum++;
  }

  // Clause: Mirror Will Note (if enabled)
  if (profile.includeMirrorWill && (tier === "family_guard" || tier === "private_wealth")) {
    const spouseLabel = profile.spouseName.trim() || "my spouse";
    clauses.push(
      `${clauseNum}. RECIPROCAL MIRROR WILL COORDINATION\nThis Will has been prepared alongside a corresponding Will executed by ${spouseLabel}. For the avoidance of doubt, this Will does not create a binding mutual-will contract restricting either spouse from revoking or amending their own Will during their lifetime.`
    );
    clauseNum++;
  }

  // Clause: Business Succession (Private Wealth)
  if (tier === "private_wealth" && profile.businessSuccessionNote.trim()) {
    clauses.push(
      `${clauseNum}. BUSINESS INTERESTS AND SUCCESSION\n${profile.businessSuccessionNote.trim()} My Trustees are empowered to carry on, restructure, or realize my business interests in accordance with applicable shareholder agreements and the Companies Act 1967.`
    );
    clauseNum++;
  }

  // Clause: Funeral & Digital Wishes
  const wishesParts = [`My non-binding wish regarding my remains is ${profile.funeralWishes}.`];
  if (profile.funeralNote.trim()) wishesParts.push(profile.funeralNote.trim());
  if (profile.digitalAssetsNote.trim()) {
    wishesParts.push(`Digital Assets & Fiduciary Access: ${profile.digitalAssetsNote.trim()}`);
  }
  clauses.push(`${clauseNum}. FUNERAL AND DIGITAL ASSET WISHES\n${wishesParts.join(" ")}`);
  summaryClauses.push({
    clauseNumber: String(clauseNum),
    title: "Funeral & Digital Access Guidance",
    plainEnglish: `Records your ${profile.funeralWishes.toLowerCase()} preference and practical digital asset access instructions for your executor.`,
  });

  // Attestation Block (Section 6 Singapore Wills Act)
  const attestation = [
    "IN WITNESS WHEREOF I have hereunto set my hand this _____ day of _____________, 20____.",
    "",
    "SIGNED by the abovenamed Testator,",
    `${upperName}, as and for their Last Will and Testament,`,
    "in the presence of us both present at the same time,",
    "who at their request, in their presence, and in the",
    "presence of each other have hereunto subscribed our",
    "names as witnesses:",
    "",
    "________________________________________",
    `Signature of Testator (${fullName})`,
    "",
    "WITNESS 1 (Aged 21+, NOT a beneficiary or spouse of a beneficiary):",
    "Signature: ______________________________",
    "Full Name: ______________________________",
    "NRIC / Passport: ________________________",
    "Address: ________________________________",
    "",
    "WITNESS 2 (Aged 21+, NOT a beneficiary or spouse of a beneficiary):",
    "Signature: ______________________________",
    "Full Name: ______________________________",
    "NRIC / Passport: ________________________",
    "Address: ________________________________",
  ].join("\n");

  const formalWillText = [header, ...clauses, attestation].join("\n\n");

  // Compliance Notices
  complianceNotices.push({
    severity: "Action Required",
    title: "Section 6 & Section 10 Execution Rules (Wills Act Cap. 352)",
    guidance:
      "Print this Will and sign it in wet ink in the simultaneous presence of two independent adult witnesses (aged 21+). Neither witness nor their spouse may be a beneficiary under this Will, or that beneficiary's gift will be void under Section 10.",
  });

  complianceNotices.push({
    severity: "Important",
    title: "CPF Savings Require a Separate CPF Nomination",
    guidance:
      "Under Singapore law, CPF Ordinary, Special, MediSave, and Retirement Account balances do not pass through a Will. Ensure your CPF Nomination is current via the CPF Board portal, and remember that marriage revokes any prior CPF nomination (and prior Will under Section 13 Wills Act).",
  });

  if (profile.properties.some((p) => p.holdingType === "joint_tenancy")) {
    complianceNotices.push({
      severity: "Important",
      title: "Joint Tenancy Property Passes Outside the Will",
      guidance:
        "Any HDB flat or private property held as Joint Tenants passes automatically to the surviving co-owner by right of survivorship regardless of what your Will states, unless you formally sever the joint tenancy into Tenancy-in-Common at SLA.",
    });
  }

  if (profile.isMuslimEstate) {
    complianceNotices.push({
      severity: "Action Required",
      title: "AMLA & Faraid One-Third (1/3) Wasiat Limit",
      guidance:
        "Under the Administration of Muslim Law Act (AMLA), a Muslim testator may generally bequeath up to one-third (1/3) of their net estate by Wasiat to non-Faraid heirs; the remaining estate distributes strictly under Faraid rules unless all Faraid heirs consent after death.",
    });
  }

  if (!profile.substituteExecutorName.trim()) {
    complianceNotices.push({
      severity: "Advisory",
      title: "Consider Naming a Substitute Executor",
      guidance:
        "If your sole named executor is unable or unwilling to act when probate is needed, appointing a substitute executor avoids delays and court administration applications.",
    });
  }

  return {
    documentTitle: `LAST WILL AND TESTAMENT OF ${upperName}`,
    formalWillText,
    summaryClauses,
    complianceNotices,
  };
}

export function reviewLocalSingaporeWill(
  _willText: string,
  profile: WillProfile
): {
  overallAssessment: string;
  findings: AuditFinding[];
} {
  const findings: AuditFinding[] = [];

  if (!profile.substituteExecutorName.trim()) {
    findings.push({
      id: "audit-exec-sub",
      severity: "High",
      clauseRef: "Clause 2 — Executors",
      issue: "No substitute executor is appointed if your primary executor cannot act.",
      recommendation:
        "Name a trusted Singapore-resident adult (aged 21+) as substitute executor to prevent Letters of Administration with Will Annexed delays.",
      suggestedClause:
        "If my primary Executor predeceases me, or is unwilling or unable to act, I appoint [SUBSTITUTE EXECUTOR NAME] as my substitute Executor and Trustee.",
    });
  }

  if (profile.properties.some((p) => p.holdingType === "joint_tenancy")) {
    findings.push({
      id: "audit-jt-prop",
      severity: "Medium",
      clauseRef: "Real Property Declarations",
      issue: "Joint Tenancy property will bypass residuary percentages while a co-owner survives.",
      recommendation:
        "Confirm whether your intention is 100% survivorship to the co-owner. If you wish your share to follow your Will (e.g., to parents or children), execute an Instrument of Declaration to sever into Tenancy-in-Common.",
      suggestedClause:
        "I confirm that my Joint Tenancy property is intended to pass by survivorship to my surviving co-owner; only in the event we die simultaneously or I am the sole surviving owner shall it fall into my Residuary Estate.",
    });
  }

  if (profile.hasMinorChildren && !profile.enableTestamentaryTrust) {
    findings.push({
      id: "audit-minor-trust",
      severity: "Medium",
      clauseRef: "Minor Children & Vesting",
      issue: "Minor children inheritances vest outright at age 21 without delayed vesting controls.",
      recommendation:
        "Consider a Testamentary Trust extending vesting to age 25 or 30 so trustees can manage education and living expenses responsibly.",
      suggestedClause:
        "My Trustees shall hold the share of any beneficiary under the age of twenty-five (25) years upon trust, with full discretion to apply income and capital for their education, healthcare, and maintenance until they attain age 25.",
    });
  }

  findings.push({
    id: "audit-witness-s10",
    severity: "Advisory",
    clauseRef: "Execution & Section 10 Wills Act",
    issue: "Beneficiaries and their spouses cannot act as witnesses during signing.",
    recommendation:
      "Arrange two independent adult witnesses (e.g., colleagues or neighbours aged 21+) who are neither beneficiaries nor married to any beneficiary, and sign together in one sitting.",
    suggestedClause:
      "Memorandum of Execution Check: Confirmed both witnesses are aged 21 or above, mentally competent, and neither a beneficiary nor the spouse of any beneficiary under this Will.",
  });

  const highCount = findings.filter((f) => f.severity === "High").length;
  const overallAssessment =
    highCount > 0
      ? `Draft contains ${highCount} high-priority structural gap(s) and ${findings.length - highCount} advisory check(s). Address the substitute executor and witnessing reminders before wet-ink execution.`
      : `Draft structure is aligned with Singapore Wills Act (Cap. 352) conventions, with ${findings.length} practical advisory check(s) covering property survivorship, CPF alignment, and Section 10 witnessing.`;

  return { overallAssessment, findings };
}

export function answerLocalEstateCounsel(
  question: string,
  profile: WillProfile | null,
  _tier: MembershipTierId
): string {
  const q = question.toLowerCase();
  const profilePrefix = profile?.fullName?.trim()
    ? `**Context from your Will Builder profile (${profile.fullName.trim()}, ${profile.maritalStatus}):**\n\n`
    : "";

  if (q.includes("cpf")) {
    return (
      profilePrefix +
      `### CPF Savings & Your Singapore Will\n\n` +
      `- **Separate Scheme:** CPF savings (Ordinary, Special, MediSave, and Retirement Accounts) **do not** form part of your estate under a Will.\n` +
      `- **CPF Nomination:** You must submit a **CPF Nomination** directly with the CPF Board (online via Singpass or at a CPF Service Centre) to specify who receives your CPF balances in cash.\n` +
      `- **Marriage Revocation:** Under Singapore law, getting married automatically revokes an earlier CPF Nomination (and generally revokes an earlier Will under Section 13 of the Wills Act unless made in contemplation of that marriage).\n` +
      `- **Without a Nomination:** If you pass away without a CPF Nomination, the Public Trustee distributes your CPF savings under the Intestate Succession Act (or Muslim Inheritance Certificate for Muslims) and deducts statutory administration fees.`
    );
  }

  if (q.includes("joint tenancy") || q.includes("tenancy-in-common") || q.includes("hdb")) {
    return (
      profilePrefix +
      `### Joint Tenancy vs. Tenancy-in-Common in Singapore\n\n` +
      `- **Joint Tenancy (Right of Survivorship):** Each co-owner holds 100% jointly. When one owner passes away, their share automatically transfers to the surviving co-owner **outside any Will**. You cannot leave a Joint Tenancy share to someone else (such as parents or children) in your Will.\n` +
      `- **Tenancy-in-Common:** Each owner holds a distinct percentage share (e.g., 50%/50% or 70%/30%). That share passes strictly according to your Will (or intestacy laws if there is no Will).\n` +
      `- **How to Change:** If you want your share of an HDB flat or private condo to pass via your Will, both or either co-owner can lodge an **Instrument of Declaration** to sever the Joint Tenancy into Tenancy-in-Common (subject to HDB eligibility and conveyancing procedures).`
    );
  }

  if (q.includes("section 6") || q.includes("section 10") || q.includes("witness")) {
    return (
      profilePrefix +
      `### Valid Will Execution Under the Singapore Wills Act\n\n` +
      `- **In Writing & Age 21+ (Sections 3 & 4):** The testator must be at least 21 years old, of sound mind, and the Will must be in writing.\n` +
      `- **Signed in Simultaneous Presence (Section 6):** You must sign at the foot or end of the Will in the presence of **two or more witnesses present at the same time**, and both witnesses must subscribe their names in your presence.\n` +
      `- **Witness Disqualification (Section 10):** A witness (or the **spouse** of a witness) **cannot be a beneficiary** under the Will. The Will remains valid, but any gift to that witness or their spouse becomes **void**.\n` +
      `- **Tip:** Use two independent adult colleagues or neighbours aged 21+, and keep the original signed wet-ink paper Will in a secure place (and optionally register its location with the Singapore Wills Registry).`
    );
  }

  if (q.includes("minor") || q.includes("guardian") || q.includes("trust") || q.includes("vesting")) {
    return (
      profilePrefix +
      `### Minor Children, Guardianship & Testamentary Trusts\n\n` +
      `- **Testamentary Guardian:** Under the Guardianship of Infants Act, you can appoint a primary and substitute guardian in your Will to care for unmarried children under age 21 if both parents pass away.\n` +
      `- **Why Delay Vesting Past Age 21:** By default, a child inherits outright at age 21. Many parents include a **Testamentary Trust** delaying full capital vesting to **age 25 or 30**, while allowing trustees to release funds earlier for university tuition, medical needs, and living expenses.\n` +
      `- **Trustee Choice:** You may appoint the same trusted person as Executor and Trustee, or separate caregiving (Guardian) from financial stewardship (Trustee) for built-in checks and balances.`
    );
  }

  if (q.includes("lpa") || q.includes("lasting power")) {
    return (
      profilePrefix +
      `### Will vs. Lasting Power of Attorney (LPA) in Singapore\n\n` +
      `- **When They Take Effect:** A **Will** only takes effect **after death**. An **LPA** (under the Mental Capacity Act) operates **while you are alive** if you lose mental capacity due to illness or accident.\n` +
      `- **Why Both Matter:** Without an LPA, family members cannot legally access your sole-named bank accounts or manage your property if you lose mental capacity—they would have to apply to the Family Justice Courts for a Deputyship order, which is slower and costlier.\n` +
      `- **How to Make an LPA:** Draft your LPA online via the **Office of the Public Guardian (OPG) OPGO portal**, then have it certified by an accredited medical practitioner, Singapore lawyer, or registered psychiatrist.`
    );
  }

  return (
    profilePrefix +
    `### Singapore Estate Planning Guidance\n\n` +
    `Regarding your question (*"${question.trim()}"*):\n\n` +
    `- **Assets Covered by a Will:** Sole-named bank accounts, Singapore equities/investments, Tenancy-in-Common property shares, and personal chattels pass via your Will upon Grant of Probate.\n` +
    `- **Assets Passing Outside a Will:** **CPF savings** (governed by CPF Nomination), **Joint Tenancy property** (passes by right of survivorship), and **Section 73 CLPA / irrevocable trust insurance policies** pass outside your Will.\n` +
    `- **Execution Formalities:** Ensure your Will is printed, signed in wet ink, and witnessed simultaneously by **two independent adults aged 21+** who are neither beneficiaries nor spouses of beneficiaries (Sections 6 & 10, Wills Act Cap. 352).\n\n` +
    `*For cross-border real estate, complex business succession, or bespoke trusts, consider having your final draft reviewed by a Singapore Advocate & Solicitor.*`
  );
}
