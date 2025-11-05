import { useState, useEffect, useCallback } from 'react';
import { COUNTRIES } from '@/lib/constants';
import type { Option } from '@/components/ui/autocomplete';
import type { User } from '@/data/mockUsers';

interface UseProfileFormProps {
  user: User | null;
  isEditingProfile: boolean;
  isEditingInterests: boolean;
}

export const useProfileForm = ({ user, isEditingProfile, isEditingInterests }: UseProfileFormProps) => {
  // Form state for profile
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [country, setCountry] = useState<Option | undefined>(undefined);

  // Form state for interests
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setSurname(user.surname || '');
      setCountry(user.country ? COUNTRIES.find(c => c.value === user.country) : undefined);
      setHobbies(user.hobbies || []);
      setLanguages(user.languages || []);
      setVisited(user.visited || []);
    }
  }, [user]);

  // Initialize profile form data when editing starts
  useEffect(() => {
    if (user && isEditingProfile) {
      setFirstName(user.firstName || '');
      setSurname(user.surname || '');
      setCountry(user.country ? COUNTRIES.find(c => c.value === user.country) : undefined);
    }
  }, [user, isEditingProfile]);

  // Initialize interests form data when editing starts
  useEffect(() => {
    if (user && isEditingInterests) {
      setHobbies(user.hobbies || []);
      setLanguages(user.languages || []);
      setVisited(user.visited || []);
    }
  }, [user, isEditingInterests]);

  const resetProfileForm = useCallback(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setSurname(user.surname || '');
      setCountry(user.country ? COUNTRIES.find(c => c.value === user.country) : undefined);
    }
  }, [user]);

  const resetInterestsForm = useCallback(() => {
    if (user) {
      setHobbies(user.hobbies || []);
      setLanguages(user.languages || []);
      setVisited(user.visited || []);
    }
  }, [user]);

  return {
    // Profile form state
    firstName,
    setFirstName,
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

