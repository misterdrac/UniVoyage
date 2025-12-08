import { useMemo, useState, useEffect } from 'react';
import { Globe, Languages, MapPin, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { LANGUAGES, TRAVEL_INTERESTS, COUNTRIES } from '@/lib/constants';
import type { User } from '@/types/user';
import { toast } from 'sonner';
import { TravelSection } from './TravelSection';
import type { Option } from '@/components/ui/autocomplete';

interface TravelInformationCardProps {
  user: User;
  isEditing: boolean;
  isSaving: boolean;
  hobbies: string[];
  languages: string[];
  visited: string[];
  onEdit: () => void;
  onSave: (data: { hobbies: string[]; languages: string[]; visited: string[] }) => Promise<void>;
  onHobbiesChange: (value: string[]) => void;
  onLanguagesChange: (value: string[]) => void;
  onVisitedChange: (value: string[]) => void;
}

type SectionType = 'languages' | 'hobbies' | 'countries';

const SECTION_CONFIG = {
  languages: {
    title: 'Languages Spoken',
    icon: Languages,
    iconColorVar: '--travel-lang-icon',
    iconBgVar: '--travel-lang-icon-bg',
    buttonColorVar: '--travel-lang-button',
    buttonHoverVar: '--travel-lang-button-hover',
    badgeBgVar: '--travel-lang-badge-bg',
    badgeTextVar: '--travel-lang-badge-text',
    badgeBorderVar: '--travel-lang-badge-border',
    borderVar: '--travel-lang-border',
    bgFromVar: '--travel-lang-bg-from',
    bgViaVar: '--travel-lang-bg-via',
    bgToVar: '--travel-lang-bg-to',
    placeholder: 'Search and add a language...',
    emptyMessage: 'No languages found',
    getLabel: (value: string) => LANGUAGES.find((l) => l.value === value)?.label || value,
  },
  hobbies: {
    title: 'Hobbies & Interests',
    icon: Sparkles,
    iconColorVar: '--travel-hobby-icon',
    iconBgVar: '--travel-hobby-icon-bg',
    buttonColorVar: '--travel-hobby-button',
    buttonHoverVar: '--travel-hobby-button-hover',
    badgeBgVar: '--travel-hobby-badge-bg',
    badgeTextVar: '--travel-hobby-badge-text',
    badgeBorderVar: '--travel-hobby-badge-border',
    borderVar: '--travel-hobby-border',
    bgFromVar: '--travel-hobby-bg-from',
    bgViaVar: '--travel-hobby-bg-via',
    bgToVar: '--travel-hobby-bg-to',
    placeholder: 'Search and add an interest...',
    emptyMessage: 'No interests found',
    getLabel: (value: string) => TRAVEL_INTERESTS.find((h) => h.value === value)?.label || value,
  },
  countries: {
    title: 'Countries Visited',
    icon: MapPin,
    iconColorVar: '--travel-country-icon',
    iconBgVar: '--travel-country-icon-bg',
    buttonColorVar: '--travel-country-button',
    buttonHoverVar: '--travel-country-button-hover',
    badgeBgVar: '--travel-country-badge-bg',
    badgeTextVar: '--travel-country-badge-text',
    badgeBorderVar: '--travel-country-badge-border',
    borderVar: '--travel-country-border',
    bgFromVar: '--travel-country-bg-from',
    bgViaVar: '--travel-country-bg-via',
    bgToVar: '--travel-country-bg-to',
    placeholder: 'Search and add a country...',
    emptyMessage: 'No countries found',
    getLabel: (value: string) => COUNTRIES.find((c) => c.value === value)?.label || value,
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
  onSave,
  onHobbiesChange,
  onLanguagesChange,
  onVisitedChange,
}: TravelInformationCardProps) => {
  const languageOptions = useMemo(
    () => LANGUAGES.map((lang) => ({ value: lang.value, label: lang.label })),
    []
  );

  const hobbyOptions = useMemo(
    () => TRAVEL_INTERESTS.map((interest) => ({ value: interest.value, label: interest.label })),
    []
  );

  const countryOptions = useMemo(
    () => COUNTRIES.map((country) => ({ value: country.value, label: country.label })),
    []
  );

  const [activeInput, setActiveInput] = useState<SectionType | null>(null);
  const [tempLanguages, setTempLanguages] = useState<string[]>(languages);
  const [tempHobbies, setTempHobbies] = useState<string[]>(hobbies);
  const [tempVisited, setTempVisited] = useState<string[]>(visited);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(undefined);

  useEffect(() => {
    if (isEditing) {
      setTempLanguages(languages);
      setTempHobbies(hobbies);
      setTempVisited(visited);
      setActiveInput(null);
    }
  }, [isEditing, languages, hobbies, visited]);

  const createAddHandler = (section: SectionType) => (option: Option) => {
    const config = SECTION_CONFIG[section];
    const tempState = section === 'languages' ? tempLanguages : section === 'hobbies' ? tempHobbies : tempVisited;
    const setTempState = section === 'languages' ? setTempLanguages : section === 'hobbies' ? setTempHobbies : setTempVisited;

    if (!tempState.includes(option.value)) {
      setTempState([...tempState, option.value]);
      toast.success(`Added ${config.getLabel(option.value)}`);
    }
    setSelectedOption(undefined);
  };

  const createRemoveHandler = (section: SectionType) => (value: string) => {
    const config = SECTION_CONFIG[section];
    const tempState = section === 'languages' ? tempLanguages : section === 'hobbies' ? tempHobbies : tempVisited;
    const setTempState = section === 'languages' ? setTempLanguages : section === 'hobbies' ? setTempHobbies : setTempVisited;

    setTempState(tempState.filter(item => item !== value));
    toast.info(`Removed ${config.getLabel(value)}`);
  };

  const handleSaveSection = async (section: SectionType) => {
    if (section === 'languages') {
      onLanguagesChange(tempLanguages);
    } else if (section === 'hobbies') {
      onHobbiesChange(tempHobbies);
    } else if (section === 'countries') {
      onVisitedChange(tempVisited);
    }

    await onSave({
      hobbies: section === 'hobbies' ? tempHobbies : hobbies,
      languages: section === 'languages' ? tempLanguages : languages,
      visited: section === 'countries' ? tempVisited : visited,
    });

    setActiveInput(null);
    setSelectedOption(undefined);
  };

  const handleCancelSection = (section: SectionType) => {
    if (section === 'languages') {
      setTempLanguages(languages);
    } else if (section === 'hobbies') {
      setTempHobbies(hobbies);
    } else if (section === 'countries') {
      setTempVisited(visited);
    }

    const sectionNames = {
      languages: 'Languages',
      hobbies: 'Hobbies & Interests',
      countries: 'Countries Visited',
    };
    toast.info(`Canceled changes to ${sectionNames[section]}`);

    setActiveInput(null);
    setSelectedOption(undefined);
  };

  const getDisplayItems = (section: SectionType) => {
    if (section === 'languages') {
      return (user.languages || []).map((lang) => ({
        value: lang.langCode,
        label: LANGUAGES.find((l) => l.value === lang.langCode)?.label || lang.langName || lang.langCode,
      }));
    } else if (section === 'hobbies') {
      return (user.hobbies || []).map((hobby) => ({
        value: String(hobby.id),
        label: TRAVEL_INTERESTS.find((h) => Number(h.value) === hobby.id)?.label || hobby.hobbyName || `Hobby ${hobby.id}`,
      }));
    } else {
      return (user.visitedCountries || []).map((vc) => {
        const country = vc.isoCode ? COUNTRIES.find((c) => c.value === vc.isoCode) : undefined;
        return {
          value: vc.isoCode || '',
          label: country?.label || vc.countryName || vc.isoCode || 'Unknown',
        };
      });
    }
  };

  const getTempItems = (section: SectionType) => {
    return section === 'languages' ? tempLanguages : section === 'hobbies' ? tempHobbies : tempVisited;
  };

  const getOptions = (section: SectionType) => {
    return section === 'languages' ? languageOptions : section === 'hobbies' ? hobbyOptions : countryOptions;
  };

  return (
    <Card className="mb-6 overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl bg-linear-to-br from-background to-muted/20">
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
              <CardDescription className="mt-1 text-sm">Your travel preferences and experiences</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* todo possible improvement? */}
            <TravelSection
              sectionType="languages"
              title={SECTION_CONFIG.languages.title}
              icon={SECTION_CONFIG.languages.icon}
              iconColorVar={SECTION_CONFIG.languages.iconColorVar}
              iconBgVar={SECTION_CONFIG.languages.iconBgVar}
              buttonColorVar={SECTION_CONFIG.languages.buttonColorVar}
              buttonHoverVar={SECTION_CONFIG.languages.buttonHoverVar}
              badgeBgVar={SECTION_CONFIG.languages.badgeBgVar}
              badgeTextVar={SECTION_CONFIG.languages.badgeTextVar}
              badgeBorderVar={SECTION_CONFIG.languages.badgeBorderVar}
              borderVar={SECTION_CONFIG.languages.borderVar}
              bgFromVar={SECTION_CONFIG.languages.bgFromVar}
              bgViaVar={SECTION_CONFIG.languages.bgViaVar}
              bgToVar={SECTION_CONFIG.languages.bgToVar}
              isEditing={isEditing}
              isSaving={isSaving}
              activeInput={activeInput}
              options={getOptions('languages')}
              tempItems={getTempItems('languages')}
              displayItems={getDisplayItems('languages')}
              selectedOption={selectedOption}
              onEdit={onEdit}
              onAdd={createAddHandler('languages')}
              onRemove={createRemoveHandler('languages')}
              onSave={() => handleSaveSection('languages')}
              onCancel={() => handleCancelSection('languages')}
              onSetActiveInput={setActiveInput}
              onSetSelectedOption={setSelectedOption}
              placeholder={SECTION_CONFIG.languages.placeholder}
              emptyMessage={SECTION_CONFIG.languages.emptyMessage}
              getItemLabel={SECTION_CONFIG.languages.getLabel}
            />

            <TravelSection
              sectionType="hobbies"
              title={SECTION_CONFIG.hobbies.title}
              icon={SECTION_CONFIG.hobbies.icon}
              iconColorVar={SECTION_CONFIG.hobbies.iconColorVar}
              iconBgVar={SECTION_CONFIG.hobbies.iconBgVar}
              buttonColorVar={SECTION_CONFIG.hobbies.buttonColorVar}
              buttonHoverVar={SECTION_CONFIG.hobbies.buttonHoverVar}
              badgeBgVar={SECTION_CONFIG.hobbies.badgeBgVar}
              badgeTextVar={SECTION_CONFIG.hobbies.badgeTextVar}
              badgeBorderVar={SECTION_CONFIG.hobbies.badgeBorderVar}
              borderVar={SECTION_CONFIG.hobbies.borderVar}
              bgFromVar={SECTION_CONFIG.hobbies.bgFromVar}
              bgViaVar={SECTION_CONFIG.hobbies.bgViaVar}
              bgToVar={SECTION_CONFIG.hobbies.bgToVar}
              isEditing={isEditing}
              isSaving={isSaving}
              activeInput={activeInput}
              options={getOptions('hobbies')}
              tempItems={getTempItems('hobbies')}
              displayItems={getDisplayItems('hobbies')}
              selectedOption={selectedOption}
              onEdit={onEdit}
              onAdd={createAddHandler('hobbies')}
              onRemove={createRemoveHandler('hobbies')}
              onSave={() => handleSaveSection('hobbies')}
              onCancel={() => handleCancelSection('hobbies')}
              onSetActiveInput={setActiveInput}
              onSetSelectedOption={setSelectedOption}
              placeholder={SECTION_CONFIG.hobbies.placeholder}
              emptyMessage={SECTION_CONFIG.hobbies.emptyMessage}
              getItemLabel={SECTION_CONFIG.hobbies.getLabel}
            />
          </div>

          <TravelSection
            sectionType="countries"
            title={SECTION_CONFIG.countries.title}
            icon={SECTION_CONFIG.countries.icon}
            iconColorVar={SECTION_CONFIG.countries.iconColorVar}
            iconBgVar={SECTION_CONFIG.countries.iconBgVar}
            buttonColorVar={SECTION_CONFIG.countries.buttonColorVar}
            buttonHoverVar={SECTION_CONFIG.countries.buttonHoverVar}
            badgeBgVar={SECTION_CONFIG.countries.badgeBgVar}
            badgeTextVar={SECTION_CONFIG.countries.badgeTextVar}
            badgeBorderVar={SECTION_CONFIG.countries.badgeBorderVar}
            borderVar={SECTION_CONFIG.countries.borderVar}
            bgFromVar={SECTION_CONFIG.countries.bgFromVar}
            bgViaVar={SECTION_CONFIG.countries.bgViaVar}
            bgToVar={SECTION_CONFIG.countries.bgToVar}
            isEditing={isEditing}
            isSaving={isSaving}
            activeInput={activeInput}
            options={getOptions('countries')}
            tempItems={getTempItems('countries')}
            displayItems={getDisplayItems('countries')}
            selectedOption={selectedOption}
            onEdit={onEdit}
            onAdd={createAddHandler('countries')}
            onRemove={createRemoveHandler('countries')}
            onSave={() => handleSaveSection('countries')}
            onCancel={() => handleCancelSection('countries')}
            onSetActiveInput={setActiveInput}
            onSetSelectedOption={setSelectedOption}
            placeholder={SECTION_CONFIG.countries.placeholder}
            emptyMessage={SECTION_CONFIG.countries.emptyMessage}
            getItemLabel={SECTION_CONFIG.countries.getLabel}
          />
        </div>
      </CardContent>
    </Card>
  );
};
