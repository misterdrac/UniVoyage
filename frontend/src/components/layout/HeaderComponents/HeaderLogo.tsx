import { Link } from "react-router-dom";
import univoyageIcon from "@/assets/univoyage_icon.svg";
import { ROUTE_PATHS } from "@/config/routes";

export const HeaderLogo = () => {
  return (
    <Link to={ROUTE_PATHS.HOME} className="flex items-center space-x-2">
      <img 
        src={univoyageIcon} 
        alt="UniVoyage Logo" 
        className="w-8 h-8"
      />
      <span className="text-xl font-bold text-foreground">UniVoyage</span>
    </Link>
  );
};

