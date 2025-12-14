import { useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenuButton } from "./UserMenuButton";
import { DESTINATION_NAV_ITEMS } from "./constants";
import type { User } from "@/types/user";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLoginClick: () => void;
}

export const MobileNavigation = ({
  isOpen,
  onClose,
  user,
  onLoginClick,
}: MobileNavigationProps) => {
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div ref={mobileMenuRef} className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col space-y-2">
        <Link
          to="/"
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          onClick={handleLinkClick}
        >
          Home
        </Link>
        
        {user && (
          <Link
            to="/my-trips"
            className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            onClick={handleLinkClick}
          >
            My Trips
          </Link>
        )}

        {/* Mobile Destinations Dropdown */}
        <div className="px-3 py-2">
          <div className="text-sm font-medium text-foreground mb-2">Destinations</div>
          <div className="ml-4 space-y-1">
            {DESTINATION_NAV_ITEMS.map((destination) => (
              <Link
                key={destination.title}
                to={destination.href}
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={handleLinkClick}
              >
                <div className="font-medium">{destination.title}</div>
                <div className="text-xs text-muted-foreground/70">{destination.description}</div>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/about"
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          onClick={handleLinkClick}
        >
          About
        </Link>
        <Link
          to="/contact"
          className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          onClick={handleLinkClick}
        >
          Contact
        </Link>

        {/* Mobile Auth Section */}
        <div className="pt-4 border-t border-border">
          {user ? (
            <UserMenuButton user={user} variant="mobile" />
          ) : (
            <Button 
              variant="secondary" 
              size="default"
              onClick={() => {
                onLoginClick();
                onClose();
              }}
              className="w-full"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

