import { useState, useMemo } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";

interface SignUpPasswordFieldsProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPasswordError: boolean;
  setShowPasswordError: (value: boolean) => void;
}

export const SignUpPasswordFields = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPasswordError,
  setShowPasswordError,
}: SignUpPasswordFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);

  return (
    <>
      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
          Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        <PasswordStrength password={password} />
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label htmlFor="signup-confirm-password" className="text-sm font-medium text-foreground">
          Confirm Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (showPasswordError) {
                setShowPasswordError(false);
              }
            }}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {showPasswordError && !passwordsMatch && (
          <p className="text-sm text-destructive">Passwords do not match</p>
        )}
      </div>
    </>
  );
};

