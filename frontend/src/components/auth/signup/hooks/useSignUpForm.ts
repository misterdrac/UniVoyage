import { useState, useCallback, useMemo } from "react";
import { type Option } from "@/components/ui/autocomplete";
import { VALIDATION } from "@/lib/constants";
import { getPasswordStrength } from "@/components/ui/password-strength";

interface UseSignUpFormProps {
  onSuccess: () => void;
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    surname?: string;
    hobbies?: string[];
    languages?: string[];
    country?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const useSignUpForm = ({ onSuccess, signup }: UseSignUpFormProps) => {
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [country, setCountry] = useState<Option | undefined>(undefined);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  
  const isFormValid = useMemo(() => 
    firstName.trim().length >= 2 &&
    email.trim() !== "" && 
    country !== undefined &&
    password.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH && 
    confirmPassword.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH &&
    VALIDATION.EMAIL_REGEX.test(email) && 
    passwordStrength.isStrong,
    [firstName, email, country, password, confirmPassword, passwordStrength.isStrong]
  );

  const resetForm = useCallback(() => {
    setFirstName("");
    setSurname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setHobbies([]);
    setLanguages([]);
    setCountry(undefined);
    setShowPasswordError(false);
    setError("");
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPasswordError(true);
    setError("");
    
    if (password !== confirmPassword) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signup({
        email,
        password,
        firstName,
        surname,
        hobbies,
        languages,
        country: country?.value
      });
      
      if (result.success) {
        resetForm();
        onSuccess();
      } else {
        setError(result.error || "Sign up failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, firstName, surname, hobbies, languages, country, confirmPassword, signup, resetForm, onSuccess]);

  return {
    // Form state
    firstName,
    setFirstName,
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
    showPasswordError,
    setShowPasswordError,
    error,
    isLoading,
    isFormValid,
    passwordsMatch,
    // Actions
    handleSubmit,
    resetForm,
  };
};

