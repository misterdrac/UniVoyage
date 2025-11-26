import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UI_CONSTANTS } from "@/lib/constants";
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
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={userDisplayName}
            className="w-6 h-6 rounded-full object-cover mr-2"
            style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL }}
          />
        ) : (
          <User className="w-4 h-4 mr-2" />
        )}
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
      {user.profileImage ? (
        <img
          src={user.profileImage}
          alt={userDisplayName}
          className="w-6 h-6 rounded-full object-cover"
          style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL }}
        />
      ) : (
        <User className="w-4 h-4" />
      )}
      <span className="hidden sm:inline font-medium">{userDisplayName}</span>
    </Button>
  );
};

