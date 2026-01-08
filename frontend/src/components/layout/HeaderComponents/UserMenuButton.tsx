import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "@/types/user";
import { Avatar } from "@/components/profile/Avatar";
import { ROUTE_PATHS } from "@/config/routes";

interface UserMenuButtonProps {
  user: UserType;
  variant?: "desktop" | "mobile";
}

export const UserMenuButton = ({ user, variant = "desktop" }: UserMenuButtonProps) => {
  const navigate = useNavigate();

  const handleProfileClick = useCallback(() => {
    navigate(ROUTE_PATHS.PROFILE);
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
        <Avatar src={user.profileImagePath} alt="Profile" size="sm" />
        <span className="font-medium ml-2">{userDisplayName}</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleProfileClick}
      className="hidden sm:flex items-center gap-2 rounded-md"
    >
      <Avatar src={user.profileImagePath} alt="Profile" size="sm" />
      <span className="hidden sm:inline font-medium">{userDisplayName}</span>
    </Button>
  );
};

