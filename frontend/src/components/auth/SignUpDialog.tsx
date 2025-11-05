import React, { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrength, getPasswordStrength } from "@/components/ui/password-strength"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChipSelect } from "@/components/ui/chip-select"
import { AutoComplete, type Option } from "@/components/ui/autocomplete"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/services/api"
import { toast } from "sonner"
import { VALIDATION, TRAVEL_INTERESTS, LANGUAGES, COUNTRIES } from "@/lib/constants"
import { BrandGoogle } from "@mynaui/icons-react";

interface SignUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginClick?: () => void
}

export function SignUpDialog({ open, onOpenChange, onLoginClick }: SignUpDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [hobbies, setHobbies] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [country, setCountry] = useState<Option | undefined>(undefined)
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
    
    const result = await signup({
      email,
      password,
      firstName,
      surname,
      hobbies,
      languages,
      country: country?.value
    })
    
    if (result.success) {
      toast.success("Account created successfully! Welcome to UniVoyage!")
      onOpenChange(false)
      setFirstName("")
      setSurname("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setHobbies([])
      setLanguages([])
      setCountry(undefined)
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
    firstName.trim().length >= 2 &&
    email.trim() !== "" && 
    country !== undefined &&
    password.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH && 
    confirmPassword.trim().length >= VALIDATION.MIN_PASSWORD_LENGTH &&
    VALIDATION.EMAIL_REGEX.test(email) && 
    passwordStrength.isStrong

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setFirstName("")
      setSurname("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setHobbies([])
      setLanguages([])
      setCountry(undefined)
      setShowPasswordError(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Create Account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Email in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name Input */}
            <div className="space-y-2">
              <label htmlFor="signup-firstname" className="text-sm font-medium text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-firstname"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Surname Input */}
            <div className="space-y-2">
              <label htmlFor="signup-surname" className="text-sm font-medium text-foreground">
                Surname
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-surname"
                  type="text"
                  placeholder="Enter your surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                Email <span className="text-destructive">*</span>
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
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Country of Origin <span className="text-destructive">*</span>
            </label>
            <AutoComplete
              options={COUNTRIES}
              placeholder="Select your country..."
              emptyMessage="No countries found"
              value={country}
              onValueChange={setCountry}
            />
          </div>

          {/* Interests and Languages in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interests/Hobbies */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Interests (e.g., history, hiking)
              </label>
              <ChipSelect
                options={TRAVEL_INTERESTS}
                value={hobbies}
                onChange={setHobbies}
                placeholder="Add things you like"
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Languages
              </label>
              <ChipSelect
                options={LANGUAGES}
                value={languages}
                onChange={setLanguages}
                placeholder="Add languages you know"
              />
            </div>
          </div>

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
              <BrandGoogle className="mr-2 h-4 w-4" />
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
