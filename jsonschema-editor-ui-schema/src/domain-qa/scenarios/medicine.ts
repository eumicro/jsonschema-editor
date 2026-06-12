import type { DomainScenarioDefinition } from "../types.js";
import { objectSchema, propertyControls, refDef } from "./helpers.js";

export const medicineScenarios: DomainScenarioDefinition[] = [
  {
    id: "patient-record",
    domain: "medicine",
    label: "Patientenstammdaten",
    description: "FHIR-inspirierte Patientenakte mit Identifikatoren, Kontakt und Versicherung.",
    sources: [
      "https://hl7.org/fhir/R5/patient.schema.json.html",
      "https://github.com/alysivji/fhir-zod",
    ],
    schema: objectSchema(
      "Patient",
      {
        resourceType: { const: "Patient" },
        identifier: { type: "array", minItems: 1, items: refDef("PatientIdentifier") },
        name: { type: "array", minItems: 1, items: refDef("HumanName") },
        gender: { type: "string", enum: ["male", "female", "other", "unknown"] },
        birthDate: { type: "string", format: "date" },
        address: { type: "array", items: refDef("Address") },
        insurance: refDef("InsuranceCoverage"),
      },
      ["resourceType", "identifier", "name", "gender", "birthDate"],
      {
        PatientIdentifier: {
          type: "object",
          required: ["system", "value"],
          properties: {
            system: { type: "string", enum: ["http://fhir.de/sid/kvid/10", "urn:oid:2.16.840.1.113883.2.4.3.07"] },
            value: { type: "string" },
          },
        },
        HumanName: {
          type: "object",
          required: ["family", "given"],
          properties: {
            family: { type: "string" },
            given: { type: "array", items: { type: "string" }, minItems: 1 },
            prefix: { type: "array", items: { type: "string" } },
          },
        },
        Address: {
          type: "object",
          required: ["line", "city", "postalCode", "country"],
          properties: {
            line: { type: "array", items: { type: "string" }, minItems: 1 },
            city: { type: "string" },
            postalCode: { type: "string" },
            country: { type: "string", minLength: 2, maxLength: 2 },
          },
        },
        InsuranceCoverage: {
          type: "object",
          required: ["payorType", "memberId"],
          properties: {
            payorType: { type: "string", enum: ["gesetzlich", "privat", "self-pay"] },
            memberId: { type: "string" },
            validUntil: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: propertyControls(
      ["resourceType", "identifier", "name", "gender", "birthDate", "address", "insurance"],
      "#",
      { resourceType: "Ressourcentyp" },
    ),
    valid: {
      resourceType: "Patient",
      identifier: [{ system: "http://fhir.de/sid/kvid/10", value: "A123456789" }],
      name: [{ family: "Müller", given: ["Sabine"] }],
      gender: "female",
      birthDate: "1985-07-22",
      insurance: { payorType: "gesetzlich", memberId: "M123456789" },
    },
    invalid: { resourceType: "Observation", identifier: [], name: [], gender: "invalid" },
  },
  {
    id: "lab-observation",
    domain: "medicine",
    label: "Laborbefund (Observation)",
    description: "Laborwert mit choice-type value[x], Referenzbereich und Interpretation.",
    sources: ["http://hl7.org/fhir/observation.schema.json.html"],
    schema: objectSchema(
      "Laborbefund",
      {
        resourceType: { const: "Observation" },
        status: { type: "string", enum: ["registered", "final", "amended"] },
        code: refDef("ObservationCode"),
        subject: refDef("SubjectRef"),
        effectiveDateTime: { type: "string", format: "date-time" },
        value: {
          oneOf: [refDef("QuantityValue"), refDef("StringValue"), refDef("BooleanValue")],
        },
        referenceRange: { type: "array", items: refDef("ReferenceRange") },
      },
      ["resourceType", "status", "code", "subject", "effectiveDateTime", "value"],
      {
        ObservationCode: {
          type: "object",
          required: ["system", "code", "display"],
          properties: {
            system: { type: "string" },
            code: { type: "string" },
            display: { type: "string" },
          },
        },
        SubjectRef: {
          type: "object",
          required: ["patientId"],
          properties: { patientId: { type: "string" } },
        },
        QuantityValue: {
          type: "object",
          required: ["valueType", "value", "unit"],
          properties: {
            valueType: { const: "quantity" },
            value: { type: "number" },
            unit: { type: "string" },
            comparator: { type: "string", enum: ["<", "<=", ">=", ">"] },
          },
        },
        StringValue: {
          type: "object",
          required: ["valueType", "text"],
          properties: { valueType: { const: "string" }, text: { type: "string" } },
        },
        BooleanValue: {
          type: "object",
          required: ["valueType", "flag"],
          properties: { valueType: { const: "boolean" }, flag: { type: "boolean" } },
        },
        ReferenceRange: {
          type: "object",
          properties: {
            low: { type: "number" },
            high: { type: "number" },
            text: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["resourceType", "status", "code", "subject", "effectiveDateTime", "value"]),
    valid: {
      resourceType: "Observation",
      status: "final",
      code: { system: "http://loinc.org", code: "718-7", display: "Hemoglobin" },
      subject: { patientId: "PAT-001" },
      effectiveDateTime: "2026-06-12T07:30:00Z",
      value: { valueType: "quantity", value: 14.2, unit: "g/dL" },
    },
    invalid: { resourceType: "Patient", status: "draft", code: {}, subject: {}, effectiveDateTime: "x" },
  },
  {
    id: "medication-plan",
    domain: "medicine",
    label: "Medikationsplan",
    description: "Medikationsliste mit Dosierungsschema, Interaktionshinweisen und Verordner.",
    sources: ["http://hl7.org/fhir/observation.schema.json.html"],
    schema: objectSchema(
      "Medikationsplan",
      {
        patientId: { type: "string" },
        planDate: { type: "string", format: "date" },
        medications: { type: "array", minItems: 1, items: refDef("MedicationEntry") },
        prescriber: refDef("Prescriber"),
      },
      ["patientId", "planDate", "medications", "prescriber"],
      {
        MedicationEntry: {
          type: "object",
          required: ["pzn", "name", "dosage"],
          properties: {
            pzn: { type: "string", pattern: "^[0-9]{8}$" },
            name: { type: "string" },
            dosage: refDef("DosageSchedule"),
            route: { type: "string", enum: ["oral", "iv", "topical", "inhalation"] },
            prn: { type: "boolean", title: "Bei Bedarf" },
          },
        },
        DosageSchedule: {
          oneOf: [
            {
              type: "object",
              required: ["dose", "frequency"],
              properties: {
                dose: { type: "string" },
                frequency: { type: "string", enum: ["1-0-0", "1-0-1", "1-1-1"] },
              },
            },
            {
              type: "object",
              required: ["dose", "frequency", "customSchedule"],
              properties: {
                dose: { type: "string" },
                frequency: { const: "custom" },
                customSchedule: { type: "string" },
              },
            },
          ],
        },
        Prescriber: {
          type: "object",
          required: ["name", "lanr"],
          properties: {
            name: { type: "string" },
            lanr: { type: "string", pattern: "^[0-9]{9}$" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["patientId", "planDate", "medications", "prescriber"]),
    valid: {
      patientId: "PAT-001",
      planDate: "2026-06-12",
      medications: [{ pzn: "12345678", name: "Metformin 500mg", dosage: { dose: "1 Tablette", frequency: "1-0-1" }, route: "oral" }],
      prescriber: { name: "Dr. Weber", lanr: "123456789" },
    },
    invalid: { patientId: "P", planDate: "invalid", medications: [], prescriber: { name: "X" } },
  },
  {
    id: "clinical-composition",
    domain: "medicine",
    label: "Arztbrief (Composition)",
    description: "Klinisches Dokument mit Abschnitten, Autoren und Attestierung.",
    sources: ["https://hl7.org/fhir/R5/composition.schema.json.html"],
    schema: objectSchema(
      "Arztbrief",
      {
        resourceType: { const: "Composition" },
        status: { type: "string", enum: ["preliminary", "final", "amended"] },
        type: refDef("DocumentType"),
        subject: refDef("SubjectRef"),
        date: { type: "string", format: "date-time" },
        author: { type: "array", minItems: 1, items: refDef("Author") },
        sections: { type: "array", minItems: 1, items: refDef("CompositionSection") },
        attester: { type: "array", items: refDef("Attester") },
      },
      ["resourceType", "status", "type", "subject", "date", "author", "sections"],
      {
        DocumentType: {
          type: "object",
          required: ["code", "display"],
          properties: {
            code: { type: "string" },
            display: { type: "string" },
          },
        },
        SubjectRef: {
          type: "object",
          required: ["patientId"],
          properties: { patientId: { type: "string" } },
        },
        Author: {
          type: "object",
          required: ["practitionerId", "role"],
          properties: {
            practitionerId: { type: "string" },
            role: { type: "string", enum: ["attending", "referring", "consultant"] },
          },
        },
        CompositionSection: {
          type: "object",
          required: ["title", "code", "text"],
          properties: {
            title: { type: "string" },
            code: { type: "string" },
            text: { type: "string" },
            entries: { type: "array", items: { type: "string" } },
          },
        },
        Attester: {
          type: "object",
          required: ["mode", "party"],
          properties: {
            mode: { type: "string", enum: ["professional", "legal", "official"] },
            party: { type: "string" },
            time: { type: "string", format: "date-time" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["resourceType", "status", "type", "subject", "date", "author", "sections"]),
    valid: {
      resourceType: "Composition",
      status: "final",
      type: { code: "11503-0", display: "Medical records" },
      subject: { patientId: "PAT-001" },
      date: "2026-06-12T16:00:00Z",
      author: [{ practitionerId: "PRAC-01", role: "attending" }],
      sections: [{ title: "Anamnese", code: "10164-2", text: "Patient berichtet über..." }],
    },
    invalid: { resourceType: "Patient", status: "invalid", type: {}, subject: {}, date: "x", author: [], sections: [] },
  },
  {
    id: "appointment-booking",
    domain: "medicine",
    label: "Terminvereinbarung",
    description: "Praxis-/Kliniktermin mit Slot, Fachrichtung und Priorität.",
    sources: ["https://hl7.org/fhir/R5/composition.schema.json.html"],
    schema: objectSchema(
      "Termin",
      {
        appointmentId: { type: "string" },
        patientId: { type: "string" },
        specialty: { type: "string", enum: ["general", "cardiology", "orthopedics", "radiology"] },
        slot: refDef("AppointmentSlot"),
        priority: { type: "string", enum: ["routine", "urgent", "emergency"] },
        reason: { type: "string" },
      },
      ["appointmentId", "patientId", "specialty", "slot"],
      {
        AppointmentSlot: {
          type: "object",
          required: ["start", "end", "location"],
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
            location: refDef("LocationRef"),
            modality: { type: "string", enum: ["in-person", "video", "phone"] },
          },
        },
        LocationRef: {
          type: "object",
          required: ["siteId", "room"],
          properties: {
            siteId: { type: "string" },
            room: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["appointmentId", "patientId", "specialty", "slot", "priority", "reason"]),
    valid: {
      appointmentId: "APT-2026-001",
      patientId: "PAT-001",
      specialty: "cardiology",
      slot: {
        start: "2026-06-20T09:00:00Z",
        end: "2026-06-20T09:30:00Z",
        location: { siteId: "SITE-01", room: "Raum 3" },
        modality: "in-person",
      },
      priority: "routine",
    },
    invalid: { appointmentId: "A", patientId: "P", specialty: "invalid", slot: { start: "x", end: "y" } },
  },
  {
    id: "vaccination-record",
    domain: "medicine",
    label: "Impfpass-Eintrag",
    description: "Impfung mit Impfstoff, Charge, Dosisnummer und Impfort.",
    sources: ["http://hl7.org/fhir/observation.schema.json.html"],
    schema: objectSchema(
      "Impfung",
      {
        patientId: { type: "string" },
        vaccine: refDef("VaccineProduct"),
        administration: refDef("VaccineAdministration"),
        performer: refDef("Performer"),
      },
      ["patientId", "vaccine", "administration"],
      {
        VaccineProduct: {
          type: "object",
          required: ["name", "atcCode", "batchNumber"],
          properties: {
            name: { type: "string" },
            atcCode: { type: "string" },
            batchNumber: { type: "string" },
            manufacturer: { type: "string" },
          },
        },
        VaccineAdministration: {
          type: "object",
          required: ["occurrenceDateTime", "doseNumber", "site"],
          properties: {
            occurrenceDateTime: { type: "string", format: "date-time" },
            doseNumber: { type: "integer", minimum: 1 },
            seriesDoses: { type: "integer", minimum: 1 },
            site: { type: "string", enum: ["left_arm", "right_arm", "left_thigh", "right_thigh"] },
            route: { type: "string", enum: ["intramuscular", "subcutaneous"] },
          },
        },
        Performer: {
          type: "object",
          required: ["organization", "practitionerId"],
          properties: {
            organization: { type: "string" },
            practitionerId: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["patientId", "vaccine", "administration", "performer"]),
    valid: {
      patientId: "PAT-001",
      vaccine: { name: "Comirnaty", atcCode: "J07BX03", batchNumber: "BATCH-2026-01" },
      administration: {
        occurrenceDateTime: "2026-06-12T10:00:00Z",
        doseNumber: 3,
        site: "left_arm",
        route: "intramuscular",
      },
      performer: { organization: "Impfzentrum Berlin", practitionerId: "PRAC-02" },
    },
    invalid: { patientId: "P", vaccine: { name: "X" }, administration: { occurrenceDateTime: "x", doseNumber: 0 } },
  },
  {
    id: "hospital-discharge",
    domain: "medicine",
    label: "Krankenhaus-Entlassung",
    description: "Entlassungsmanagement mit Diagnosen, Medikation und Nachsorge.",
    sources: ["https://hl7.org/fhir/R5/composition.schema.json.html"],
    schema: objectSchema(
      "Entlassung",
      {
        encounterId: { type: "string" },
        patientId: { type: "string" },
        dischargeDateTime: { type: "string", format: "date-time" },
        diagnoses: { type: "array", minItems: 1, items: refDef("DischargeDiagnosis") },
        followUp: refDef("FollowUpPlan"),
        dischargeDisposition: { type: "string", enum: ["home", "rehab", "nursing", "hospice"] },
      },
      ["encounterId", "patientId", "dischargeDateTime", "diagnoses", "dischargeDisposition"],
      {
        DischargeDiagnosis: {
          type: "object",
          required: ["icd10", "description", "type"],
          properties: {
            icd10: { type: "string", pattern: "^[A-Z][0-9]{2}(\\.[0-9]{1,2})?$" },
            description: { type: "string" },
            type: { type: "string", enum: ["primary", "secondary"] },
          },
        },
        FollowUpPlan: {
          type: "object",
          properties: {
            appointments: { type: "array", items: refDef("FollowUpAppointment") },
            homeCare: { type: "boolean" },
            instructions: { type: "string" },
          },
        },
        FollowUpAppointment: {
          type: "object",
          required: ["specialty", "withinDays"],
          properties: {
            specialty: { type: "string" },
            withinDays: { type: "integer", minimum: 1 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["encounterId", "patientId", "dischargeDateTime", "diagnoses", "followUp", "dischargeDisposition"]),
    valid: {
      encounterId: "ENC-001",
      patientId: "PAT-001",
      dischargeDateTime: "2026-06-12T14:00:00Z",
      diagnoses: [{ icd10: "I21.9", description: "Akuter Myokardinfarkt", type: "primary" }],
      dischargeDisposition: "rehab",
      followUp: { appointments: [{ specialty: "cardiology", withinDays: 14 }] },
    },
    invalid: { encounterId: "E", patientId: "P", dischargeDateTime: "x", diagnoses: [], dischargeDisposition: "invalid" },
  },
  {
    id: "telemedicine-session",
    domain: "medicine",
    label: "Telemedizin-Sitzung",
    description: "Videosprechstunde mit Consent, Technikcheck und klinischer Bewertung.",
    sources: ["http://hl7.org/fhir/observation.schema.json.html"],
    schema: objectSchema(
      "Telemedizin",
      {
        sessionId: { type: "string" },
        patientId: { type: "string" },
        consent: refDef("TeleConsent"),
        technicalCheck: refDef("TechnicalCheck"),
        clinicalAssessment: refDef("ClinicalAssessment"),
      },
      ["sessionId", "patientId", "consent", "technicalCheck", "clinicalAssessment"],
      {
        TeleConsent: {
          type: "object",
          required: ["dataProcessing", "recording", "signedAt"],
          properties: {
            dataProcessing: { type: "boolean" },
            recording: { type: "boolean" },
            signedAt: { type: "string", format: "date-time" },
          },
        },
        TechnicalCheck: {
          type: "object",
          required: ["audioOk", "videoOk", "connectionQuality"],
          properties: {
            audioOk: { type: "boolean" },
            videoOk: { type: "boolean" },
            connectionQuality: { type: "string", enum: ["good", "fair", "poor"] },
          },
        },
        ClinicalAssessment: {
          type: "object",
          required: ["chiefComplaint", "recommendation"],
          properties: {
            chiefComplaint: { type: "string" },
            recommendation: { type: "string", enum: ["self-care", "gp-visit", "er-visit", "prescription"] },
            notes: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["sessionId", "patientId", "consent", "technicalCheck", "clinicalAssessment"]),
    valid: {
      sessionId: "TM-001",
      patientId: "PAT-001",
      consent: { dataProcessing: true, recording: false, signedAt: "2026-06-12T08:55:00Z" },
      technicalCheck: { audioOk: true, videoOk: true, connectionQuality: "good" },
      clinicalAssessment: { chiefComplaint: "Husten seit 3 Tagen", recommendation: "gp-visit" },
    },
    invalid: { sessionId: "T", patientId: "P", consent: {}, technicalCheck: {}, clinicalAssessment: {} },
  },
  {
    id: "clinical-trial-enrollment",
    domain: "medicine",
    label: "Klinische Studie – Einschluss",
    description: "Studieneinschluss mit Eligibility-Kriterien, Randomisierung und Einwilligung.",
    sources: ["https://github.com/reason-healthcare/fhir-types-workspace"],
    schema: objectSchema(
      "Studieneinschluss",
      {
        studyId: { type: "string" },
        patientId: { type: "string" },
        eligibility: refDef("EligibilityAssessment"),
        randomization: refDef("RandomizationArm"),
        informedConsent: refDef("InformedConsent"),
      },
      ["studyId", "patientId", "eligibility", "informedConsent"],
      {
        EligibilityAssessment: {
          type: "object",
          required: ["inclusionMet", "exclusionMet"],
          properties: {
            inclusionMet: { type: "array", items: { type: "string" }, minItems: 1 },
            exclusionMet: { type: "array", items: { type: "string" } },
            screeningDate: { type: "string", format: "date" },
          },
        },
        RandomizationArm: {
          type: "object",
          required: ["arm", "blockNumber"],
          properties: {
            arm: { type: "string", enum: ["treatment", "control", "placebo"] },
            blockNumber: { type: "integer", minimum: 1 },
          },
        },
        InformedConsent: {
          type: "object",
          required: ["version", "signedAt", "witnessPresent"],
          properties: {
            version: { type: "string" },
            signedAt: { type: "string", format: "date-time" },
            witnessPresent: { type: "boolean" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["studyId", "patientId", "eligibility", "randomization", "informedConsent"]),
    valid: {
      studyId: "NCT-2026-001",
      patientId: "PAT-001",
      eligibility: { inclusionMet: ["age>=18", "diagnosis-confirmed"], exclusionMet: [], screeningDate: "2026-06-01" },
      randomization: { arm: "treatment", blockNumber: 4 },
      informedConsent: { version: "v2.1", signedAt: "2026-06-12T09:00:00Z", witnessPresent: true },
    },
    invalid: { studyId: "NCT", patientId: "P", eligibility: { inclusionMet: [] }, informedConsent: {} },
  },
  {
    id: "emergency-triage",
    domain: "medicine",
    label: "Notaufnahme-Triage",
    description: "ESI-Triage mit Vitalparametern, Red Flags und Zuweisungspriorität.",
    sources: ["http://hl7.org/fhir/observation.schema.json.html"],
    schema: objectSchema(
      "Notfall-Triage",
      {
        triageId: { type: "string" },
        arrivalDateTime: { type: "string", format: "date-time" },
        vitals: refDef("VitalSigns"),
        esiLevel: { type: "integer", minimum: 1, maximum: 5 },
        redFlags: { type: "array", items: { type: "string" } },
        disposition: refDef("TriageDisposition"),
      },
      ["triageId", "arrivalDateTime", "vitals", "esiLevel", "disposition"],
      {
        VitalSigns: {
          type: "object",
          required: ["heartRate", "respiratoryRate", "systolicBp", "temperatureC"],
          properties: {
            heartRate: { type: "integer", minimum: 20, maximum: 250 },
            respiratoryRate: { type: "integer", minimum: 4, maximum: 60 },
            systolicBp: { type: "integer", minimum: 50, maximum: 250 },
            temperatureC: { type: "number", minimum: 30, maximum: 45 },
            oxygenSaturationPct: { type: "number", minimum: 50, maximum: 100 },
          },
        },
        TriageDisposition: {
          oneOf: [refDef("ImmediateCare"), refDef("WaitingArea")],
        },
        ImmediateCare: {
          type: "object",
          required: ["dispositionType", "bay"],
          properties: {
            dispositionType: { const: "immediate" },
            bay: { type: "string", enum: ["resuscitation", "trauma", "acute"] },
          },
        },
        WaitingArea: {
          type: "object",
          required: ["dispositionType", "estimatedWaitMin"],
          properties: {
            dispositionType: { const: "waiting" },
            estimatedWaitMin: { type: "integer", minimum: 0 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["triageId", "arrivalDateTime", "vitals", "esiLevel", "redFlags", "disposition"]),
    valid: {
      triageId: "TRI-001",
      arrivalDateTime: "2026-06-12T22:10:00Z",
      vitals: { heartRate: 110, respiratoryRate: 22, systolicBp: 140, temperatureC: 38.5 },
      esiLevel: 2,
      redFlags: ["chest_pain"],
      disposition: { dispositionType: "immediate", bay: "acute" },
    },
    invalid: { triageId: "T", arrivalDateTime: "x", vitals: { heartRate: 10 }, esiLevel: 9, disposition: {} },
  },
];
