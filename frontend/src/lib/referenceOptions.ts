import type { Option } from "@/components/ui/autocomplete";
import type {
  ReferenceCountry,
  ReferenceHobby,
  ReferenceLanguage,
} from "@/services/api/referenceApi";

/** Picker label for ChipSelect / AutoComplete */
export function hobbiesToOptions(hobbies: ReferenceHobby[]): Option[] {
  return hobbies.map((h) => ({
    value: String(h.id),
    label: formatHobbyLabel(h),
  }));
}

export function formatHobbyLabel(h: {
  emoji?: string | null;
  displayLabel: string;
  hobbyName: string;
}): string {
  const base = h.displayLabel || h.hobbyName;
  return h.emoji ? `${h.emoji} ${base}` : base;
}

export function languagesToOptions(langs: ReferenceLanguage[]): Option[] {
  return langs.map((l) => ({
    value: l.langCode,
    label: l.emoji ? `${l.emoji} ${l.langName}` : l.langName,
  }));
}

export function countriesToOptions(countries: ReferenceCountry[]): Option[] {
  return countries.map((c) => ({
    value: c.isoCode,
    label: c.countryName,
  }));
}
