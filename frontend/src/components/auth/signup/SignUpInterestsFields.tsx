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

  // mister_drac
  // helper: map label -> value (id)
    const mapLabelsToValues = (selected: string[], options: {value: string, label: string}[]) => {
      return selected
        .map(s => {
          // if value is already a value, return it
          if (options.some(o => o.value === s)) return s;

          // if it's a label, find the corresponding value
          const found = options.find(o => o.label === s);
          return found?.value;
        })
        .filter((v): v is string => !!v);
    };

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

