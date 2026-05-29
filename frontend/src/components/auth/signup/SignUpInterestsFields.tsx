import { ChipSelect } from "@/components/ui/chip-select";
import type { Option } from "@/components/ui/autocomplete";

interface SignUpInterestsFieldsProps {
  hobbies: string[];
  setHobbies: (value: string[]) => void;
  languages: string[];
  setLanguages: (value: string[]) => void;
  hobbyOptions: Option[];
  languageOptions: Option[];
  referenceLoading?: boolean;
}

export const SignUpInterestsFields = ({
  hobbies,
  setHobbies,
  languages,
  setLanguages,
  hobbyOptions,
  languageOptions,
  referenceLoading = false,
}: SignUpInterestsFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Interests/Hobbies */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Interests (e.g., history, hiking)
        </label>
        <ChipSelect
          options={hobbyOptions}
          value={hobbies}
          onChange={setHobbies}
          placeholder="Add things you like"
          disabled={referenceLoading}
        />
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Languages</label>
        <ChipSelect
          options={languageOptions}
          value={languages}
          onChange={setLanguages}
          placeholder="Add languages you know"
          disabled={referenceLoading}
        />
      </div>
    </div>
  );
};
