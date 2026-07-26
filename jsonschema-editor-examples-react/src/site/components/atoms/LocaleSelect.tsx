import { localeOptions } from "../../../../../jsonschema-editor-examples/src/site/i18n/app-ui.js";
import type { AppLocale } from "../../../types/locale.js";

interface LocaleSelectProps {
  label: string;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}

export function LocaleSelect({ label, locale, onLocaleChange }: LocaleSelectProps) {
  return (
    <label className="app__locale-picker" htmlFor="app-locale-select">
      <span className="app__locale-label">{label}</span>
      <select
        id="app-locale-select"
        className="app__select"
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value as AppLocale)}
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
