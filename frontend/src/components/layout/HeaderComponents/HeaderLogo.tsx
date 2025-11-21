import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

export const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Plane className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold text-foreground">UniVoyage</span>
    </Link>
  );
};

