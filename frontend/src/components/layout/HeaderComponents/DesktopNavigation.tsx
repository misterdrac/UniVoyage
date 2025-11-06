import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavigationListItem } from "./NavigationListItem";
import { DESTINATION_NAV_ITEMS } from "./constants";
import type { User } from "@/data/mockUsers";

interface DesktopNavigationProps {
  user: User | null;
}

export const DesktopNavigation = ({ user }: DesktopNavigationProps) => {
  return (
    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          
          {user && (
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/my-trips">My Trips</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
          
          <NavigationMenuItem>
            <NavigationMenuTrigger>Destinations</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid sm:w-[400px] md:w-[500px] md:grid-cols-1 lg:w-[600px] rounded-b-lg">
                {DESTINATION_NAV_ITEMS.map((destination) => (
                  <NavigationListItem
                    key={destination.title}
                    title={destination.title}
                    href={destination.href}
                  >
                    {destination.description}
                  </NavigationListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/about">About</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/contact">Contact</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

