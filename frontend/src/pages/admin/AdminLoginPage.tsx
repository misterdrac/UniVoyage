import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, Loader2, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import heroImage from '@/assets/images/hero2.jpg';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if the user is an admin after login
        // The user state will be updated, and the useEffect will handle redirect
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Show message if user is logged in but not admin
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You are logged in as <strong>{user.email}</strong>, but this account doesn't have admin privileges.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
              variant="outline"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image with Decorative Shape */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <img
          src={heroImage}
          alt="Travel destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 via-teal-600/70 to-transparent" />
        
        {/* Decorative Wave Shape */}
        <svg
          className="absolute right-0 top-0 h-full w-auto text-background"
          viewBox="0 0 100 800"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M100 0 L100 800 L0 800 Q50 600 30 400 Q10 200 50 0 Z" />
        </svg>
        
        {/* Content on Image */}
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xl font-semibold">UniVoyage Admin</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Content Management System
          </h1>
          <p className="text-white/90 text-lg">
            Manage users, destinations, and content for the UniVoyage travel platform.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-card/80 backdrop-blur-sm border shadow-sm hover:bg-card"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo for mobile */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                UNIVOYAGE ADMIN
              </h2>
              <p className="text-muted-foreground mt-2">
                Sign in to access the admin panel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@univoyage.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 text-base bg-muted/30 border-muted-foreground/20 focus:bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 text-base bg-muted/30 border-muted-foreground/20 focus:bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    LOG IN
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <a 
                href="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to UniVoyage
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} UniVoyage. Admin Panel.
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

