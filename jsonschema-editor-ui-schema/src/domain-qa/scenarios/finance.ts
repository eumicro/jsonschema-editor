import type { DomainScenarioDefinition } from "../types.js";
import { categorization, objectSchema, propertyControls, refDef } from "./helpers.js";

export const financeScenarios: DomainScenarioDefinition[] = [
  {
    id: "sepa-credit-transfer",
    domain: "finance",
    label: "SEPA-Überweisung (ISO 20022 pain.001)",
    description: "Zahlungsauftrag mit Auftraggeber, Empfänger und pain.001-inspirierten Feldern.",
    sources: [
      "https://www.iso20022.org/sites/default/files/documents/D7/ISO20022_API_JSON_Whitepaper_Final_20180129.pdf",
      "https://iso20022.plus/api/json/",
    ],
    schema: objectSchema(
      "SEPA-Überweisung",
      {
        messageId: { type: "string" },
        creationDateTime: { type: "string", format: "date-time" },
        debtor: refDef("PaymentParty"),
        creditor: refDef("PaymentParty"),
        payment: refDef("PaymentInstruction"),
      },
      ["messageId", "creationDateTime", "debtor", "creditor", "payment"],
      {
        PaymentParty: {
          type: "object",
          required: ["name", "iban"],
          properties: {
            name: { type: "string" },
            iban: { type: "string", pattern: "^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$" },
            bic: { type: "string" },
          },
        },
        PaymentInstruction: {
          type: "object",
          required: ["amount", "currency", "remittanceInfo"],
          properties: {
            amount: { type: "number", minimum: 0.01 },
            currency: { type: "string", const: "EUR" },
            remittanceInfo: { type: "string", maxLength: 140 },
            executionDate: { type: "string", format: "date" },
            endToEndId: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["messageId", "creationDateTime", "debtor", "creditor", "payment"]),
    valid: {
      messageId: "MSG-2026-001",
      creationDateTime: "2026-06-12T10:00:00Z",
      debtor: { name: "Max Mustermann", iban: "DE89370400440532013000" },
      creditor: { name: "Miet GmbH", iban: "DE12500105170648489890" },
      payment: { amount: 850, currency: "EUR", remittanceInfo: "Miete Juni 2026", executionDate: "2026-06-15" },
    },
    invalid: { messageId: "M", creationDateTime: "x", debtor: { name: "X", iban: "INVALID" }, creditor: {}, payment: { amount: 0, currency: "USD" } },
  },
  {
    id: "kyc-identity-check",
    domain: "finance",
    label: "KYC-Identitätsprüfung",
    description: "Know-Your-Customer mit Identitätsnachweis, PEP/Sanktions-Screening.",
    sources: ["https://www.mastercard.com/us/en/news-and-trends/Insights/2024/iso-20022-and-json-balancing-standardisation-and-flexibility-in-.html"],
    schema: objectSchema(
      "KYC-Prüfung",
      {
        caseId: { type: "string" },
        customer: refDef("KycCustomer"),
        identityDocument: refDef("IdentityDocument"),
        screening: refDef("ComplianceScreening"),
        riskRating: refDef("RiskRating"),
      },
      ["caseId", "customer", "identityDocument", "screening", "riskRating"],
      {
        KycCustomer: {
          type: "object",
          required: ["firstName", "lastName", "birthDate", "nationality"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date" },
            nationality: { type: "string", minLength: 2, maxLength: 2 },
            taxResidency: { type: "string", minLength: 2, maxLength: 2 },
          },
        },
        IdentityDocument: {
          oneOf: [refDef("PassportDoc"), refDef("IdCardDoc")],
        },
        PassportDoc: {
          type: "object",
          required: ["docType", "number", "expiryDate"],
          properties: {
            docType: { const: "passport" },
            number: { type: "string" },
            expiryDate: { type: "string", format: "date" },
            issuingCountry: { type: "string", minLength: 2, maxLength: 2 },
          },
        },
        IdCardDoc: {
          type: "object",
          required: ["docType", "number", "expiryDate"],
          properties: {
            docType: { const: "id_card" },
            number: { type: "string" },
            expiryDate: { type: "string", format: "date" },
          },
        },
        ComplianceScreening: {
          type: "object",
          required: ["pepCheck", "sanctionsCheck", "checkedAt"],
          properties: {
            pepCheck: { type: "string", enum: ["clear", "match", "review"] },
            sanctionsCheck: { type: "string", enum: ["clear", "match", "review"] },
            checkedAt: { type: "string", format: "date-time" },
          },
        },
        RiskRating: {
          type: "object",
          required: ["score", "level"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            level: { type: "string", enum: ["low", "medium", "high"] },
          },
        },
      },
    ),
    uiSchema: categorization([
      { label: "Kunde", scope: "#/properties/customer" },
      { label: "Ausweis", scope: "#/properties/identityDocument" },
      { label: "Screening", scope: "#/properties/screening" },
      { label: "Risiko", scope: "#/properties/riskRating" },
    ]),
    valid: {
      caseId: "KYC-2026-001",
      customer: { firstName: "Anna", lastName: "Schmidt", birthDate: "1990-03-15", nationality: "DE" },
      identityDocument: { docType: "passport", number: "C01X00T47", expiryDate: "2030-05-01", issuingCountry: "DE" },
      screening: { pepCheck: "clear", sanctionsCheck: "clear", checkedAt: "2026-06-12T09:00:00Z" },
      riskRating: { score: 15, level: "low" },
    },
    invalid: { caseId: "K", customer: {}, identityDocument: { docType: "passport" }, screening: {}, riskRating: { score: 200 } },
  },
  {
    id: "loan-application",
    domain: "finance",
    label: "Kreditantrag",
    description: "Privatkredit mit Einkommen, Sicherheiten und Bonitätsdaten.",
    sources: ["https://www.tracefinancial.com/when-worlds-collide-iso-20022-meets-json-2/"],
    schema: objectSchema(
      "Kreditantrag",
      {
        applicationId: { type: "string" },
        applicant: refDef("LoanApplicant"),
        loan: refDef("LoanTerms"),
        collateral: { type: "array", items: refDef("CollateralItem") },
        creditScore: refDef("CreditScore"),
      },
      ["applicationId", "applicant", "loan", "creditScore"],
      {
        LoanApplicant: {
          type: "object",
          required: ["name", "employment"],
          properties: {
            name: { type: "string" },
            employment: refDef("EmploymentInfo"),
            existingLoans: { type: "array", items: refDef("ExistingLoan") },
          },
        },
        EmploymentInfo: {
          oneOf: [
            {
              type: "object",
              required: ["status", "monthlyNetIncomeEur", "employerName"],
              properties: {
                status: { const: "employed" },
                monthlyNetIncomeEur: { type: "number", minimum: 0 },
                employerName: { type: "string" },
                sinceDate: { type: "string", format: "date" },
              },
            },
            {
              type: "object",
              required: ["status", "monthlyNetIncomeEur"],
              properties: {
                status: { type: "string", enum: ["self-employed", "retired", "unemployed"] },
                monthlyNetIncomeEur: { type: "number", minimum: 0 },
                sinceDate: { type: "string", format: "date" },
              },
            },
          ],
        },
        ExistingLoan: {
          type: "object",
          required: ["type", "remainingBalanceEur"],
          properties: {
            type: { type: "string", enum: ["mortgage", "consumer", "student", "other"] },
            remainingBalanceEur: { type: "number", minimum: 0 },
          },
        },
        LoanTerms: {
          type: "object",
          required: ["amountEur", "durationMonths", "purpose"],
          properties: {
            amountEur: { type: "number", minimum: 1000 },
            durationMonths: { type: "integer", minimum: 12, maximum: 360 },
            purpose: { type: "string", enum: ["vehicle", "renovation", "debt_consolidation", "other"] },
            interestType: { type: "string", enum: ["fixed", "variable"] },
          },
        },
        CollateralItem: {
          type: "object",
          required: ["type", "estimatedValueEur"],
          properties: {
            type: { type: "string", enum: ["real_estate", "vehicle", "securities", "other"] },
            estimatedValueEur: { type: "number", minimum: 0 },
          },
        },
        CreditScore: {
          type: "object",
          required: ["provider", "score", "date"],
          properties: {
            provider: { type: "string" },
            score: { type: "integer", minimum: 0, maximum: 1000 },
            date: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["applicationId", "applicant", "loan", "collateral", "creditScore"]),
    valid: {
      applicationId: "LOAN-2026-001",
      applicant: { name: "Max Mustermann", employment: { status: "employed", monthlyNetIncomeEur: 3200, employerName: "Tech AG" } },
      loan: { amountEur: 15000, durationMonths: 48, purpose: "vehicle", interestType: "fixed" },
      creditScore: { provider: "Schufa", score: 92, date: "2026-06-01" },
    },
    invalid: { applicationId: "L", applicant: {}, loan: { amountEur: 100, durationMonths: 6 }, creditScore: {} },
  },
  {
    id: "insurance-policy",
    domain: "finance",
    label: "Versicherungspolice",
    description: "Police mit Deckung, Prämie und Begünstigten.",
    sources: ["https://www.iso.org/standard/20022-9"],
    schema: objectSchema(
      "Versicherungspolice",
      {
        policyNumber: { type: "string" },
        product: refDef("InsuranceProduct"),
        policyholder: refDef("Policyholder"),
        coverage: refDef("CoverageDetails"),
        premium: refDef("PremiumSchedule"),
        beneficiaries: { type: "array", items: refDef("Beneficiary") },
      },
      ["policyNumber", "product", "policyholder", "coverage", "premium"],
      {
        InsuranceProduct: {
          type: "object",
          required: ["code", "name", "line"],
          properties: {
            code: { type: "string" },
            name: { type: "string" },
            line: { type: "string", enum: ["life", "health", "property", "liability"] },
          },
        },
        Policyholder: {
          type: "object",
          required: ["name", "birthDate", "address"],
          properties: {
            name: { type: "string" },
            birthDate: { type: "string", format: "date" },
            address: { type: "string" },
          },
        },
        CoverageDetails: {
          type: "object",
          required: ["sumInsuredEur", "deductibleEur"],
          properties: {
            sumInsuredEur: { type: "number", minimum: 0 },
            deductibleEur: { type: "number", minimum: 0 },
            exclusions: { type: "array", items: { type: "string" } },
          },
        },
        PremiumSchedule: {
          type: "object",
          required: ["amountEur", "frequency"],
          properties: {
            amountEur: { type: "number", minimum: 0 },
            frequency: { type: "string", enum: ["monthly", "quarterly", "annual"] },
            nextDueDate: { type: "string", format: "date" },
          },
        },
        Beneficiary: {
          type: "object",
          required: ["name", "sharePct"],
          properties: {
            name: { type: "string" },
            sharePct: { type: "number", minimum: 0, maximum: 100 },
            relation: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["policyNumber", "product", "policyholder", "coverage", "premium", "beneficiaries"]),
    valid: {
      policyNumber: "POL-2026-001",
      product: { code: "HR-001", name: "Hausrat Komfort", line: "property" },
      policyholder: { name: "Anna Schmidt", birthDate: "1990-03-15", address: "Berlin" },
      coverage: { sumInsuredEur: 50000, deductibleEur: 150 },
      premium: { amountEur: 12.5, frequency: "monthly", nextDueDate: "2026-07-01" },
    },
    invalid: { policyNumber: "P", product: {}, policyholder: {}, coverage: {}, premium: {} },
  },
  {
    id: "investment-portfolio",
    domain: "finance",
    label: "Investment-Depot",
    description: "Wertpapierdepot mit Positionen, Asset Allocation und Performance.",
    sources: ["https://iso20022.plus/api/json/"],
    schema: objectSchema(
      "Depot",
      {
        portfolioId: { type: "string" },
        owner: refDef("PortfolioOwner"),
        positions: { type: "array", minItems: 1, items: refDef("SecurityPosition") },
        allocation: refDef("AssetAllocation"),
        performance: refDef("PortfolioPerformance"),
      },
      ["portfolioId", "owner", "positions"],
      {
        PortfolioOwner: {
          type: "object",
          required: ["clientId", "name"],
          properties: {
            clientId: { type: "string" },
            name: { type: "string" },
            riskProfile: { type: "string", enum: ["conservative", "balanced", "aggressive"] },
          },
        },
        SecurityPosition: {
          type: "object",
          required: ["isin", "quantity", "marketValueEur"],
          properties: {
            isin: { type: "string", pattern: "^[A-Z]{2}[A-Z0-9]{9}[0-9]$" },
            quantity: { type: "number", minimum: 0.0001 },
            marketValueEur: { type: "number", minimum: 0 },
            assetClass: { type: "string", enum: ["equity", "bond", "fund", "etf", "cash"] },
          },
        },
        AssetAllocation: {
          type: "object",
          required: ["equityPct", "bondPct", "cashPct"],
          properties: {
            equityPct: { type: "number", minimum: 0, maximum: 100 },
            bondPct: { type: "number", minimum: 0, maximum: 100 },
            cashPct: { type: "number", minimum: 0, maximum: 100 },
          },
        },
        PortfolioPerformance: {
          type: "object",
          properties: {
            ytdReturnPct: { type: "number" },
            totalValueEur: { type: "number", minimum: 0 },
            asOfDate: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["portfolioId", "owner", "positions", "allocation", "performance"]),
    valid: {
      portfolioId: "DEP-001",
      owner: { clientId: "CL-100", name: "Max Mustermann", riskProfile: "balanced" },
      positions: [{ isin: "DE0005140008", quantity: 100, marketValueEur: 8500, assetClass: "equity" }],
      allocation: { equityPct: 60, bondPct: 30, cashPct: 10 },
    },
    invalid: { portfolioId: "D", owner: {}, positions: [{ isin: "INVALID", quantity: 0, marketValueEur: -1 }] },
  },
  {
    id: "card-transaction",
    domain: "finance",
    label: "Kartentransaktion",
    description: "Zahlungskartentransaktion mit Händler, 3DS und Betrugssignalen.",
    sources: ["https://www.iso20022.org/sites/default/files/documents/D7/ISO20022_API_JSON_Whitepaper_Final_20180129.pdf"],
    schema: objectSchema(
      "Kartentransaktion",
      {
        transactionId: { type: "string" },
        card: refDef("CardInfo"),
        merchant: refDef("MerchantInfo"),
        amount: refDef("TransactionAmount"),
        authentication: refDef("CardAuthentication"),
        fraudSignals: refDef("FraudSignals"),
      },
      ["transactionId", "card", "merchant", "amount"],
      {
        CardInfo: {
          type: "object",
          required: ["maskedPan", "expiryMonth", "expiryYear"],
          properties: {
            maskedPan: { type: "string", pattern: "^[0-9]{6}\\*{6}[0-9]{4}$" },
            expiryMonth: { type: "integer", minimum: 1, maximum: 12 },
            expiryYear: { type: "integer", minimum: 2024 },
            cardBrand: { type: "string", enum: ["visa", "mastercard", "amex"] },
          },
        },
        MerchantInfo: {
          type: "object",
          required: ["name", "mcc", "country"],
          properties: {
            name: { type: "string" },
            mcc: { type: "string", pattern: "^[0-9]{4}$" },
            country: { type: "string", minLength: 2, maxLength: 2 },
          },
        },
        TransactionAmount: {
          type: "object",
          required: ["value", "currency"],
          properties: {
            value: { type: "number", minimum: 0.01 },
            currency: { type: "string", enum: ["EUR", "USD", "GBP"] },
            originalValue: { type: "number" },
            originalCurrency: { type: "string" },
          },
        },
        CardAuthentication: {
          oneOf: [refDef("ThreeDSAuth"), refDef("NoAuth")],
        },
        ThreeDSAuth: {
          type: "object",
          required: ["method", "eci", "status"],
          properties: {
            method: { const: "3ds" },
            eci: { type: "string" },
            status: { type: "string", enum: ["authenticated", "attempted", "failed"] },
          },
        },
        NoAuth: {
          type: "object",
          required: ["method"],
          properties: { method: { const: "none" } },
        },
        FraudSignals: {
          type: "object",
          properties: {
            velocityScore: { type: "integer", minimum: 0, maximum: 100 },
            geoMismatch: { type: "boolean" },
            deviceFingerprint: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["transactionId", "card", "merchant", "amount", "authentication", "fraudSignals"]),
    valid: {
      transactionId: "TXN-2026-001",
      card: { maskedPan: "411111******1111", expiryMonth: 12, expiryYear: 2028, cardBrand: "visa" },
      merchant: { name: "Online Shop", mcc: "5411", country: "DE" },
      amount: { value: 49.99, currency: "EUR" },
      authentication: { method: "3ds", eci: "05", status: "authenticated" },
    },
    invalid: { transactionId: "T", card: { maskedPan: "bad", expiryMonth: 13 }, merchant: {}, amount: { value: 0, currency: "EUR" } },
  },
  {
    id: "aml-sanctions-screening",
    domain: "finance",
    label: "AML/Sanktionsprüfung",
    description: "Anti-Money-Laundering Screening mit Trefferliste und Disposition.",
    sources: ["https://www.mastercard.com/us/en/news-and-trends/Insights/2024/iso-20022-and-json-balancing-standardisation-and-flexibility-in-.html"],
    schema: objectSchema(
      "AML-Screening",
      {
        screeningId: { type: "string" },
        subject: refDef("ScreeningSubject"),
        lists: { type: "array", minItems: 1, items: { type: "string", enum: ["EU_SANCTIONS", "OFAC", "UN", "PEP"] } },
        matches: { type: "array", items: refDef("SanctionMatch") },
        disposition: refDef("ScreeningDisposition"),
      },
      ["screeningId", "subject", "lists"],
      {
        ScreeningSubject: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["individual", "organization"] },
            dateOfBirth: { type: "string", format: "date" },
            country: { type: "string", minLength: 2, maxLength: 2 },
          },
        },
        SanctionMatch: {
          type: "object",
          required: ["listName", "matchedName", "score"],
          properties: {
            listName: { type: "string" },
            matchedName: { type: "string" },
            score: { type: "number", minimum: 0, maximum: 1 },
            matchReason: { type: "string" },
          },
        },
        ScreeningDisposition: {
          oneOf: [refDef("ClearDisposition"), refDef("EscalatedDisposition")],
        },
        ClearDisposition: {
          type: "object",
          required: ["status", "reviewedBy"],
          properties: {
            status: { const: "clear" },
            reviewedBy: { type: "string" },
            reviewedAt: { type: "string", format: "date-time" },
          },
        },
        EscalatedDisposition: {
          type: "object",
          required: ["status", "reason", "assignedTo"],
          properties: {
            status: { const: "escalated" },
            reason: { type: "string" },
            assignedTo: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["screeningId", "subject", "lists", "matches", "disposition"]),
    valid: {
      screeningId: "AML-2026-001",
      subject: { name: "Anna Schmidt", type: "individual", dateOfBirth: "1990-03-15", country: "DE" },
      lists: ["EU_SANCTIONS", "PEP"],
      matches: [],
      disposition: { status: "clear", reviewedBy: "compliance-01", reviewedAt: "2026-06-12T11:00:00Z" },
    },
    invalid: { screeningId: "A", subject: { name: "X" }, lists: [], disposition: { status: "clear" } },
  },
  {
    id: "mortgage-application",
    domain: "finance",
    label: "Hypothekenantrag",
    description: "Immobilienfinanzierung mit Objekt, Eigenkapital und Tilgungsplan.",
    sources: ["https://www.tracefinancial.com/when-worlds-collide-iso-20022-meets-json-2/"],
    schema: objectSchema(
      "Hypothekenantrag",
      {
        applicationId: { type: "string" },
        borrowers: { type: "array", minItems: 1, items: refDef("Borrower") },
        property: refDef("MortgageProperty"),
        financing: refDef("MortgageFinancing"),
        repayment: refDef("RepaymentPlan"),
      },
      ["applicationId", "borrowers", "property", "financing"],
      {
        Borrower: {
          type: "object",
          required: ["name", "monthlyIncomeEur"],
          properties: {
            name: { type: "string" },
            monthlyIncomeEur: { type: "number", minimum: 0 },
            employmentType: { type: "string", enum: ["permanent", "temporary", "self-employed"] },
          },
        },
        MortgageProperty: {
          type: "object",
          required: ["address", "marketValueEur", "propertyType"],
          properties: {
            address: { type: "string" },
            marketValueEur: { type: "number", minimum: 10000 },
            propertyType: { type: "string", enum: ["apartment", "house", "commercial"] },
            yearBuilt: { type: "integer", minimum: 1800, maximum: 2030 },
            livingAreaSqm: { type: "number", minimum: 10 },
          },
        },
        MortgageFinancing: {
          type: "object",
          required: ["loanAmountEur", "equityEur", "interestRatePct", "fixedRateYears"],
          properties: {
            loanAmountEur: { type: "number", minimum: 10000 },
            equityEur: { type: "number", minimum: 0 },
            interestRatePct: { type: "number", minimum: 0, maximum: 20 },
            fixedRateYears: { type: "integer", enum: [5, 10, 15, 20, 30] },
          },
        },
        RepaymentPlan: {
          type: "object",
          required: ["initialRepaymentPct", "durationYears"],
          properties: {
            initialRepaymentPct: { type: "number", minimum: 1, maximum: 10 },
            durationYears: { type: "integer", minimum: 5, maximum: 40 },
            specialRepaymentAllowed: { type: "boolean" },
          },
        },
      },
    ),
    uiSchema: categorization([
      { label: "Darlehensnehmer", scope: "#/properties/borrowers" },
      { label: "Immobilie", scope: "#/properties/property" },
      { label: "Finanzierung", scope: "#/properties/financing" },
      { label: "Tilgung", scope: "#/properties/repayment" },
    ]),
    valid: {
      applicationId: "MORT-2026-001",
      borrowers: [{ name: "Max & Erika Mustermann", monthlyIncomeEur: 6500, employmentType: "permanent" }],
      property: { address: "Berlin", marketValueEur: 450000, propertyType: "apartment", yearBuilt: 2015, livingAreaSqm: 85 },
      financing: { loanAmountEur: 360000, equityEur: 90000, interestRatePct: 3.2, fixedRateYears: 15 },
      repayment: { initialRepaymentPct: 2, durationYears: 30 },
    },
    invalid: { applicationId: "M", borrowers: [], property: { address: "X", marketValueEur: 1000 }, financing: {} },
  },
  {
    id: "invoice-billing",
    domain: "finance",
    label: "Rechnungsstellung B2B",
    description: "B2B-Rechnung mit Zahlungsbedingungen, Skonto und Mahnstufen.",
    sources: ["https://www.iso20022.org/sites/default/files/documents/D7/ISO20022_API_JSON_Whitepaper_Final_20180129.pdf"],
    schema: objectSchema(
      "B2B-Rechnung",
      {
        invoiceId: { type: "string" },
        issueDate: { type: "string", format: "date" },
        dueDate: { type: "string", format: "date" },
        customer: refDef("BillingCustomer"),
        lines: { type: "array", minItems: 1, items: refDef("BillingLine") },
        paymentTerms: refDef("PaymentTerms"),
        dunning: refDef("DunningStatus"),
      },
      ["invoiceId", "issueDate", "dueDate", "customer", "lines", "paymentTerms"],
      {
        BillingCustomer: {
          type: "object",
          required: ["name", "customerNumber"],
          properties: {
            name: { type: "string" },
            customerNumber: { type: "string" },
            vatId: { type: "string" },
          },
        },
        BillingLine: {
          type: "object",
          required: ["description", "quantity", "unitPriceEur", "taxRatePct"],
          properties: {
            description: { type: "string" },
            quantity: { type: "number", minimum: 0.01 },
            unitPriceEur: { type: "number" },
            taxRatePct: { type: "number", enum: [0, 7, 19] },
          },
        },
        PaymentTerms: {
          type: "object",
          required: ["netDays"],
          properties: {
            netDays: { type: "integer", minimum: 0 },
            discountPct: { type: "number", minimum: 0, maximum: 10 },
            discountDays: { type: "integer", minimum: 0 },
          },
        },
        DunningStatus: {
          type: "object",
          properties: {
            level: { type: "integer", minimum: 0, maximum: 3 },
            lastReminderDate: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["invoiceId", "issueDate", "dueDate", "customer", "lines", "paymentTerms", "dunning"]),
    valid: {
      invoiceId: "INV-2026-001",
      issueDate: "2026-06-01",
      dueDate: "2026-06-15",
      customer: { name: "Kunde GmbH", customerNumber: "C-1001" },
      lines: [{ description: "Beratung", quantity: 10, unitPriceEur: 150, taxRatePct: 19 }],
      paymentTerms: { netDays: 14, discountPct: 2, discountDays: 7 },
    },
    invalid: { invoiceId: "I", issueDate: "x", dueDate: "y", customer: {}, lines: [], paymentTerms: {} },
  },
  {
    id: "fx-trade-order",
    domain: "finance",
    label: "Devisenhandel-Auftrag",
    description: "FX-Order mit Währungspaar, Order-Typ und Ausführungsdetails.",
    sources: [
      "https://www.iso.org/standard/20022-9",
      "https://www.tracefinancial.com/when-worlds-collide-iso-20022-meets-json-2/",
    ],
    schema: objectSchema(
      "FX-Order",
      {
        orderId: { type: "string" },
        client: refDef("FxClient"),
        instrument: refDef("CurrencyPair"),
        order: refDef("FxOrderDetails"),
        execution: refDef("FxExecution"),
      },
      ["orderId", "client", "instrument", "order"],
      {
        FxClient: {
          type: "object",
          required: ["clientId", "accountId"],
          properties: {
            clientId: { type: "string" },
            accountId: { type: "string" },
            lei: { type: "string", pattern: "^[A-Z0-9]{20}$" },
          },
        },
        CurrencyPair: {
          type: "object",
          required: ["base", "quote"],
          properties: {
            base: { type: "string", enum: ["EUR", "USD", "GBP", "CHF", "JPY"] },
            quote: { type: "string", enum: ["EUR", "USD", "GBP", "CHF", "JPY"] },
          },
        },
        FxOrderDetails: {
          oneOf: [
            {
              type: "object",
              required: ["side", "amount", "orderType"],
              properties: {
                side: { type: "string", enum: ["buy", "sell"] },
                amount: { type: "number", minimum: 0.01 },
                orderType: { type: "string", enum: ["market", "stop"] },
                validUntil: { type: "string", format: "date-time" },
              },
            },
            {
              type: "object",
              required: ["side", "amount", "orderType", "limitRate"],
              properties: {
                side: { type: "string", enum: ["buy", "sell"] },
                amount: { type: "number", minimum: 0.01 },
                orderType: { const: "limit" },
                limitRate: { type: "number", minimum: 0 },
                validUntil: { type: "string", format: "date-time" },
              },
            },
          ],
        },
        FxExecution: {
          type: "object",
          properties: {
            executedRate: { type: "number", minimum: 0 },
            executedAt: { type: "string", format: "date-time" },
            counterparty: { type: "string" },
            feesEur: { type: "number", minimum: 0 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["orderId", "client", "instrument", "order", "execution"]),
    valid: {
      orderId: "FX-2026-001",
      client: { clientId: "CL-500", accountId: "ACC-9001" },
      instrument: { base: "EUR", quote: "USD" },
      order: { side: "buy", amount: 100000, orderType: "limit", limitRate: 1.085, validUntil: "2026-06-12T17:00:00Z" },
    },
    invalid: { orderId: "F", client: {}, instrument: { base: "EUR", quote: "EUR" }, order: { side: "buy", amount: 0, orderType: "limit" } },
  },
];
