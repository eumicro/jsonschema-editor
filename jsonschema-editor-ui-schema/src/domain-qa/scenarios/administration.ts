import type { DomainScenarioDefinition } from "../types.js";
import { categorization, objectSchema, propertyControls, refDef } from "./helpers.js";

export const administrationScenarios: DomainScenarioDefinition[] = [
  {
    id: "citizen-application",
    domain: "administration",
    label: "Online-Bürgerantrag",
    description: "Generischer Verwaltungsantrag mit Antragsteller, Anliegen und Nachweisen.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Bürgerantrag",
      {
        applicationId: { type: "string" },
        authority: refDef("AuthorityRef"),
        applicant: refDef("Applicant"),
        request: refDef("CitizenRequest"),
        attachments: { type: "array", items: refDef("Attachment") },
      },
      ["applicationId", "authority", "applicant", "request"],
      {
        AuthorityRef: {
          type: "object",
          required: ["ags", "name"],
          properties: {
            ags: { type: "string", pattern: "^[0-9]{8}$", title: "Amtlicher Gemeindeschlüssel" },
            name: { type: "string" },
          },
        },
        Applicant: {
          oneOf: [
            {
              type: "object",
              required: ["type", "person"],
              properties: {
                type: { const: "naturalPerson" },
                person: refDef("NaturalPerson"),
              },
            },
            {
              type: "object",
              required: ["type", "entity"],
              properties: {
                type: { const: "legalEntity" },
                entity: refDef("LegalEntity"),
              },
            },
          ],
        },
        NaturalPerson: {
          type: "object",
          required: ["firstName", "lastName", "birthDate"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date" },
          },
        },
        LegalEntity: {
          type: "object",
          required: ["companyName", "registerCourt", "registerNumber"],
          properties: {
            companyName: { type: "string" },
            registerCourt: { type: "string" },
            registerNumber: { type: "string" },
          },
        },
        CitizenRequest: {
          type: "object",
          required: ["subject", "description"],
          properties: {
            subject: { type: "string" },
            description: { type: "string", minLength: 20 },
            urgency: { type: "string", enum: ["normal", "urgent"] },
          },
        },
        Attachment: {
          type: "object",
          required: ["filename", "mimeType", "sha256"],
          properties: {
            filename: { type: "string" },
            mimeType: { type: "string" },
            sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["applicationId", "authority", "applicant", "request", "attachments"]),
    valid: {
      applicationId: "APP-2026-001",
      authority: { ags: "11000000", name: "Senatsverwaltung Berlin" },
      applicant: { type: "naturalPerson", person: { firstName: "Anna", lastName: "Schmidt", birthDate: "1990-03-15" } },
      request: { subject: "Ummeldung", description: "Ich beantrage die Ummeldung an die neue Adresse wegen Umzugs." },
    },
    invalid: { applicationId: "A", authority: { ags: "1", name: "X" }, applicant: { type: "naturalPerson" }, request: { subject: "X", description: "kurz" } },
  },
  {
    id: "melderegister-request",
    domain: "administration",
    label: "Melderegister-Auszug (XMeld)",
    description: "Meldebescheinigung mit Abfragegrund und Empfänger (XÖV/XMeld-inspiriert).",
    sources: [
      "https://en.wikipedia.org/wiki/X%C3%96V",
      "https://www.xrepository.de",
    ],
    schema: objectSchema(
      "Melderegister-Auszug",
      {
        requestId: { type: "string" },
        purpose: { type: "string", enum: ["self", "thirdParty", "authority"] },
        dataSubject: refDef("RegisteredPerson"),
        delivery: refDef("DeliveryMethod"),
      },
      ["requestId", "purpose", "dataSubject", "delivery"],
      {
        RegisteredPerson: {
          type: "object",
          required: ["firstName", "lastName", "birthDate", "currentAddress"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date" },
            currentAddress: refDef("GermanAddress"),
          },
        },
        GermanAddress: {
          type: "object",
          required: ["street", "houseNumber", "postalCode", "city"],
          properties: {
            street: { type: "string" },
            houseNumber: { type: "string" },
            postalCode: { type: "string", pattern: "^[0-9]{5}$" },
            city: { type: "string" },
          },
        },
        DeliveryMethod: {
          oneOf: [refDef("PostalDelivery"), refDef("DigitalDelivery")],
        },
        PostalDelivery: {
          type: "object",
          required: ["method", "address"],
          properties: {
            method: { const: "postal" },
            address: refDef("GermanAddress"),
          },
        },
        DigitalDelivery: {
          type: "object",
          required: ["method", "email"],
          properties: {
            method: { const: "digital" },
            email: { type: "string", format: "email" },
          },
        },
      },
    ),
    uiSchema: categorization([
      { label: "Zweck", scope: "#/properties/purpose" },
      { label: "Betroffene Person", scope: "#/properties/dataSubject" },
      { label: "Zustellung", scope: "#/properties/delivery" },
    ]),
    valid: {
      requestId: "MR-2026-001",
      purpose: "self",
      dataSubject: {
        firstName: "Anna",
        lastName: "Schmidt",
        birthDate: "1990-03-15",
        currentAddress: { street: "Musterstraße", houseNumber: "12", postalCode: "10115", city: "Berlin" },
      },
      delivery: { method: "digital", email: "anna@example.com" },
    },
    invalid: { requestId: "M", purpose: "invalid", dataSubject: { firstName: "A" }, delivery: { method: "postal" } },
  },
  {
    id: "e-invoice-xrechnung",
    domain: "administration",
    label: "E-Rechnung (XRechnung)",
    description: "Behördenrechnung nach EN 16931 / XRechnung mit Positionen und Steuer.",
    sources: [
      "https://en.wikipedia.org/wiki/X%C3%96V",
      "https://www.xrepository.de",
    ],
    schema: objectSchema(
      "XRechnung",
      {
        invoiceNumber: { type: "string" },
        issueDate: { type: "string", format: "date" },
        seller: refDef("InvoiceParty"),
        buyer: refDef("PublicBuyer"),
        lineItems: { type: "array", minItems: 1, items: refDef("InvoiceLine") },
        taxTotal: refDef("TaxTotal"),
      },
      ["invoiceNumber", "issueDate", "seller", "buyer", "lineItems", "taxTotal"],
      {
        InvoiceParty: {
          type: "object",
          required: ["name", "vatId", "address"],
          properties: {
            name: { type: "string" },
            vatId: { type: "string" },
            address: refDef("GermanAddress"),
          },
        },
        PublicBuyer: {
          type: "object",
          required: ["name", "leitwegId"],
          properties: {
            name: { type: "string" },
            leitwegId: { type: "string", pattern: "^[0-9]{2}-[A-Za-z0-9]+-[0-9]{2}$" },
          },
        },
        GermanAddress: {
          type: "object",
          required: ["street", "postalCode", "city", "country"],
          properties: {
            street: { type: "string" },
            postalCode: { type: "string" },
            city: { type: "string" },
            country: { type: "string", const: "DE" },
          },
        },
        InvoiceLine: {
          type: "object",
          required: ["lineId", "description", "quantity", "unitPriceEur", "taxCategory"],
          properties: {
            lineId: { type: "integer", minimum: 1 },
            description: { type: "string" },
            quantity: { type: "number", minimum: 0.01 },
            unitPriceEur: { type: "number", minimum: 0 },
            taxCategory: { type: "string", enum: ["S", "Z", "E", "AE"] },
          },
        },
        TaxTotal: {
          type: "object",
          required: ["taxAmountEur", "netAmountEur", "grossAmountEur"],
          properties: {
            taxAmountEur: { type: "number", minimum: 0 },
            netAmountEur: { type: "number", minimum: 0 },
            grossAmountEur: { type: "number", minimum: 0 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["invoiceNumber", "issueDate", "seller", "buyer", "lineItems", "taxTotal"]),
    valid: {
      invoiceNumber: "RE-2026-001",
      issueDate: "2026-06-12",
      seller: { name: "Muster GmbH", vatId: "DE123456789", address: { street: "Industriestr. 1", postalCode: "10115", city: "Berlin", country: "DE" } },
      buyer: { name: "Bundesamt", leitwegId: "99-123456789-01" },
      lineItems: [{ lineId: 1, description: "Beratung", quantity: 8, unitPriceEur: 120, taxCategory: "S" }],
      taxTotal: { taxAmountEur: 182.4, netAmountEur: 960, grossAmountEur: 1142.4 },
    },
    invalid: { invoiceNumber: "R", issueDate: "invalid", seller: {}, buyer: {}, lineItems: [], taxTotal: {} },
  },
  {
    id: "business-registration",
    domain: "administration",
    label: "Gewerbeanmeldung",
    description: "Gewerbeamt-Anmeldung mit Tätigkeit, Betriebsstätte und Rechtsform.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Gewerbeanmeldung",
      {
        registrationType: { type: "string", enum: ["neuanmeldung", "ummeldung", "abmeldung"] },
        business: refDef("BusinessInfo"),
        owner: refDef("BusinessOwner"),
        premises: refDef("BusinessPremises"),
      },
      ["registrationType", "business", "owner", "premises"],
      {
        BusinessInfo: {
          type: "object",
          required: ["tradeName", "activityDescription", "legalForm"],
          properties: {
            tradeName: { type: "string" },
            activityDescription: { type: "string", minLength: 10 },
            legalForm: { type: "string", enum: ["Einzelunternehmen", "GbR", "GmbH", "UG"] },
            startDate: { type: "string", format: "date" },
          },
        },
        BusinessOwner: {
          type: "object",
          required: ["name", "birthDate", "taxId"],
          properties: {
            name: { type: "string" },
            birthDate: { type: "string", format: "date" },
            taxId: { type: "string", pattern: "^[0-9]{11}$" },
          },
        },
        BusinessPremises: {
          type: "object",
          required: ["address", "employeesCount"],
          properties: {
            address: refDef("GermanAddress"),
            employeesCount: { type: "integer", minimum: 0 },
            homeOffice: { type: "boolean" },
          },
        },
        GermanAddress: {
          type: "object",
          required: ["street", "postalCode", "city"],
          properties: {
            street: { type: "string" },
            postalCode: { type: "string" },
            city: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["registrationType", "business", "owner", "premises"]),
    valid: {
      registrationType: "neuanmeldung",
      business: { tradeName: "Café Sonnenschein", activityDescription: "Gastronomie mit Kaffee und Snacks", legalForm: "Einzelunternehmen", startDate: "2026-07-01" },
      owner: { name: "Peter Klein", birthDate: "1980-01-10", taxId: "12345678901" },
      premises: { address: { street: "Hauptstr. 5", postalCode: "80331", city: "München" }, employeesCount: 2 },
    },
    invalid: { registrationType: "invalid", business: { tradeName: "X" }, owner: {}, premises: {} },
  },
  {
    id: "tax-declaration-base",
    domain: "administration",
    label: "Steuererklärung – Grunddaten",
    description: "ESt-Grunddaten mit Steuerpflichtigen, Einkünften und Freibeträgen.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Steuererklärung",
      {
        taxYear: { type: "integer", minimum: 2020, maximum: 2030 },
        taxpayer: refDef("Taxpayer"),
        income: refDef("IncomeSummary"),
        deductions: refDef("Deductions"),
      },
      ["taxYear", "taxpayer", "income"],
      {
        Taxpayer: {
          oneOf: [
            {
              type: "object",
              required: ["taxId", "maritalStatus"],
              properties: {
                taxId: { type: "string", pattern: "^[0-9]{11}$" },
                maritalStatus: { type: "string", enum: ["single", "widowed", "divorced"] },
              },
            },
            {
              type: "object",
              required: ["taxId", "maritalStatus", "spouse"],
              properties: {
                taxId: { type: "string", pattern: "^[0-9]{11}$" },
                maritalStatus: { const: "married" },
                spouse: refDef("SpouseInfo"),
              },
            },
          ],
        },
        SpouseInfo: {
          type: "object",
          required: ["taxId", "name"],
          properties: {
            taxId: { type: "string", pattern: "^[0-9]{11}$" },
            name: { type: "string" },
          },
        },
        IncomeSummary: {
          type: "object",
          required: ["employment", "capitalGains"],
          properties: {
            employment: refDef("EmploymentIncome"),
            capitalGains: { type: "number", minimum: 0 },
            rentalIncome: { type: "number", minimum: 0 },
          },
        },
        EmploymentIncome: {
          type: "object",
          required: ["grossEur", "taxWithheldEur"],
          properties: {
            grossEur: { type: "number", minimum: 0 },
            taxWithheldEur: { type: "number", minimum: 0 },
            employerId: { type: "string" },
          },
        },
        Deductions: {
          type: "object",
          properties: {
            specialExpensesEur: { type: "number", minimum: 0 },
            extraordinaryExpensesEur: { type: "number", minimum: 0 },
            childAllowanceCount: { type: "integer", minimum: 0 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["taxYear", "taxpayer", "income", "deductions"]),
    valid: {
      taxYear: 2025,
      taxpayer: { taxId: "12345678901", maritalStatus: "single" },
      income: { employment: { grossEur: 52000, taxWithheldEur: 9800 }, capitalGains: 1200 },
      deductions: { specialExpensesEur: 800 },
    },
    invalid: { taxYear: 2010, taxpayer: { taxId: "abc" }, income: { employment: { grossEur: -1 } } },
  },
  {
    id: "family-reunion-visa",
    domain: "administration",
    label: "Familiennachzug",
    description: "Visumsantrag Familiennachzug mit Sponsor, Familienverhältnis und Nachweisen.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Familiennachzug",
      {
        caseId: { type: "string" },
        sponsor: refDef("Sponsor"),
        applicant: refDef("VisaApplicant"),
        relationship: refDef("FamilyRelationship"),
        documents: { type: "array", minItems: 1, items: refDef("VisaDocument") },
      },
      ["caseId", "sponsor", "applicant", "relationship", "documents"],
      {
        Sponsor: {
          type: "object",
          required: ["name", "residencePermit", "incomeEur"],
          properties: {
            name: { type: "string" },
            residencePermit: { type: "string" },
            incomeEur: { type: "number", minimum: 0 },
            housingSizeSqm: { type: "number", minimum: 20 },
          },
        },
        VisaApplicant: {
          type: "object",
          required: ["name", "nationality", "passportNumber"],
          properties: {
            name: { type: "string" },
            nationality: { type: "string", minLength: 2, maxLength: 2 },
            passportNumber: { type: "string" },
            birthDate: { type: "string", format: "date" },
          },
        },
        FamilyRelationship: {
          oneOf: [
            {
              type: "object",
              required: ["type", "marriageDate"],
              properties: {
                type: { const: "spouse" },
                marriageDate: { type: "string", format: "date" },
              },
            },
            {
              type: "object",
              required: ["type", "childAge"],
              properties: {
                type: { const: "child" },
                childAge: { type: "integer", minimum: 0, maximum: 18 },
              },
            },
            {
              type: "object",
              required: ["type"],
              properties: {
                type: { const: "parent" },
              },
            },
          ],
        },
        VisaDocument: {
          type: "object",
          required: ["type", "referenceNumber"],
          properties: {
            type: { type: "string", enum: ["passport", "marriage_certificate", "birth_certificate", "language_certificate"] },
            referenceNumber: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["caseId", "sponsor", "applicant", "relationship", "documents"]),
    valid: {
      caseId: "FN-2026-001",
      sponsor: { name: "Max Mustermann", residencePermit: "Niederlassungserlaubnis", incomeEur: 45000, housingSizeSqm: 65 },
      applicant: { name: "Erika Mustermann", nationality: "TR", passportNumber: "U12345678" },
      relationship: { type: "spouse", marriageDate: "2020-05-10" },
      documents: [{ type: "passport", referenceNumber: "U12345678" }, { type: "marriage_certificate", referenceNumber: "MC-001" }],
    },
    invalid: { caseId: "F", sponsor: {}, applicant: {}, relationship: { type: "spouse" }, documents: [] },
  },
  {
    id: "building-permit",
    domain: "administration",
    label: "Bauantrag",
    description: "Baugenehmigung mit Grundstück, Bauvorhaben und Statiknachweis.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Bauantrag",
      {
        permitId: { type: "string" },
        parcel: refDef("LandParcel"),
        project: refDef("ConstructionProject"),
        professionals: { type: "array", minItems: 1, items: refDef("BuildingProfessional") },
      },
      ["permitId", "parcel", "project", "professionals"],
      {
        LandParcel: {
          type: "object",
          required: ["flurstueckId", "address", "areaSqm"],
          properties: {
            flurstueckId: { type: "string" },
            address: { type: "string" },
            areaSqm: { type: "number", minimum: 1 },
            zoning: { type: "string", enum: ["WA", "MI", "GE", "SO"] },
          },
        },
        ConstructionProject: {
          type: "object",
          required: ["type", "grossFloorAreaSqm", "floors"],
          properties: {
            type: { type: "string", enum: ["neubau", "anbau", "umbau", "abbruch"] },
            grossFloorAreaSqm: { type: "number", minimum: 1 },
            floors: { type: "integer", minimum: 1, maximum: 30 },
            energyStandard: { type: "string", enum: ["KfW55", "KfW40", "Passivhaus"] },
          },
        },
        BuildingProfessional: {
          type: "object",
          required: ["role", "name", "licenseNumber"],
          properties: {
            role: { type: "string", enum: ["architect", "structural_engineer", "energy_consultant"] },
            name: { type: "string" },
            licenseNumber: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["permitId", "parcel", "project", "professionals"]),
    valid: {
      permitId: "BP-2026-001",
      parcel: { flurstueckId: "123/456", address: "Bauweg 1, 80331 München", areaSqm: 450 },
      project: { type: "neubau", grossFloorAreaSqm: 220, floors: 2, energyStandard: "KfW40" },
      professionals: [{ role: "architect", name: "Architektur Büro Müller", licenseNumber: "BY-12345" }],
    },
    invalid: { permitId: "B", parcel: {}, project: { type: "invalid" }, professionals: [] },
  },
  {
    id: "social-benefits-application",
    domain: "administration",
    label: "Sozialleistungsantrag",
    description: "Antrag auf Grundsicherung/Bürgergeld mit Haushalt und Einkommen.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Sozialleistung",
      {
        applicationId: { type: "string" },
        household: refDef("Household"),
        income: refDef("HouseholdIncome"),
        assets: refDef("HouseholdAssets"),
        housing: refDef("HousingCosts"),
      },
      ["applicationId", "household", "income", "housing"],
      {
        Household: {
          type: "object",
          required: ["members"],
          properties: {
            members: { type: "array", minItems: 1, items: refDef("HouseholdMember") },
          },
        },
        HouseholdMember: {
          type: "object",
          required: ["name", "birthDate", "relation"],
          properties: {
            name: { type: "string" },
            birthDate: { type: "string", format: "date" },
            relation: { type: "string", enum: ["applicant", "spouse", "child", "other"] },
            employed: { type: "boolean" },
          },
        },
        HouseholdIncome: {
          type: "object",
          required: ["totalMonthlyEur"],
          properties: {
            totalMonthlyEur: { type: "number", minimum: 0 },
            sources: { type: "array", items: refDef("IncomeSource") },
          },
        },
        IncomeSource: {
          type: "object",
          required: ["type", "amountEur"],
          properties: {
            type: { type: "string", enum: ["employment", "pension", "child_benefit", "other"] },
            amountEur: { type: "number", minimum: 0 },
          },
        },
        HouseholdAssets: {
          type: "object",
          properties: {
            cashEur: { type: "number", minimum: 0 },
            vehicleCount: { type: "integer", minimum: 0 },
            realEstate: { type: "boolean" },
          },
        },
        HousingCosts: {
          type: "object",
          required: ["rentEur", "heatingEur"],
          properties: {
            rentEur: { type: "number", minimum: 0 },
            heatingEur: { type: "number", minimum: 0 },
            sqm: { type: "number", minimum: 10 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["applicationId", "household", "income", "assets", "housing"]),
    valid: {
      applicationId: "SL-2026-001",
      household: { members: [{ name: "Anna Schmidt", birthDate: "1990-03-15", relation: "applicant" }] },
      income: { totalMonthlyEur: 900, sources: [{ type: "employment", amountEur: 900 }] },
      housing: { rentEur: 650, heatingEur: 80, sqm: 45 },
    },
    invalid: { applicationId: "S", household: { members: [] }, income: {}, housing: {} },
  },
  {
    id: "certificate-of-conduct",
    domain: "administration",
    label: "Führungszeugnis",
    description: "Antrag auf polizeiliches Führungszeugnis mit Verwendungszweck.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Führungszeugnis",
      {
        requestId: { type: "string" },
        certificateType: { type: "string", enum: ["privat", "oeffentlich", "besonders"] },
        applicant: refDef("CertificateApplicant"),
        purpose: refDef("CertificatePurpose"),
      },
      ["requestId", "certificateType", "applicant", "purpose"],
      {
        CertificateApplicant: {
          type: "object",
          required: ["firstName", "lastName", "birthDate", "birthPlace", "nationality"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date" },
            birthPlace: { type: "string" },
            nationality: { type: "string", minLength: 2, maxLength: 2 },
            previousNames: { type: "array", items: { type: "string" } },
          },
        },
        CertificatePurpose: {
          oneOf: [
            {
              type: "object",
              required: ["category", "employerName"],
              properties: {
                category: { const: "employment" },
                employerName: { type: "string" },
                description: { type: "string" },
              },
            },
            {
              type: "object",
              required: ["category"],
              properties: {
                category: { type: "string", enum: ["volunteer", "visa", "other"] },
                description: { type: "string" },
              },
            },
          ],
        },
      },
    ),
    uiSchema: propertyControls(["requestId", "certificateType", "applicant", "purpose"]),
    valid: {
      requestId: "FZ-2026-001",
      certificateType: "oeffentlich",
      applicant: { firstName: "Anna", lastName: "Schmidt", birthDate: "1990-03-15", birthPlace: "Berlin", nationality: "DE" },
      purpose: { category: "employment", employerName: "Krankenhaus Charité" },
    },
    invalid: { requestId: "F", certificateType: "invalid", applicant: { firstName: "A" }, purpose: { category: "employment" } },
  },
  {
    id: "election-notification",
    domain: "administration",
    label: "Wahlbenachrichtigung",
    description: "Wahlbenachrichtigung mit Wahlbezirk, Stimmart und Briefwahloption.",
    sources: ["https://docs.xoev.de/xoev-handbuch/x%C3%B6v-handbuch"],
    schema: objectSchema(
      "Wahlbenachrichtigung",
      {
        notificationId: { type: "string" },
        election: refDef("ElectionInfo"),
        voter: refDef("Voter"),
        pollingStation: refDef("PollingStation"),
        votingMethod: refDef("VotingMethod"),
      },
      ["notificationId", "election", "voter", "pollingStation", "votingMethod"],
      {
        ElectionInfo: {
          type: "object",
          required: ["name", "date", "type"],
          properties: {
            name: { type: "string" },
            date: { type: "string", format: "date" },
            type: { type: "string", enum: ["bundestag", "landtag", "kommunal", "europawahl"] },
          },
        },
        Voter: {
          type: "object",
          required: ["firstName", "lastName", "birthDate", "address"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date" },
            address: { type: "string" },
          },
        },
        PollingStation: {
          type: "object",
          required: ["districtNumber", "location", "openingHours"],
          properties: {
            districtNumber: { type: "string" },
            location: { type: "string" },
            openingHours: { type: "string" },
          },
        },
        VotingMethod: {
          oneOf: [refDef("InPersonVoting"), refDef("PostalVoting")],
        },
        InPersonVoting: {
          type: "object",
          required: ["method"],
          properties: { method: { const: "in_person" } },
        },
        PostalVoting: {
          type: "object",
          required: ["method", "requestedAt"],
          properties: {
            method: { const: "postal" },
            requestedAt: { type: "string", format: "date-time" },
            returnDeadline: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: categorization([
      { label: "Wahl", scope: "#/properties/election" },
      { label: "Wähler", scope: "#/properties/voter" },
      { label: "Wahlbezirk", scope: "#/properties/pollingStation" },
      { label: "Stimmart", scope: "#/properties/votingMethod" },
    ]),
    valid: {
      notificationId: "WB-2026-001",
      election: { name: "Bundestagswahl 2026", date: "2026-09-27", type: "bundestag" },
      voter: { firstName: "Anna", lastName: "Schmidt", birthDate: "1990-03-15", address: "Musterstr. 1, 10115 Berlin" },
      pollingStation: { districtNumber: "101-042", location: "Grundschule Mitte", openingHours: "08:00-18:00" },
      votingMethod: { method: "postal", requestedAt: "2026-08-01T10:00:00Z", returnDeadline: "2026-09-26" },
    },
    invalid: { notificationId: "W", election: {}, voter: {}, pollingStation: {}, votingMethod: {} },
  },
];
