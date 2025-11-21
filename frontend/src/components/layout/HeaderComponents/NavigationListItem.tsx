import { Link } from "react-router-dom";
import {
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

interface NavigationListItemProps extends React.ComponentPropsWithoutRef<"li"> {
  title: string;
  href: string;
  children: React.ReactNode;
}

export const NavigationListItem = ({
  title,
  children,
  href,
  ...props
}: NavigationListItemProps) => {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

