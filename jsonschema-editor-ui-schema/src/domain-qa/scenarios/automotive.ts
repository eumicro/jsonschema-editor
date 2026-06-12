import type { DomainScenarioDefinition } from "../types.js";
import { categorization, objectSchema, propertyControls, refDef } from "./helpers.js";

export const automotiveScenarios: DomainScenarioDefinition[] = [
  {
    id: "ecu-diagnostics",
    domain: "automotive",
    label: "ECU-Diagnoseparameter",
    description:
      "Diagnoseparameter mit Byte-Layout und Einheiten (OpenVehicleDiag / ASAM MCD-2D-inspiriert).",
    sources: [
      "https://github.com/rnd-ash/OpenVehicleDiag/blob/main/SCHEMA.md",
      "https://www.asam.net/standards/detail/mcd-2-d",
    ],
    schema: objectSchema(
      "ECU-Diagnose",
      {
        ecuId: { type: "string", title: "ECU-ID", pattern: "^[A-Z0-9._-]{3,32}$" },
        variant: refDef("EcuVariant"),
        parameters: {
          type: "array",
          title: "Parameter",
          minItems: 1,
          items: refDef("DiagnosticParameter"),
        },
        connection: refDef("DiagnosticConnection"),
      },
      ["ecuId", "variant", "parameters", "connection"],
      {
        EcuVariant: {
          type: "object",
          title: "ECU-Variante",
          required: ["softwareVersion", "hardwareVersion"],
          properties: {
            softwareVersion: { type: "string", title: "Softwareversion" },
            hardwareVersion: { type: "string", title: "Hardwareversion" },
            supplierCode: { type: "string", title: "Lieferantencode" },
          },
        },
        DiagnosticParameter: {
          type: "object",
          required: ["name", "dataFormat", "startBit", "lengthBits", "byteOrder"],
          properties: {
            name: { type: "string", title: "Name" },
            unit: { type: "string", title: "Einheit" },
            dataFormat: {
              type: "string",
              title: "Datentyp",
              enum: ["A_UINT32", "A_INT16", "A_FLOAT32", "A_ASCIISTRING"],
            },
            startBit: { type: "integer", title: "Startbit", minimum: 0 },
            lengthBits: { type: "integer", title: "Bitlänge", minimum: 1 },
            byteOrder: { type: "string", title: "Byte-Reihenfolge", enum: ["MSB", "LSB"] },
          },
        },
        DiagnosticConnection: {
          type: "object",
          required: ["connectionType", "baud", "sendId", "recvId"],
          properties: {
            connectionType: {
              type: "string",
              title: "Verbindungstyp",
              enum: ["CAN", "CAN_FD", "Ethernet", "K_LINE"],
            },
            baud: { type: "integer", title: "Baudrate" },
            sendId: { type: "integer", title: "Tester-ID" },
            recvId: { type: "integer", title: "Empfänger-ID" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["ecuId", "variant", "parameters", "connection"]),
    valid: {
      ecuId: "ECU.ENGINE.001",
      variant: { softwareVersion: "2.4.1", hardwareVersion: "HW-B12" },
      parameters: [
        {
          name: "EngineSpeed",
          unit: "rpm",
          dataFormat: "A_UINT32",
          startBit: 0,
          lengthBits: 16,
          byteOrder: "MSB",
        },
      ],
      connection: { connectionType: "CAN", baud: 500000, sendId: 2016, recvId: 2024 },
    },
    invalid: { ecuId: "x", variant: { softwareVersion: "1" } },
  },
  {
    id: "sovd-fault-entry",
    domain: "automotive",
    label: "SOVD-Fehlereintrag",
    description: "Service-Oriented Vehicle Diagnostics: Fehlercode, Schweregrad und Kontext.",
    sources: [
      "https://www.asam.net/standards/detail/sovd",
      "https://www.asam.net/index.php?eID=dumpFile&f=5036&t=f&token=b339d6abff02d6b0f6884f4fe6e0681955160505",
    ],
    schema: objectSchema(
      "SOVD-Fehlereintrag",
      {
        entityPath: { type: "string", title: "Entity-Pfad" },
        fault: refDef("FaultEntry"),
        environment: refDef("FaultEnvironment"),
      },
      ["entityPath", "fault"],
      {
        FaultEntry: {
          type: "object",
          required: ["code", "severity", "status"],
          properties: {
            code: { type: "string", title: "DTC/SOVD-Code", pattern: "^[PCBU][0-9A-F]{4}$" },
            severity: { type: "string", enum: ["info", "warning", "error", "critical"] },
            status: { type: "string", enum: ["active", "pending", "stored", "cleared"] },
            description: { type: "string", title: "Beschreibung" },
            occurredAt: { type: "string", format: "date-time", title: "Zeitpunkt" },
          },
        },
        FaultEnvironment: {
          type: "object",
          properties: {
            mileageKm: { type: "integer", minimum: 0 },
            ignitionCycle: { type: "integer", minimum: 0 },
            ambientTempC: { type: "number" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["entityPath", "fault", "environment"]),
    valid: {
      entityPath: "/components/Engine/subcomponents/ECU_1",
      fault: { code: "P0420", severity: "warning", status: "active", occurredAt: "2026-06-12T10:00:00Z" },
      environment: { mileageKm: 84200, ignitionCycle: 3 },
    },
    invalid: { entityPath: "/x", fault: { code: "INVALID", severity: "warning" } },
  },
  {
    id: "ota-software-update",
    domain: "automotive",
    label: "OTA-Software-Update",
    description: "Over-the-Air Update mit Paketmanifest, Ziel-ECUs und Rollback-Plan.",
    sources: ["https://www.asam.net/standards/detail/sovd"],
    schema: objectSchema(
      "OTA-Update",
      {
        campaignId: { type: "string", title: "Kampagnen-ID" },
        package: refDef("UpdatePackage"),
        targets: { type: "array", items: refDef("EcuTarget"), minItems: 1 },
        rollback: refDef("RollbackPlan"),
      },
      ["campaignId", "package", "targets"],
      {
        UpdatePackage: {
          type: "object",
          required: ["version", "checksumSha256", "sizeBytes"],
          properties: {
            version: { type: "string" },
            checksumSha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
            sizeBytes: { type: "integer", minimum: 1 },
            releaseNotes: { type: "string" },
          },
        },
        EcuTarget: {
          type: "object",
          required: ["ecuId", "currentVersion"],
          properties: {
            ecuId: { type: "string" },
            currentVersion: { type: "string" },
            updateMode: { type: "string", enum: ["sequential", "parallel"] },
          },
        },
        RollbackPlan: {
          type: "object",
          required: ["enabled"],
          properties: {
            enabled: { type: "boolean" },
            previousVersion: { type: "string" },
            maxAttempts: { type: "integer", minimum: 1, maximum: 5 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["campaignId", "package", "targets", "rollback"]),
    valid: {
      campaignId: "OTA-2026-Q2",
      package: { version: "3.1.0", checksumSha256: "a".repeat(64), sizeBytes: 524288000 },
      targets: [{ ecuId: "IVI", currentVersion: "3.0.2", updateMode: "sequential" }],
      rollback: { enabled: true, previousVersion: "3.0.2", maxAttempts: 2 },
    },
    invalid: { campaignId: "OTA", package: { version: "1", checksumSha256: "bad" } },
  },
  {
    id: "telematics-trip",
    domain: "automotive",
    label: "Telematik-Fahrtprotokoll",
    description: "Flottentelematik mit GPS-Track, Fahrverhalten und Kraftstoff/EV-Verbrauch.",
    sources: ["https://www.asam.net/standards/detail/sovd"],
    schema: objectSchema(
      "Telematik-Fahrt",
      {
        vehicleVin: { type: "string", title: "FIN/VIN", minLength: 17, maxLength: 17 },
        trip: refDef("TripRecord"),
        driver: refDef("DriverRef"),
      },
      ["vehicleVin", "trip"],
      {
        TripRecord: {
          type: "object",
          required: ["startTime", "endTime", "distanceKm", "positions"],
          properties: {
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            distanceKm: { type: "number", minimum: 0 },
            avgSpeedKmh: { type: "number", minimum: 0 },
            harshBrakingEvents: { type: "integer", minimum: 0 },
            positions: {
              type: "array",
              minItems: 2,
              items: {
                type: "object",
                required: ["lat", "lon", "recordedAt"],
                properties: {
                  lat: { type: "number", minimum: -90, maximum: 90 },
                  lon: { type: "number", minimum: -180, maximum: 180 },
                  recordedAt: { type: "string", format: "date-time" },
                },
              },
            },
            consumption: {
              oneOf: [refDef("FuelConsumption"), refDef("EvConsumption")],
            },
          },
        },
        FuelConsumption: {
          type: "object",
          required: ["type", "litersPer100Km"],
          properties: {
            type: { const: "fuel" },
            litersPer100Km: { type: "number", minimum: 0 },
          },
        },
        EvConsumption: {
          type: "object",
          required: ["type", "kwhPer100Km"],
          properties: {
            type: { const: "ev" },
            kwhPer100Km: { type: "number", minimum: 0 },
          },
        },
        DriverRef: {
          type: "object",
          properties: {
            driverId: { type: "string" },
            fleetCardId: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["vehicleVin", "trip", "driver"]),
    valid: {
      vehicleVin: "WVWZZZ1JZXW000001",
      trip: {
        startTime: "2026-06-12T08:00:00Z",
        endTime: "2026-06-12T09:15:00Z",
        distanceKm: 62.4,
        positions: [
          { lat: 52.52, lon: 13.405, recordedAt: "2026-06-12T08:00:00Z" },
          { lat: 52.48, lon: 13.44, recordedAt: "2026-06-12T09:15:00Z" },
        ],
        consumption: { type: "ev", kwhPer100Km: 16.2 },
      },
    },
    invalid: { vehicleVin: "SHORT", trip: { startTime: "x", endTime: "y", distanceKm: -1, positions: [] } },
  },
  {
    id: "adas-calibration",
    domain: "automotive",
    label: "ADAS-Sensorkalibrierung",
    description: "Kalibrierung von Kamera/Radar/Lidar mit Toleranzmatrizen und Prüfprotokoll.",
    sources: ["https://www.asam.net/standards/detail/mcd-2-d"],
    schema: objectSchema(
      "ADAS-Kalibrierung",
      {
        workshopId: { type: "string" },
        vehicle: refDef("VehicleRef"),
        sensors: { type: "array", minItems: 1, items: refDef("SensorCalibration") },
        signOff: refDef("CalibrationSignOff"),
      },
      ["workshopId", "vehicle", "sensors", "signOff"],
      {
        VehicleRef: {
          type: "object",
          required: ["vin"],
          properties: { vin: { type: "string", minLength: 17, maxLength: 17 } },
        },
        SensorCalibration: {
          type: "object",
          required: ["sensorType", "result"],
          properties: {
            sensorType: { type: "string", enum: ["front_camera", "rear_camera", "front_radar", "lidar"] },
            result: {
              oneOf: [refDef("CalibrationPass"), refDef("CalibrationFail")],
            },
          },
        },
        CalibrationPass: {
          type: "object",
          required: ["status", "deviationDeg"],
          properties: {
            status: { const: "pass" },
            deviationDeg: { type: "number", maximum: 0.5 },
          },
        },
        CalibrationFail: {
          type: "object",
          required: ["status", "reason"],
          properties: {
            status: { const: "fail" },
            reason: { type: "string" },
            retryAllowed: { type: "boolean" },
          },
        },
        CalibrationSignOff: {
          type: "object",
          required: ["technicianId", "signedAt"],
          properties: {
            technicianId: { type: "string" },
            signedAt: { type: "string", format: "date-time" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["workshopId", "vehicle", "sensors", "signOff"]),
    valid: {
      workshopId: "WS-BER-01",
      vehicle: { vin: "WVWZZZ1JZXW000001" },
      sensors: [{ sensorType: "front_camera", result: { status: "pass", deviationDeg: 0.12 } }],
      signOff: { technicianId: "TECH-42", signedAt: "2026-06-12T14:00:00Z" },
    },
    invalid: { workshopId: "WS", vehicle: {}, sensors: [], signOff: {} },
  },
  {
    id: "battery-diagnostics",
    domain: "automotive",
    label: "Batterie-Management-Diagnose",
    description: "BMS-Zellspannungen, Temperaturprofil und Ladezustand mit Grenzwertprüfung.",
    sources: ["https://github.com/rnd-ash/OpenVehicleDiag/blob/main/SCHEMA.md"],
    schema: objectSchema(
      "BMS-Diagnose",
      {
        packId: { type: "string" },
        stateOfChargePct: { type: "number", minimum: 0, maximum: 100 },
        cellGroups: { type: "array", minItems: 1, items: refDef("CellGroup") },
        thermalProfile: refDef("ThermalProfile"),
      },
      ["packId", "stateOfChargePct", "cellGroups"],
      {
        CellGroup: {
          type: "object",
          required: ["groupId", "cells"],
          properties: {
            groupId: { type: "integer", minimum: 0 },
            cells: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["cellId", "voltageV"],
                properties: {
                  cellId: { type: "integer" },
                  voltageV: { type: "number", minimum: 2.5, maximum: 4.3 },
                },
              },
            },
          },
        },
        ThermalProfile: {
          type: "object",
          required: ["minTempC", "maxTempC"],
          properties: {
            minTempC: { type: "number" },
            maxTempC: { type: "number" },
            probeLocations: { type: "array", items: { type: "string" } },
          },
        },
      },
    ),
    uiSchema: propertyControls(["packId", "stateOfChargePct", "cellGroups", "thermalProfile"]),
    valid: {
      packId: "HV-001",
      stateOfChargePct: 78.5,
      cellGroups: [{ groupId: 0, cells: [{ cellId: 1, voltageV: 3.92 }] }],
      thermalProfile: { minTempC: 18, maxTempC: 32 },
    },
    invalid: { packId: "HV", stateOfChargePct: 150, cellGroups: [] },
  },
  {
    id: "workshop-service-order",
    domain: "automotive",
    label: "Werkstatt-Serviceauftrag",
    description: "Serviceauftrag mit Arbeitsplänen, Ersatzteilen und Kundenfreigabe.",
    sources: ["https://www.asam.net/standards/detail/mcd-2-d"],
    schema: objectSchema(
      "Serviceauftrag",
      {
        orderNumber: { type: "string" },
        customer: refDef("ServiceCustomer"),
        vehicle: refDef("ServiceVehicle"),
        jobs: { type: "array", minItems: 1, items: refDef("ServiceJob") },
        approval: refDef("CustomerApproval"),
      },
      ["orderNumber", "customer", "vehicle", "jobs"],
      {
        ServiceCustomer: {
          type: "object",
          required: ["name", "phone"],
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        ServiceVehicle: {
          type: "object",
          required: ["vin", "mileageKm"],
          properties: {
            vin: { type: "string", minLength: 17, maxLength: 17 },
            mileageKm: { type: "integer", minimum: 0 },
            licensePlate: { type: "string" },
          },
        },
        ServiceJob: {
          type: "object",
          required: ["code", "description", "laborHours"],
          properties: {
            code: { type: "string" },
            description: { type: "string" },
            laborHours: { type: "number", minimum: 0.1 },
            parts: {
              type: "array",
              items: {
                type: "object",
                required: ["partNumber", "quantity"],
                properties: {
                  partNumber: { type: "string" },
                  quantity: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
        CustomerApproval: {
          type: "object",
          required: ["approved", "maxCostEur"],
          properties: {
            approved: { type: "boolean" },
            maxCostEur: { type: "number", minimum: 0 },
            approvedAt: { type: "string", format: "date-time" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["orderNumber", "customer", "vehicle", "jobs", "approval"]),
    valid: {
      orderNumber: "SO-2026-001",
      customer: { name: "Max Mustermann", phone: "+491701234567" },
      vehicle: { vin: "WVWZZZ1JZXW000001", mileageKm: 42000 },
      jobs: [{ code: "OEL", description: "Ölwechsel", laborHours: 0.8 }],
      approval: { approved: true, maxCostEur: 250 },
    },
    invalid: { orderNumber: "SO", customer: { name: "X" }, vehicle: { vin: "x", mileageKm: -1 }, jobs: [] },
  },
  {
    id: "vehicle-registration",
    domain: "automotive",
    label: "Fahrzeugzulassung",
    description: "Zulassungsantrag mit Halter, Typgenehmigung und Versicherungsnachweis.",
    sources: ["https://en.wikipedia.org/wiki/X%C3%96V"],
    schema: objectSchema(
      "Fahrzeugzulassung",
      {
        applicationType: { type: "string", enum: ["neuzulassung", "ummeldung", "abmeldung"] },
        holder: refDef("RegistrationHolder"),
        vehicle: refDef("RegistrationVehicle"),
        insurance: refDef("InsuranceProof"),
      },
      ["applicationType", "holder", "vehicle"],
      {
        RegistrationHolder: {
          oneOf: [
            {
              type: "object",
              required: ["type", "person"],
              properties: {
                type: { const: "person" },
                person: refDef("PersonHolder"),
              },
            },
            {
              type: "object",
              required: ["type", "company"],
              properties: {
                type: { const: "company" },
                company: refDef("CompanyHolder"),
              },
            },
          ],
        },
        PersonHolder: {
          type: "object",
          required: ["firstName", "lastName", "birthDate"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date" },
          },
        },
        CompanyHolder: {
          type: "object",
          required: ["companyName", "registerNumber"],
          properties: {
            companyName: { type: "string" },
            registerNumber: { type: "string" },
          },
        },
        RegistrationVehicle: {
          type: "object",
          required: ["vin", "typeApproval", "fuelType"],
          properties: {
            vin: { type: "string", minLength: 17, maxLength: 17 },
            typeApproval: { type: "string" },
            fuelType: { type: "string", enum: ["benzin", "diesel", "elektro", "hybrid"] },
          },
        },
        InsuranceProof: {
          type: "object",
          required: ["evbNumber", "validFrom"],
          properties: {
            evbNumber: { type: "string" },
            validFrom: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: categorization([
      { label: "Antragstyp", scope: "#/properties/applicationType" },
      { label: "Halter", scope: "#/properties/holder" },
      { label: "Fahrzeug", scope: "#/properties/vehicle" },
      { label: "Versicherung", scope: "#/properties/insurance" },
    ]),
    valid: {
      applicationType: "neuzulassung",
      holder: { type: "person", person: { firstName: "Anna", lastName: "Schmidt", birthDate: "1990-03-15" } },
      vehicle: { vin: "WVWZZZ1JZXW000001", typeApproval: "e1*2007/46*0001", fuelType: "elektro" },
      insurance: { evbNumber: "EVB123456", validFrom: "2026-06-01" },
    },
    invalid: { applicationType: "invalid", holder: { type: "person" }, vehicle: { vin: "x" } },
  },
  {
    id: "fleet-assignment",
    domain: "automotive",
    label: "Flottenzuweisung",
    description: "Fahrzeug-zu-Fahrer-Zuweisung mit Pool-/Leasing-Modell und Kostenstelle.",
    sources: ["https://www.asam.net/standards/detail/sovd"],
    schema: objectSchema(
      "Flottenzuweisung",
      {
        fleetId: { type: "string" },
        assignment: refDef("FleetAssignment"),
        costCenter: refDef("CostCenter"),
      },
      ["fleetId", "assignment"],
      {
        FleetAssignment: {
          oneOf: [
            {
              type: "object",
              required: ["vehicleVin", "mode", "driver"],
              properties: {
                vehicleVin: { type: "string", minLength: 17, maxLength: 17 },
                mode: { type: "string", enum: ["pool", "dedicated"] },
                driver: refDef("FleetDriver"),
              },
            },
            {
              type: "object",
              required: ["vehicleVin", "mode", "driver", "leasing"],
              properties: {
                vehicleVin: { type: "string", minLength: 17, maxLength: 17 },
                mode: { const: "leasing" },
                driver: refDef("FleetDriver"),
                leasing: refDef("LeasingTerms"),
              },
            },
          ],
        },
        FleetDriver: {
          type: "object",
          required: ["employeeId", "licenseClass"],
          properties: {
            employeeId: { type: "string" },
            licenseClass: { type: "array", items: { type: "string" }, minItems: 1 },
          },
        },
        LeasingTerms: {
          type: "object",
          required: ["contractId", "monthlyRateEur", "endDate"],
          properties: {
            contractId: { type: "string" },
            monthlyRateEur: { type: "number", minimum: 0 },
            endDate: { type: "string", format: "date" },
          },
        },
        CostCenter: {
          type: "object",
          required: ["code", "department"],
          properties: {
            code: { type: "string" },
            department: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["fleetId", "assignment", "costCenter"]),
    valid: {
      fleetId: "FLEET-DE-01",
      assignment: {
        vehicleVin: "WVWZZZ1JZXW000001",
        mode: "dedicated",
        driver: { employeeId: "E-1001", licenseClass: ["B"] },
      },
      costCenter: { code: "CC-4400", department: "Vertrieb" },
    },
    invalid: { fleetId: "F", assignment: { vehicleVin: "short", mode: "pool" } },
  },
  {
    id: "recall-campaign",
    domain: "automotive",
    label: "Rückrufaktion",
    description: "Recall-Kampagne mit betroffenen Fahrzeugen, Maßnahme und Statusverfolgung.",
    sources: ["https://www.asam.net/standards/detail/mcd-2-d"],
    schema: objectSchema(
      "Rückrufaktion",
      {
        campaignCode: { type: "string" },
        severity: { type: "string", enum: ["safety", "compliance", "quality"] },
        affectedModels: { type: "array", minItems: 1, items: { type: "string" } },
        remedy: refDef("RecallRemedy"),
        tracking: refDef("RecallTracking"),
      },
      ["campaignCode", "severity", "affectedModels", "remedy"],
      {
        RecallRemedy: {
          oneOf: [refDef("SoftwareRemedy"), refDef("HardwareRemedy")],
        },
        SoftwareRemedy: {
          type: "object",
          required: ["remedyType", "targetVersion"],
          properties: {
            remedyType: { const: "software" },
            targetVersion: { type: "string" },
            estimatedDurationMin: { type: "integer", minimum: 1 },
          },
        },
        HardwareRemedy: {
          type: "object",
          required: ["remedyType", "partNumber"],
          properties: {
            remedyType: { const: "hardware" },
            partNumber: { type: "string" },
            laborHours: { type: "number", minimum: 0.1 },
          },
        },
        RecallTracking: {
          type: "object",
          properties: {
            notifiedOwners: { type: "integer", minimum: 0 },
            completedRepairs: { type: "integer", minimum: 0 },
            deadline: { type: "string", format: "date" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["campaignCode", "severity", "affectedModels", "remedy", "tracking"]),
    valid: {
      campaignCode: "RC-2026-AIRBAG",
      severity: "safety",
      affectedModels: ["Model X 2022-2024"],
      remedy: { remedyType: "hardware", partNumber: "PN-998877", laborHours: 1.5 },
      tracking: { notifiedOwners: 1200, completedRepairs: 340 },
    },
    invalid: { campaignCode: "RC", severity: "unknown", affectedModels: [], remedy: { remedyType: "software" } },
  },
];
