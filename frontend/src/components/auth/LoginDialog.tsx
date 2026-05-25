import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  MapPin,
  Sparkles,
  Plane,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { authToast } from "@/lib/auth/authToast";
import { VALIDATION } from "@/lib/constants";
import { BrandGoogle } from "@mynaui/icons-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import univoyageIcon from "@/assets/univoyage_icon.svg";
import { EmailOtpSignInForm } from "./EmailOtpSignInForm";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUpClick?: () => void;
}

export function LoginDialog({
  open,
  onOpenChange,
  onSignUpClick,
}: LoginDialogProps) {
  const [mode, setMode] = useState<"password" | "email-otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, beginOAuth } = useAuth();

  const handleDialogOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setMode("password");
      setShowPassword(false);
      setError("");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      authToast.success("Welcome back! You've been logged in successfully.");
      handleDialogOpenChange(false);
      setEmail("");
      setPassword("");
    } else {
      setError(result.error || "Login failed");
      authToast.error(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  // Check if form is valid
  const isFormValid =
    email.trim() !== "" &&
    password.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH &&
    VALIDATION.EMAIL_REGEX.test(email);

  const handleOAuthSignIn = (provider: "google" | "github" | "linkedin") => {
    beginOAuth(provider);
  };

  const handleSignUpTransition = () => {
    handleDialogOpenChange(false);
    onSignUpClick?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[4rem]">
        <DialogHeader className="space-y-4">
          {/* Logo with decorative icons */}
          <div className="flex flex-col items-center mb-2 relative">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={univoyageIcon}
                alt="UniVoyage Logo"
                className="w-14 h-14"
              />
              <DialogTitle className="text-3xl font-bold">
                UniVoyage
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Sign in to your UniVoyage account to access your trips and travel
              planning features
            </DialogDescription>
            {/* Decorative plane icon */}
            <div className="absolute -right-4 top-0 opacity-20 rotate-12">
              <Plane className="w-16 h-16 text-primary" />
            </div>
            {/* Decorative globe icon */}
            <div className="absolute -left-4 top-8 opacity-15 -rotate-12">
              <Globe className="w-14 h-14 text-primary" />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              {mode === "email-otp" ? "Sign in with email" : "Welcome back!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "email-otp"
                ? "Use a 6-digit code to continue without a password"
                : "Sign in to continue planning your next adventure"}
            </p>
          </div>

          {/* Features */}
          <div className="flex items-center justify-center gap-6 pt-2 pb-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Plan Trips</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Itineraries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-primary" />
              <span>Travel Smart</span>
            </div>
          </div>
        </DialogHeader>

        {mode === "email-otp" ? (
          <EmailOtpSignInForm
            initialEmail={email}
            onEmailChange={setEmail}
            onSuccess={() => {
              handleDialogOpenChange(false);
              setEmail("");
              setPassword("");
            }}
            onPasswordModeClick={() => setMode("password")}
            onSignUpClick={handleSignUpTransition}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <a
                  href="/auth/reset-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="text-center text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setError("");
                setMode("email-otp");
              }}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email me a sign-in code
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

            {/* OAuth Sign In */}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                className="w-full"
              >
                <BrandGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                className="w-full"
              >
                <FaGithub className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("linkedin")}
                className="w-full"
              >
                <FaLinkedin className="mr-2 h-4 w-4" />
                Continue with LinkedIn
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={handleSignUpTransition}
              >
                Sign up
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
