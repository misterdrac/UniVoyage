import { useState, useEffect, useCallback } from "react";
import type { Option } from "@/components/ui/autocomplete";
import type { User } from "@/types/user";

function findCountryOption(
  iso: string | undefined,
  countryOptions: Option[],
): Option | undefined {
  if (!iso) return undefined;
  return countryOptions.find((c) => c.value === iso);
}

interface UseProfileFormProps {
  user: User | null;
  isEditingProfile: boolean;
  isEditingInterests: boolean;
  /** Country picker options from reference API */
  countryOptions: Option[];
}

export const useProfileForm = ({
  user,
  isEditingProfile,
  isEditingInterests,
  countryOptions,
}: UseProfileFormProps) => {
  // Form state for profile
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [country, setCountry] = useState<Option | undefined>(undefined);
  const [profileImagePath, setProfileImagePath] = useState<string | undefined>(
    undefined,
  );

  // Form state for interests
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setSurname(user.surname || "");
      setCountry(
        findCountryOption(user.countryOfOrigin?.isoCode, countryOptions),
      );
      setProfileImagePath(user.profileImagePath);
      setHobbies(user.hobbies?.map((h) => h.id.toString()) || []);
      setLanguages(user.languages?.map((l) => l.langCode) || []);
      setVisited(
        user.visitedCountries
          ?.map((vc) => vc.isoCode)
          .filter((code): code is string => Boolean(code)) || [],
      );
    }
  }, [user, countryOptions]);

  // Reset profile form when editing starts
  useEffect(() => {
    if (user && isEditingProfile) {
      setName(user.name || "");
      setSurname(user.surname || "");
      setCountry(
        findCountryOption(user.countryOfOrigin?.isoCode, countryOptions),
      );
      setProfileImagePath(user.profileImagePath);
    }
  }, [user, isEditingProfile, countryOptions]);

  // Reset interests form when editing starts
  useEffect(() => {
    if (user && isEditingInterests) {
      setHobbies(user.hobbies?.map((h) => h.id.toString()) || []);
      setLanguages(user.languages?.map((l) => l.langCode) || []);
      setVisited(
        user.visitedCountries
          ?.map((vc) => vc.isoCode)
          .filter((code): code is string => Boolean(code)) || [],
      );
    }
  }, [user, isEditingInterests]);

  const resetProfileForm = useCallback(() => {
    if (user) {
      setName(user.name || "");
      setSurname(user.surname || "");
      setCountry(
        findCountryOption(user.countryOfOrigin?.isoCode, countryOptions),
      );
      setProfileImagePath(user.profileImagePath);
    }
  }, [user, countryOptions]);

  const resetInterestsForm = useCallback(() => {
    if (user) {
      setHobbies(user.hobbies?.map((h) => h.id.toString()) || []);
      setLanguages(user.languages?.map((l) => l.langCode) || []);
      setVisited(
        user.visitedCountries
          ?.map((vc) => vc.isoCode)
          .filter((code): code is string => Boolean(code)) || [],
      );
    }
  }, [user]);

  return {
    // Profile form state
    name,
    setName,
    surname,
    setSurname,
    country,
    setCountry,
    profileImagePath,
    setProfileImagePath,
    resetProfileForm,
    // Interests form state
    hobbies,
    setHobbies,
    languages,
    setLanguages,
    visited,
    setVisited,
    resetInterestsForm,
  };
};
