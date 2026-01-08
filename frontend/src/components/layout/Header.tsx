import { useCallback, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog, SignUpDialog } from "@/components/auth";
import { HeaderLogo, DesktopNavigation, MobileNavigation, UserMenuButton, ThemeToggleButton } from "./HeaderComponents";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLoginClick = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const handleSignUpClick = useCallback(() => {
    setIsSignUpOpen(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          <HeaderLogo />

          <DesktopNavigation user={user} />

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>

            {user ? (
              <UserMenuButton user={user} />
            ) : (
              <Button 
                variant="secondary" 
                size="default"
                onClick={handleLoginClick}
                className="hidden sm:block"
              >
                Login
              </Button>
            )}

            <ThemeToggleButton />
          </div>
        </div>
      </div>
      
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        user={user}
        onLoginClick={handleLoginClick}
      />
      
      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen}
        onSignUpClick={handleSignUpClick}
      />
      
      <SignUpDialog 
        open={isSignUpOpen} 
        onOpenChange={setIsSignUpOpen}
        onLoginClick={handleLoginClick}
      />
    </nav>
  );
}
