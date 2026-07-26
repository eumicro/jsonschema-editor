import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { JseLocale } from "@jsonschema-editor/react";
import {
  createInMemoryFileFieldProvider,
  FileFieldProvider,
} from "@jsonschema-editor/react-extensions";
import { appUiFor, fallbackLocaleFor } from "../../jsonschema-editor-examples/src/site/i18n/app-ui.js";
import { getStartedFor } from "../../jsonschema-editor-examples/src/site/i18n/get-started.js";
import { imprintFor } from "../../jsonschema-editor-examples/src/site/i18n/imprint.js";
import {
  applyDocumentMeta,
  buildPageMeta,
} from "../../jsonschema-editor-examples/src/site/seo/index.js";
import { writePreferredStack } from "../../jsonschema-editor-examples/src/site/stack-preference.js";
import {
  hrefForStackExample,
  hrefForStackSwitch,
  navigateTo,
  parseAppLocation,
  pathFor,
  type AppLocale,
  type AppPage,
  type AppStack,
} from "./app-routing.js";
import {
  defaultReactExampleId,
  exampleCatalog,
  exampleCategoryOrder,
  exampleCopyFor,
  examplesByCategory,
  type ExampleCategory,
  type ExampleId,
} from "./examples/catalog.js";
import { loadExampleFromJson } from "./examples/load-example.js";
import { seedDemoFilesForExample } from "../../jsonschema-editor-examples/src/examples/demo-file-seeds.js";
import { SiteShell } from "./site/components/templates/SiteShell.js";
import { ExamplesWorkspace } from "./site/components/organisms/ExamplesWorkspace.js";
import { GetStartedPage } from "./site/pages/GetStartedPage.js";
import { ImprintPage } from "./site/pages/ImprintPage.js";

type WorkspaceMode = "form" | "editor" | "json" | "code";
type JsonPane = "schema" | "ui" | "data";

const OWNED_STACK = "react" as const;
const knownExampleIds = new Set<string>(Object.keys(exampleCatalog));

function readLocation() {
  return parseAppLocation(window.location.pathname, {
    defaultExampleId: defaultReactExampleId,
    ownedStack: OWNED_STACK,
    knownExampleIds,
  });
}

const boot = readLocation();
const initialExampleId = (
  boot.exampleId in exampleCatalog ? boot.exampleId : defaultReactExampleId
) as ExampleId;
const initial = loadExampleFromJson(exampleCatalog[initialExampleId]);
const fileProvider = createInMemoryFileFieldProvider();
const labelLocales: readonly JseLocale[] = [
  "de",
  "en",
  "fr",
  "it",
  "pl",
  "uk",
  "ru",
  "zh",
  "ja",
];

