import { useState, useCallback, useMemo } from "react";
import { type Option } from "@/components/ui/autocomplete";
import { VALIDATION } from "@/lib/constants";
import { getPasswordStrength } from "@/components/ui/password-strength";
import { toast } from "sonner";

interface UseSignUpFormProps {
  onSuccess: () => void;

  // Matches backend RegisterRequestDto structure
  signup: (data: {
    name: string;
    surname?: string;
    email: string;
    password: string;
    countryCode: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
}

export const useSignUpForm = ({ onSuccess, signup }: UseSignUpFormProps) => {
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Form state fields
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI receives strings (ids or names) that need conversion
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [country, setCountry] = useState<Option | undefined>(undefined);

  const [visitedCountries, setVisitedCountries] = useState<string[]>([]); // Optional field

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch = useMemo(
    () => password === confirmPassword,
    [password, confirmPassword]
  );
  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const isFormValid = useMemo(
    () =>
      name.trim().length >= 2 &&
      email.trim() !== "" &&
      country !== undefined &&
      password.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH &&
      confirmPassword.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH &&
      VALIDATION.EMAIL_REGEX.test(email) &&
      passwordStrength.isStrong,
    [
      name,
      email,
      country,
      password,
      confirmPassword,
      passwordStrength.isStrong,
    ]
  );

  const resetForm = useCallback(() => {
    setName("");
    setSurname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setHobbies([]);
    setLanguages([]);
    setCountry(undefined);
    setVisitedCountries([]);
    setShowPasswordError(false);
    setError("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPasswordError(true);
      setError("");

      if (password !== confirmPassword) {
        return;
      }

      if (!country?.value) {
        setError("Country is required");
        return;
      }

      setIsLoading(true);

      try {
        const hobbyIds = (hobbies ?? [])
          .map(h => {
            const n = Number(h);
            return Number.isFinite(n) ? n : null;
          })
          .filter((n): n is number => n !== null);

        const languageCodes = languages ?? [];

        const payload = {
          name,
          surname,
          email,
          countryCode: country.value,
          hobbyIds,
          languageCodes,
          password,
          visitedCountryCodes: visitedCountries ?? [], // can be empty
        };

        const result = await signup(payload);

        if (result.success) {
          resetForm();
          onSuccess();
        } else {
          const errorMessage = result.error || "Sign up failed";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      email,
      password,
      name,
      surname,
      hobbies,
      languages,
      country,
      visitedCountries,
      confirmPassword,
      signup,
      resetForm,
      onSuccess,
    ]
  );

  return {
    // Form state
    name,
    setName,
    surname,
    setSurname,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    hobbies,
    setHobbies,
    languages,
    setLanguages,
    country,
    setCountry,
    visitedCountries,
    setVisitedCountries,
    showPasswordError,
    setShowPasswordError,
    isLoading,
    isFormValid,
    passwordsMatch,
    // Actions
    handleSubmit,
    resetForm,
  };
};
