import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User as UserIcon, MapPin, Info, Mail, Shield, Globe, Star } from "lucide-react";
import { DESTINATION_NAV_ITEMS } from "./constants";
import type { User } from "@/types/user";
import { ROUTE_PATHS } from "@/config/routes";

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
  const navRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        // Check if click is not on the menu toggle button
        const target = event.target as HTMLElement;
        const menuButton = target.closest('button[aria-label="Toggle mobile menu"]');
        if (!menuButton) {
          onClose();
        }
      }
    };

    // Add event listener with a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={navRef}
      className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 max-h-[80vh] overflow-y-auto"
    >
      <div className="container mx-auto px-4 py-3">
        {/* Main Navigation Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link
            to={ROUTE_PATHS.HOME}
            className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
            onClick={handleLinkClick}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          
          {user ? (
            <Link
              to={ROUTE_PATHS.PROFILE}
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
              onClick={handleLinkClick}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          ) : (
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => {
                onLoginClick();
                onClose();
              }}
              className="w-full flex flex-col items-center gap-1"
            >
              <UserIcon className="w-4 h-4" />
              <span>Login</span>
            </Button>
          )}

          {user && (
            <Link
              to={ROUTE_PATHS.MY_TRIPS}
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
              onClick={handleLinkClick}
            >
              <MapPin className="w-4 h-4" />
              <span>My Trips</span>
            </Link>
          )}

          <Link
            to={ROUTE_PATHS.ABOUT}
            className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
            onClick={handleLinkClick}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </Link>

          <Link
            to={ROUTE_PATHS.CONTACT}
            className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
            onClick={handleLinkClick}
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </Link>

          {user && (user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') && (
            <Link
              to={ROUTE_PATHS.ADMIN_DASHBOARD}
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
              onClick={handleLinkClick}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Destinations Grid */}
        <div className="border-t border-border pt-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-1 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Destinations</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATION_NAV_ITEMS.map((destination) => {
              // Use different icons for different destinations
              const getIcon = () => {
                if (destination.title.includes("Popular")) return <Star className="w-3 h-3" />;
                return <MapPin className="w-3 h-3" />;
              };
              
              return (
                <Link
                  key={destination.title}
                  to={destination.href}
                  className="px-2 py-1.5 text-xs text-foreground hover:bg-accent rounded-md text-center flex flex-col items-center gap-1"
                  onClick={handleLinkClick}
                >
                  {getIcon()}
                  <span className="leading-tight">{destination.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

