import { useEffect, useMemo, useState } from "react";
import type { ObjectSchema, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  createEmptyDataForSchema,
  getValueAtPath,
  setValueAtPath,
} from "@jsonschema-editor/json-schema";
import { buildPropertyScope, scopeToPath } from "@jsonschema-editor/ui-schema";
import { resolveCompositionAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { JseLabel } from "../../atoms/JseLabel.js";
import { JseSelect } from "../../atoms/JseSelect.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { SchemaFormFieldResolver } from "./SchemaFormFieldResolver.js";

function isObjectSchemaNode(node: SchemaNode): node is ObjectSchema {
  return node.nodeKind === "object";
}

function branchPropertyKeys(branch: SchemaNode, document?: FormFieldProps["document"]): string[] {
  const resolved = document ? document.resolveNode(branch) : branch;
  if (!isObjectSchemaNode(resolved)) return [];
  return [...resolved.properties.keys()];
}

export function OneOfFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly,
  data,
  onDataChange,
}: FormFieldProps) {
  const { t } = useJseI18n();
  const rootSchema = document?.root ?? schema;
  const dataPath = useMemo(() => scopeToPath(scope), [scope]);

  const composition = useMemo(() => {
    const resolveRef = document ? (ref: string) => document.resolveRef(ref) : undefined;
    return resolveCompositionAtScope(rootSchema, scope, resolveRef);
  }, [document, rootSchema, scope]);

  const branches = useMemo(() => {
    if (!composition) return [];
    return composition.oneOf.length > 0 ? composition.oneOf : composition.anyOf;
  }, [composition]);

  const branchLabels = useMemo(
    () =>
      branches.map((branch, index) => {
        const resolved = document ? document.resolveNode(branch) : branch;
        return resolved.title ?? branch.title ?? `Option ${index + 1}`;
      }),
    [branches, document],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  function readBranchData(formData: Record<string, unknown>): Record<string, unknown> {
    const value = getValueAtPath(formData, dataPath);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return {};
  }

  function resolvedBranch(index: number): SchemaNode {
    const branch = branches[index];
    return document ? document.resolveNode(branch) : branch;
  }

  function inferSelectedIndex(branchRecord: Record<string, unknown>): number {
    for (let i = 0; i < branches.length; i++) {
      const resolved = resolvedBranch(i);
      if (!isObjectSchemaNode(resolved)) continue;

      const constProps = [...resolved.properties.entries()].filter(
        ([, prop]) => prop.constValue !== undefined,
      );
      if (
        constProps.length > 0 &&
        constProps.every(([name, prop]) => branchRecord[name] === prop.constValue)
      ) {
        return i;
      }
    }

    const allBranchKeys = branches.map((branch) => branchPropertyKeys(branch, document));
    for (let i = 0; i < branches.length; i++) {
      const uniqueKeys = allBranchKeys[i].filter(
        (key) => allBranchKeys.filter((_, j) => j !== i).every((keys) => !keys.includes(key)),
      );
      if (uniqueKeys.some((key) => key in branchRecord)) return i;
    }

    for (let i = 0; i < branches.length; i++) {
      if (branchPropertyKeys(branches[i], document).some((key) => key in branchRecord)) {
        return i;
      }
    }
    return 0;
  }

  useEffect(() => {
    setSelectedIndex(inferSelectedIndex(readBranchData(data)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-sync when branch data changes
  }, [data, branches]);

  const activeBranch = useMemo(() => {
    const branch = branches[selectedIndex];
    if (!branch) return undefined;
    return document ? document.resolveNode(branch) : branch;
  }, [branches, document, selectedIndex]);

  const activeBranchProperties = useMemo(() => {
    if (!activeBranch || !isObjectSchemaNode(activeBranch)) return [];
    return [...activeBranch.properties.entries()].filter(([, propSchema]) => {
      if (branches.length > 1 && propSchema.constValue !== undefined) return false;
      return true;
    });
  }, [activeBranch, branches.length]);

  function writeBranchData(next: Record<string, unknown>) {
    if (dataPath.length === 0) {
      onDataChange(next);
      return;
    }
    onDataChange(setValueAtPath(data, dataPath, next));
  }

  function onVariantChange(raw: string | number) {
    const index = Number(raw);
    if (Number.isNaN(index) || index < 0 || index >= branches.length) return;

    setSelectedIndex(index);

    const current = readBranchData(data);
    const oneOfKeys = new Set(branches.flatMap((branch) => branchPropertyKeys(branch, document)));
    const preserved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(current)) {
      if (!oneOfKeys.has(key)) preserved[key] = value;
    }

    const branchData = createEmptyDataForSchema(resolvedBranch(index));
    writeBranchData(
      typeof branchData === "object" && branchData !== null && !Array.isArray(branchData)
        ? { ...preserved, ...(branchData as Record<string, unknown>) }
        : preserved,
    );
  }

  if (!composition || !activeBranch) return null;

  return (
    <fieldset className="jse-group jse-oneof-field">
      {label ? <legend>{label}</legend> : null}

      {branches.length > 1 ? (
        <div className="jse-field">
          <JseLabel>{t("form.oneOf.type")}</JseLabel>
          <JseSelect
            modelValue={selectedIndex}
            onModelValueChange={onVariantChange}
            className="jse-field__input"
            disabled={readonly}
          >
            {branchLabels.map((optionLabel, index) => (
              <option key={index} value={index}>
                {optionLabel}
              </option>
            ))}
          </JseSelect>
        </div>
      ) : null}

      {activeBranchProperties.map(([name]) => (
        <SchemaFormFieldResolver
          key={`${selectedIndex}-${name}`}
          schema={rootSchema}
          document={document}
          scope={buildPropertyScope(scope, name)}
          readonly={readonly}
          data={data}
          onDataChange={onDataChange}
          i18nKey={i18nKey}
        />
      ))}
    </fieldset>
  );
}
