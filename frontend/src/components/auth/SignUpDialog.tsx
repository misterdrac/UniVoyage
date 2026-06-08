import { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  SignUpBasicFields,
  SignUpInterestsFields,
  SignUpPasswordFields,
  SignUpFormActions,
  useSignUpForm,
} from "./signup";
import { useReferenceDictionaries } from "@/hooks/useReferenceDictionaries";
import {
  countriesToOptions,
  hobbiesToOptions,
  languagesToOptions,
} from "@/lib/referenceOptions";

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

export function SignUpDialog({
  open,
  onOpenChange,
  onLoginClick,
}: SignUpDialogProps) {
  const { signup, beginOAuth } = useAuth();

  const { data: reference, isLoading: referenceLoading } =
    useReferenceDictionaries();

  const countryOptions = useMemo(
    () => (reference?.countries ? countriesToOptions(reference.countries) : []),
    [reference?.countries],
  );
  const hobbyOptions = useMemo(
    () => (reference?.hobbies ? hobbiesToOptions(reference.hobbies) : []),
    [reference?.hobbies],
  );
  const languageOptions = useMemo(
    () => (reference?.languages ? languagesToOptions(reference.languages) : []),
    [reference?.languages],
  );

  const handleSuccess = useCallback(() => {
    toast.success("Account created successfully! Welcome to UniVoyage!");
    onOpenChange(false);
  }, [onOpenChange]);

  const {
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
    showPasswordError,
    setShowPasswordError,
    isLoading,
    isFormValid,
    passwordsMatch,
    handleSubmit,
    resetForm,
  } = useSignUpForm({ onSuccess: handleSuccess, signup });

  const handleOAuthSignUp = useCallback(
    (provider: "google" | "github" | "linkedin") => {
      beginOAuth(provider);
    },
    [beginOAuth],
  );

  const handleGoogleSignUp = useCallback(
    () => handleOAuthSignUp("google"),
    [handleOAuthSignUp],
  );

  const handleGitHubSignUp = useCallback(
    () => handleOAuthSignUp("github"),
    [handleOAuthSignUp],
  );

  const handleLinkedInSignUp = useCallback(
    () => handleOAuthSignUp("linkedin"),
    [handleOAuthSignUp],
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        resetForm();
      }
    },
    [onOpenChange, resetForm],
  );

  const handleLoginClick = useCallback(() => {
    onOpenChange(false);
    onLoginClick?.();
  }, [onOpenChange, onLoginClick]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!passwordsMatch) {
        setShowPasswordError(true);
        toast.error("Passwords do not match");
        return;
      }
      await handleSubmit(e);
    },
    [handleSubmit, passwordsMatch, setShowPasswordError],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-1.25rem)] max-w-4xl max-h-[min(92dvh,900px)] overflow-y-auto rounded-2xl p-4 sm:max-w-4xl sm:rounded-3xl sm:p-6 lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Create Account
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new UniVoyage account to start planning your student travel
            adventures
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <SignUpBasicFields
            name={name}
            setName={setName}
            surname={surname}
            setSurname={setSurname}
            email={email}
            setEmail={setEmail}
            country={country}
            setCountry={setCountry}
            countryOptions={countryOptions}
            referenceLoading={referenceLoading}
          />

          <SignUpInterestsFields
            hobbies={hobbies}
            setHobbies={setHobbies}
            languages={languages}
            setLanguages={setLanguages}
            hobbyOptions={hobbyOptions}
            languageOptions={languageOptions}
            referenceLoading={referenceLoading}
          />

          <SignUpPasswordFields
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPasswordError={showPasswordError}
            setShowPasswordError={setShowPasswordError}
          />

          <SignUpFormActions
            isLoading={isLoading}
            isFormValid={isFormValid}
            onGoogleSignUp={handleGoogleSignUp}
            onGitHubSignUp={handleGitHubSignUp}
            onLinkedInSignUp={handleLinkedInSignUp}
            onLoginClick={handleLoginClick}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
