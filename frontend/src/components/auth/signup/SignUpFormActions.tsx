import { Button } from "@/components/ui/button";
import { BrandGoogle } from "@mynaui/icons-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

interface SignUpFormActionsProps {
  isLoading: boolean;
  isFormValid: boolean;
  onGoogleSignUp: () => void;
  onGitHubSignUp: () => void;
  onLinkedInSignUp: () => void;
  onLoginClick: () => void;
}

export const SignUpFormActions = ({
  isLoading,
  isFormValid,
  onGoogleSignUp,
  onGitHubSignUp,
  onLinkedInSignUp,
  onLoginClick,
}: SignUpFormActionsProps) => {
  return (
    <>
      {/* Sign Up Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* OAuth Sign Up */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleSignUp}
          className="w-full"
        >
          <BrandGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onGitHubSignUp}
          className="w-full"
        >
          <FaGithub className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onLinkedInSignUp}
          className="w-full"
        >
          <FaLinkedin className="mr-2 h-4 w-4" />
          Continue with LinkedIn
        </Button>
      </div>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          type="button"
          className="text-primary hover:underline font-medium"
          onClick={onLoginClick}
        >
          Sign in
        </button>
      </div>
    </>
  );
};
