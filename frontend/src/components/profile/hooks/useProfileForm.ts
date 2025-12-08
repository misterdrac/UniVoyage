import { useState, useEffect, useCallback } from 'react';
import { COUNTRIES } from '@/lib/constants';
import type { Option } from '@/components/ui/autocomplete';
import type { User } from '@/types/user';

interface UseProfileFormProps {
  user: User | null;
  isEditingProfile: boolean;
  isEditingInterests: boolean;
}

export const useProfileForm = ({ user, isEditingProfile, isEditingInterests }: UseProfileFormProps) => {
  // Form state for profile
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [country, setCountry] = useState<Option | undefined>(undefined);

  // Form state for interests
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setCountry(
        user.countryOfOrigin ? COUNTRIES.find(c => c.value === user.countryOfOrigin.isoCode) : undefined
      );
      setHobbies(user.hobbies?.map(h => h.id.toString()) || []);
      setLanguages(user.languages?.map(l => l.langCode) || []);
      setVisited(
        user.visitedCountries?.map(vc => vc.isoCode).filter((code): code is string => Boolean(code)) || []
      );
    }
  }, [user]);

  // Reset profile form when editing starts
  useEffect(() => {
    if (user && isEditingProfile) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setCountry(
        user.countryOfOrigin ? COUNTRIES.find(c => c.value === user.countryOfOrigin.isoCode) : undefined
      );
    }
  }, [user, isEditingProfile]);

  // Reset interests form when editing starts
  useEffect(() => {
    if (user && isEditingInterests) {
      setHobbies(user.hobbies?.map(h => h.id.toString()) || []);
      setLanguages(user.languages?.map(l => l.langCode) || []);
      setVisited(
        user.visitedCountries?.map(vc => vc.isoCode).filter((code): code is string => Boolean(code)) || []
      );
    }
  }, [user, isEditingInterests]);

  const resetProfileForm = useCallback(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setCountry(
        user.countryOfOrigin ? COUNTRIES.find(c => c.value === user.countryOfOrigin.isoCode) : undefined
      );
    }
  }, [user]);

  const resetInterestsForm = useCallback(() => {
    if (user) {
      setHobbies(user.hobbies?.map(h => h.id.toString()) || []);
      setLanguages(user.languages?.map(l => l.langCode) || []);
      setVisited(
        user.visitedCountries?.map(vc => vc.isoCode).filter((code): code is string => Boolean(code)) || []
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

