import { useMemo, useState, useEffect } from "react";
import { Globe, Languages, MapPin, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import type { User } from "@/types/user";
import { toast } from "sonner";
import { TravelSection } from "./TravelSection";
import type { Option } from "@/components/ui/autocomplete";
import type { TravelSectionConfig } from "./TravelSection";
import { formatHobbyLabel } from "@/lib/referenceOptions";

interface TravelInformationCardProps {
  user: User;
  isEditing: boolean;
  isSaving: boolean;
  hobbies: string[];
  languages: string[];
  visited: string[];
  hobbyOptions: Option[];
  languageOptions: Option[];
  countryOptions: Option[];
  referenceLoading?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: {
    hobbies: string[];
    languages: string[];
    visited: string[];
  }) => Promise<void>;
  onHobbiesChange: (value: string[]) => void;
  onLanguagesChange: (value: string[]) => void;
  onVisitedChange: (value: string[]) => void;
}

type SectionType = "languages" | "hobbies" | "countries";

const STYLE_BASE: Record<
  SectionType,
  Omit<TravelSectionConfig, "getLabel">
> = {
  languages: {
    title: "Languages Spoken",
    icon: Languages,
    iconColorVar: "--travel-lang-icon",
    iconBgVar: "--travel-lang-icon-bg",
    buttonColorVar: "--travel-lang-button",
    buttonHoverVar: "--travel-lang-button-hover",
    badgeBgVar: "--travel-lang-badge-bg",
    badgeTextVar: "--travel-lang-badge-text",
    badgeBorderVar: "--travel-lang-badge-border",
    borderVar: "--travel-lang-border",
    bgFromVar: "--travel-lang-bg-from",
    bgViaVar: "--travel-lang-bg-via",
    bgToVar: "--travel-lang-bg-to",
    placeholder: "Search and add a language...",
    emptyMessage: "No languages found",
  },
  hobbies: {
    title: "Hobbies & Interests",
    icon: Sparkles,
    iconColorVar: "--travel-hobby-icon",
    iconBgVar: "--travel-hobby-icon-bg",
    buttonColorVar: "--travel-hobby-button",
    buttonHoverVar: "--travel-hobby-button-hover",
    badgeBgVar: "--travel-hobby-badge-bg",
    badgeTextVar: "--travel-hobby-badge-text",
    badgeBorderVar: "--travel-hobby-badge-border",
    borderVar: "--travel-hobby-border",
    bgFromVar: "--travel-hobby-bg-from",
    bgViaVar: "--travel-hobby-bg-via",
    bgToVar: "--travel-hobby-bg-to",
    placeholder: "Search and add an interest...",
    emptyMessage: "No interests found",
  },
  countries: {
    title: "Countries Visited",
    icon: MapPin,
    iconColorVar: "--travel-country-icon",
    iconBgVar: "--travel-country-icon-bg",
    buttonColorVar: "--travel-country-button",
    buttonHoverVar: "--travel-country-button-hover",
    badgeBgVar: "--travel-country-badge-bg",
    badgeTextVar: "--travel-country-badge-text",
    badgeBorderVar: "--travel-country-badge-border",
    borderVar: "--travel-country-border",
    bgFromVar: "--travel-country-bg-from",
    bgViaVar: "--travel-country-bg-via",
    bgToVar: "--travel-country-bg-to",
    placeholder: "Search and add a country...",
    emptyMessage: "No countries found",
  },
};

