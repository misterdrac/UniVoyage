import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "@/types/user";

interface UserMenuButtonProps {
  user: UserType;
  variant?: "desktop" | "mobile";
}

export const UserMenuButton = ({ user, variant = "desktop" }: UserMenuButtonProps) => {
  const navigate = useNavigate();

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const userDisplayName = useMemo(
    () => `${user.name ?? ''} ${user.surname ?? ''}`.trim() || user.email,
    [user.name, user.surname, user.email]
  );

  if (variant === "mobile") {
    return (
      <Button 
        variant="ghost" 
        onClick={handleProfileClick}
        className="w-full justify-start rounded-md"
      >
        <User className="w-4 h-4 mr-2" />
        <span className="font-medium">{userDisplayName}</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleProfileClick}
      className="hidden sm:flex items-center gap-2 rounded-md"
    >
      <User className="w-4 h-4" />
      <span className="hidden sm:inline font-medium">{userDisplayName}</span>
    </Button>
  );
};

