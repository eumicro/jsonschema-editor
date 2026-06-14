import type { FileDescriptor } from "@jsonschema-editor/json-schema-extensions";
import type { InMemoryFileFieldProvider } from "@jsonschema-editor/vue-extensions";
import type { ExampleId } from "./catalog";
import schadensfall1Url from "./data/insurance-claim/schadensfall-1.png?url";

export const INSURANCE_CLAIM_SCHADENFOTO: FileDescriptor = {
  id: "insurance-claim-schadensfall-1",
  name: "schadensfall-1.png",
  mimeType: "image/png",
  size: 2990194,
};

async function seedInsuranceClaimFiles(provider: InMemoryFileFieldProvider): Promise<void> {
  const response = await fetch(schadensfall1Url);
  const blob = await response.blob();
  provider.seed(
    {
      ...INSURANCE_CLAIM_SCHADENFOTO,
      size: blob.size,
    },
    blob,
  );
}

const seedByExample: Partial<Record<ExampleId, (provider: InMemoryFileFieldProvider) => Promise<void>>> =
  {
    "insurance-claim": seedInsuranceClaimFiles,
  };

export async function seedDemoFilesForExample(
  provider: InMemoryFileFieldProvider,
  id: ExampleId,
): Promise<void> {
  await seedByExample[id]?.(provider);
}
