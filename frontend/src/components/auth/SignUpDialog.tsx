import React, { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrength, getPasswordStrength } from "@/components/ui/password-strength"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/services/api"
import { toast } from "sonner"
import { VALIDATION } from "@/lib/constants"

interface SignUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginClick?: () => void
}

export function SignUpDialog({ open, onOpenChange, onLoginClick }: SignUpDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowPasswordError(true)
    setError("")
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    setIsLoading(true)
    
    const result = await signup(email, password)
    
    if (result.success) {
      toast.success("Account created successfully! Welcome to UniVoyage!")
      onOpenChange(false)
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setShowPasswordError(false)
    } else {
      setError(result.error || "Sign up failed")
      toast.error(result.error || "Sign up failed")
    }
    
    setIsLoading(false)
  }

  const handleGoogleSignUp = async () => {
    try {
      await apiService.googleAuth();
    } catch (error) {
      toast.error("Google sign up is not available in mock mode");
    }
  }


  // Check if form is valid
  const passwordsMatch = password === confirmPassword
  const passwordStrength = getPasswordStrength(password)
  const isFormValid = 
    email.trim() !== "" && 
    password.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH && 
    confirmPassword.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH &&
    VALIDATION.EMAIL_REGEX.test(email) && 
    passwordStrength.isStrong

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setShowPasswordError(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Create Account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
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
            <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
              Password
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
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (showPasswordError) {
                    setShowPasswordError(false)
                  }
                }}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}

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
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignUp}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => {
                onOpenChange(false)
                onLoginClick?.()
              }}
            >
              Sign in
            </button>
          </div>
        </form>
      </DialogContent>
      
    </Dialog>
  )
}
