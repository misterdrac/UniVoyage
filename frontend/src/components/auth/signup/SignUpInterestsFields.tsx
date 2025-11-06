import { ChipSelect } from "@/components/ui/chip-select";
import { TRAVEL_INTERESTS, LANGUAGES } from "@/lib/constants";

interface SignUpInterestsFieldsProps {
  hobbies: string[];
  setHobbies: (value: string[]) => void;
  languages: string[];
  setLanguages: (value: string[]) => void;
}

export const SignUpInterestsFields = ({
  hobbies,
  setHobbies,
  languages,
  setLanguages,
}: SignUpInterestsFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Interests/Hobbies */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Interests (e.g., history, hiking)
        </label>
        <ChipSelect
          options={TRAVEL_INTERESTS}
          value={hobbies}
          onChange={setHobbies}
          placeholder="Add things you like"
        />
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Languages
        </label>
        <ChipSelect
          options={LANGUAGES}
          value={languages}
          onChange={setLanguages}
          placeholder="Add languages you know"
        />
      </div>
    </div>
  );
};