export const TravelInformationCard = ({
  user,
  isEditing,
  isSaving,
  hobbies,
  languages,
  visited,
  onEdit,
  onCancel,
  onSave,
  onHobbiesChange,
  onLanguagesChange,
  onVisitedChange,
  hobbyOptions,
  languageOptions,
  countryOptions,
  referenceLoading = false,
}: TravelInformationCardProps) => {
  const langsConfig = useMemo((): TravelSectionConfig => {
    return {
      ...STYLE_BASE.languages,
      getLabel: (value: string) =>
        languageOptions.find((o) => o.value === value)?.label ?? value,
    };
  }, [languageOptions]);

  const hobbiesConfig = useMemo((): TravelSectionConfig => {
    return {
      ...STYLE_BASE.hobbies,
      getLabel: (value: string) =>
        hobbyOptions.find((o) => o.value === value)?.label ?? value,
    };
  }, [hobbyOptions]);

  const countriesConfig = useMemo((): TravelSectionConfig => {
    return {
      ...STYLE_BASE.countries,
      getLabel: (value: string) =>
        countryOptions.find((o) => o.value === value)?.label ?? value,
    };
  }, [countryOptions]);

  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const [tempLanguages, setTempLanguages] = useState<string[]>(languages);
  const [tempHobbies, setTempHobbies] = useState<string[]>(hobbies);
  const [tempVisited, setTempVisited] = useState<string[]>(visited);

  useEffect(() => {
    if (isEditing) {
      setTempLanguages(languages);
      setTempHobbies(hobbies);
      setTempVisited(visited);
    } else {
      setActiveSection(null);
    }
  }, [isEditing, languages, hobbies, visited]);

  const createAddHandler = (section: SectionType) => (option: Option) => {
    const config =
      section === "languages"
        ? langsConfig
        : section === "hobbies"
          ? hobbiesConfig
          : countriesConfig;
    const tempState =
      section === "languages"
        ? tempLanguages
        : section === "hobbies"
          ? tempHobbies
          : tempVisited;
    const setTempState =
      section === "languages"
        ? setTempLanguages
        : section === "hobbies"
          ? setTempHobbies
          : setTempVisited;

    if (!tempState.includes(option.value)) {
      setTempState([...tempState, option.value]);
      toast.success(`Added ${config.getLabel(option.value)}`);
    }
  };

  const createRemoveHandler = (section: SectionType) => (value: string) => {
    const config =
      section === "languages"
        ? langsConfig
        : section === "hobbies"
          ? hobbiesConfig
          : countriesConfig;
    const tempState =
      section === "languages"
        ? tempLanguages
        : section === "hobbies"
          ? tempHobbies
          : tempVisited;
    const setTempState =
      section === "languages"
        ? setTempLanguages
        : section === "hobbies"
          ? setTempHobbies
          : setTempVisited;

    setTempState(tempState.filter((item) => item !== value));
    toast.info(`Removed ${config.getLabel(value)}`);
  };

  const handleSaveSection = async (section: SectionType) => {
    if (section === "languages") {
      onLanguagesChange(tempLanguages);
    } else if (section === "hobbies") {
      onHobbiesChange(tempHobbies);
    } else if (section === "countries") {
      onVisitedChange(tempVisited);
    }

    await onSave({
      hobbies: section === "hobbies" ? tempHobbies : hobbies,
      languages: section === "languages" ? tempLanguages : languages,
      visited: section === "countries" ? tempVisited : visited,
    });

    setActiveSection(null);
  };

  const handleCancelSection = (section: SectionType) => {
    if (section === "languages") {
      setTempLanguages(languages);
    } else if (section === "hobbies") {
      setTempHobbies(hobbies);
    } else if (section === "countries") {
      setTempVisited(visited);
    }

    const sectionNames = {
      languages: "Languages",
      hobbies: "Hobbies & Interests",
      countries: "Countries Visited",
    };
    toast.info(`Canceled changes to ${sectionNames[section]}`);

    setActiveSection(null);
    onCancel();
  };

  const getDisplayItems = (section: SectionType) => {
    if (section === "languages") {
      return (user.languages || []).map((lang) => ({
        value: lang.langCode,
        label:
          languageOptions.find((o) => o.value === lang.langCode)?.label ||
          lang.langName ||
          lang.langCode,
      }));
    }
    if (section === "hobbies") {
      return (user.hobbies || []).map((hobby) => ({
        value: String(hobby.id),
        label: formatHobbyLabel({
          displayLabel: hobby.displayLabel ?? hobby.hobbyName,
          hobbyName: hobby.hobbyName,
          emoji: hobby.emoji ?? null,
        }),
      }));
    }
    return (user.visitedCountries || []).map((vc) => {
      const opt = vc.isoCode
        ? countryOptions.find((c) => c.value === vc.isoCode)
        : undefined;
      return {
        value: vc.isoCode || "",
        label: opt?.label || vc.countryName || vc.isoCode || "Unknown",
      };
    });
  };

  const getTempItems = (section: SectionType) => {
    return section === "languages"
      ? tempLanguages
      : section === "hobbies"
        ? tempHobbies
        : tempVisited;
  };

  const getOptions = (section: SectionType) => {
    return section === "languages"
      ? languageOptions
      : section === "hobbies"
        ? hobbyOptions
        : countryOptions;
  };

  const pickerDisabled = isSaving || referenceLoading;

  return (
    <Card className="mb-6 overflow-visible border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl bg-linear-to-br from-background to-muted/20">
      <CardHeader className="bg-linear-to-r from-primary/5 via-primary/3 to-transparent border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-sm">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                Travel Information
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Your travel preferences and experiences
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TravelSection
              config={langsConfig}
              isActive={activeSection === "languages"}
              isSaving={pickerDisabled}
              options={getOptions("languages")}
              tempItems={getTempItems("languages")}
              displayItems={getDisplayItems("languages")}
              onStartEdit={() => {
                setActiveSection("languages");
                onEdit();
              }}
              onAdd={createAddHandler("languages")}
              onRemove={createRemoveHandler("languages")}
              onSave={() => handleSaveSection("languages")}
              onCancel={() => handleCancelSection("languages")}
            />

            <TravelSection
              config={hobbiesConfig}
              isActive={activeSection === "hobbies"}
              isSaving={pickerDisabled}
              options={getOptions("hobbies")}
              tempItems={getTempItems("hobbies")}
              displayItems={getDisplayItems("hobbies")}
              onStartEdit={() => {
                setActiveSection("hobbies");
                onEdit();
              }}
              onAdd={createAddHandler("hobbies")}
              onRemove={createRemoveHandler("hobbies")}
              onSave={() => handleSaveSection("hobbies")}
              onCancel={() => handleCancelSection("hobbies")}
            />
          </div>

          <TravelSection
            config={countriesConfig}
            isActive={activeSection === "countries"}
            isSaving={pickerDisabled}
            options={getOptions("countries")}
            tempItems={getTempItems("countries")}
            displayItems={getDisplayItems("countries")}
            onStartEdit={() => {
              setActiveSection("countries");
              onEdit();
            }}
            onAdd={createAddHandler("countries")}
            onRemove={createRemoveHandler("countries")}
            onSave={() => handleSaveSection("countries")}
            onCancel={() => handleCancelSection("countries")}
          />
        </div>
      </CardContent>
    </Card>
  );
};
