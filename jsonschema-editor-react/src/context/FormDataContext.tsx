import { createContext, useContext, type ReactNode } from "react";

export interface FormDataContextValue {
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}

const FormDataContext = createContext<FormDataContextValue | null>(null);

export function FormDataProvider({
  data,
  onDataChange,
  children,
}: FormDataContextValue & { children: ReactNode }) {
  return (
    <FormDataContext.Provider value={{ data, onDataChange }}>{children}</FormDataContext.Provider>
  );
}

export function useFormData(): FormDataContextValue {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error("useFormData must be used within JsonSchemaForm");
  }
  return context;
}
