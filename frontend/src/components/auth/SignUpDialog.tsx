import { useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { SignUpBasicFields, SignUpInterestsFields, SignUpPasswordFields, SignUpFormActions, useSignUpForm } from "./signup";

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

export function SignUpDialog({ open, onOpenChange, onLoginClick }: SignUpDialogProps) {
  const { signup } = useAuth();

  const handleSuccess = useCallback(() => {
    toast.success("Account created successfully! Welcome to UniVoyage!");
    onOpenChange(false);
  }, [onOpenChange]);

  const {
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
    handleSubmit,
    resetForm,
  } = useSignUpForm({ onSuccess: handleSuccess, signup });

  const handleGoogleSignUp = useCallback(async () => {
    try {
      await apiService.googleAuth();
    } catch (error) {
      toast.error("Google sign up is not available in mock mode");
    }
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  }, [onOpenChange, resetForm]);

  const handleLoginClick = useCallback(() => {
    onOpenChange(false);
    onLoginClick?.();
  }, [onOpenChange, onLoginClick]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    await handleSubmit(e);
  }, [handleSubmit, passwordsMatch]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Create Account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <SignUpBasicFields
            firstName={firstName}
            setFirstName={setFirstName}
            surname={surname}
            setSurname={setSurname}
            email={email}
            setEmail={setEmail}
            country={country}
            setCountry={setCountry}
          />

          <SignUpInterestsFields
            hobbies={hobbies}
            setHobbies={setHobbies}
            languages={languages}
            setLanguages={setLanguages}
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
            onLoginClick={handleLoginClick}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