export function App() {
  const [activePage, setActivePage] = useState<AppPage>(boot.page);
  const [activeExampleId, setActiveExampleId] = useState<ExampleId>(initialExampleId);
  const [locale, setLocale] = useState<AppLocale>(boot.locale);
  const [schema, setSchema] = useState<SchemaDocument>(initial.schema);
  const [uiSchema, setUiSchema] = useState<UiSchema>(initial.uiSchema);
  const [formData, setFormData] = useState<Record<string, unknown>>(initial.defaults);
  const [uiLabelMessages, setUiLabelMessages] = useState(() =>
    structuredClone(exampleCatalog[initialExampleId].messages),
  );
  const [mode, setMode] = useState<WorkspaceMode>("form");
  const [jsonPane, setJsonPane] = useState<JsonPane>("schema");
  const syncingFromUrl = useRef(false);
  const stateRef = useRef({ activePage, locale, activeExampleId });
  stateRef.current = { activePage, locale, activeExampleId };

  const ui = appUiFor(locale);
  const fallbackLocale = fallbackLocaleFor(locale);
  const activeExample = exampleCatalog[activeExampleId];
  const activeExampleCopy = exampleCopyFor(activeExample, locale);

  const visibleCategories = useMemo(
    () =>
      exampleCategoryOrder.filter(
        (category: ExampleCategory) => examplesByCategory[category].length > 0,
      ),
    [],
  );

  const schemaJson = useMemo(() => JSON.stringify(schema.toJSON(), null, 2), [schema]);
  const uiSchemaJson = useMemo(() => JSON.stringify(uiSchema.toJSON(), null, 2), [uiSchema]);
  const dataJson = useMemo(() => JSON.stringify(formData, null, 2), [formData]);
  const activeJsonContent =
    jsonPane === "schema" ? schemaJson : jsonPane === "ui" ? uiSchemaJson : dataJson;

  const examplesHref = pathFor({
    locale,
    page: "examples",
    stack: OWNED_STACK,
    exampleId: activeExampleId,
    defaultExampleId: defaultReactExampleId,
    ownedStack: OWNED_STACK,
  });
  const getStartedHref = pathFor({
    locale,
    page: "get-started",
    stack: OWNED_STACK,
    defaultExampleId: defaultReactExampleId,
    ownedStack: OWNED_STACK,
  });
  const imprintHref = pathFor({
    locale,
    page: "imprint",
    defaultExampleId: defaultReactExampleId,
    ownedStack: OWNED_STACK,
  });

  const pushCurrentUrl = useCallback(
    (overrides?: Partial<{ page: AppPage; locale: AppLocale; exampleId: ExampleId }>) => {
      if (syncingFromUrl.current) return;
      const current = stateRef.current;
      navigateTo(
        pathFor({
          locale: overrides?.locale ?? current.locale,
          page: overrides?.page ?? current.activePage,
          stack: OWNED_STACK,
          exampleId: overrides?.exampleId ?? current.activeExampleId,
          defaultExampleId: defaultReactExampleId,
          ownedStack: OWNED_STACK,
        }),
      );
    },
    [],
  );

  const applyLocationFromUrl = useCallback(() => {
    const loc = readLocation();
    syncingFromUrl.current = true;
    setActivePage(loc.page);
    setLocale(loc.locale);
    let exampleId = stateRef.current.activeExampleId;
    if (loc.exampleId in exampleCatalog) {
      exampleId = loc.exampleId as ExampleId;
      setActiveExampleId(exampleId);
    }

    const canonical = pathFor({
      locale: loc.locale,
      page: loc.page,
      stack: OWNED_STACK,
      exampleId,
      defaultExampleId: defaultReactExampleId,
      ownedStack: OWNED_STACK,
    });
    if (window.location.pathname !== canonical) {
      window.history.replaceState(null, "", canonical);
    }
    setTimeout(() => {
      syncingFromUrl.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    writePreferredStack(OWNED_STACK);
    applyLocationFromUrl();
    const onPopState = () => {
      applyLocationFromUrl();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyLocationFromUrl]);

  useEffect(() => {
    const getStarted = getStartedFor(locale, OWNED_STACK);
    const imprint = imprintFor(locale);
    applyDocumentMeta(
      buildPageMeta({
        locale,
        page: activePage,
        stack: OWNED_STACK,
        exampleId: activeExampleId,
        defaultExampleId: defaultReactExampleId,
        exampleLabel: activeExampleCopy.label,
        exampleTagline: activeExampleCopy.tagline,
        exampleDescription: activeExampleCopy.description,
        getStartedTitle: getStarted.title,
        getStartedLead: getStarted.lead,
        imprintTitle: imprint.pageTitle,
        fallbackDescription: ui.subtitle,
      }),
    );
  }, [activePage, locale, activeExampleId, activeExampleCopy, ui.subtitle]);

  useEffect(() => {
    const manifest = exampleCatalog[activeExampleId];
    const loaded = loadExampleFromJson(manifest);
    let cancelled = false;

    void (async () => {
      await seedDemoFilesForExample(fileProvider, activeExampleId);
      if (cancelled) return;
      setSchema(loaded.schema);
      setUiSchema(loaded.uiSchema);
      setFormData(loaded.defaults);
      setUiLabelMessages(structuredClone(manifest.messages));
    })();

    return () => {
      cancelled = true;
    };
  }, [activeExampleId]);

  const skipExampleUrlPush = useRef(true);
  useEffect(() => {
    if (skipExampleUrlPush.current) {
      skipExampleUrlPush.current = false;
      return;
    }
    if (!syncingFromUrl.current) pushCurrentUrl();
  }, [activeExampleId, pushCurrentUrl]);

  const skipLocaleUrlPush = useRef(true);
  useEffect(() => {
    if (skipLocaleUrlPush.current) {
      skipLocaleUrlPush.current = false;
      return;
    }
    if (!syncingFromUrl.current) pushCurrentUrl();
  }, [locale, pushCurrentUrl]);

  function openGetStarted() {
    setActivePage("get-started");
    pushCurrentUrl({ page: "get-started" });
  }

  function openImprint() {
    setActivePage("imprint");
    pushCurrentUrl({ page: "imprint" });
  }

  function openExamples() {
    setActivePage("examples");
    pushCurrentUrl({ page: "examples" });
  }

  function selectExample(id: ExampleId) {
    setActivePage("examples");
    setActiveExampleId(id);
    pushCurrentUrl({ page: "examples", exampleId: id });
  }

  function exampleHref(id: ExampleId): string {
    return hrefForStackExample(OWNED_STACK, {
      locale,
      stack: OWNED_STACK,
      exampleId: id,
    });
  }

  function stackHref(stack: AppStack): string {
    return hrefForStackSwitch({
      locale,
      page: activePage,
      stack,
      exampleId: activeExampleId,
    });
  }

  function onSelectStack(stack: AppStack) {
    writePreferredStack(stack);
  }

  return (
    <FileFieldProvider provider={fileProvider}>
      <SiteShell
        ui={ui}
        activePage={activePage}
        ownedStack={OWNED_STACK}
        locale={locale}
        examplesHref={examplesHref}
        getStartedHref={getStartedHref}
        imprintHref={imprintHref}
        vueHref={stackHref("vue")}
        reactHref={stackHref("react")}
        onLocaleChange={setLocale}
        onOpenExamples={openExamples}
        onOpenGetStarted={openGetStarted}
        onOpenImprint={openImprint}
        onSelectStack={onSelectStack}
      >
        {activePage === "get-started" ? (
          <GetStartedPage
            locale={locale}
            stack={OWNED_STACK}
            onOpenExamples={openExamples}
            onOpenExample={(id) => selectExample(id as ExampleId)}
          />
        ) : null}
        {activePage === "imprint" ? <ImprintPage locale={locale} /> : null}
        {activePage === "examples" ? (
          <ExamplesWorkspace
            locale={locale}
            fallbackLocale={fallbackLocale}
            labelLocales={labelLocales}
            ui={ui}
            visibleCategories={visibleCategories}
            activeExampleId={activeExampleId}
            activeExample={activeExample}
            activeExampleCopy={activeExampleCopy}
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            uiLabelMessages={uiLabelMessages}
            mode={mode}
            jsonPane={jsonPane}
            dataJson={dataJson}
            activeJsonContent={activeJsonContent}
            exampleHref={exampleHref}
            onSelectExample={selectExample}
            onActiveExampleIdChange={setActiveExampleId}
            onFormDataChange={setFormData}
            onSchemaChange={setSchema}
            onUiSchemaChange={setUiSchema}
            onMessagesChange={setUiLabelMessages}
            onModeChange={setMode}
            onJsonPaneChange={setJsonPane}
          />
        ) : null}
      </SiteShell>
    </FileFieldProvider>
  );
}
