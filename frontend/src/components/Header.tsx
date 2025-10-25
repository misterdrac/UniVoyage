import { Link, useNavigate } from "react-router-dom"
import { Plane, Sun, Moon, User } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LoginDialog, SignUpDialog } from "@/components/auth"
import { useState } from "react"
import { UI_CONSTANTS } from "@/lib/constants"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const destinations: { title: string; href: string; description: string }[] = [
  {
    title: "Popular Destinations",
    href: "/destinations",
    description: "Explore the most popular destinations for students.",
  },
  {
    title: "Europe",
    href: "/destinations/europe",
    description: "Explore historic cities and cultural landmarks across Europe.",
  },
  {
    title: "Asia",
    href: "/destinations/asia",
    description: "Discover ancient traditions and modern metropolises in Asia.",
  },
  {
    title: "Americas",
    href: "/destinations/americas",
    description: "Experience diverse landscapes from North to South America.",
  },
  {
    title: "Africa",
    href: "/destinations/africa",
    description: "Immerse yourself in rich cultures and stunning wildlife.",
  },
]



export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)


  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">UniVoyage</span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {/* Authenticated user navigation */}
                    {user && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/my-trips">My Trips</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/trip-planner">Trip Planner</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Destinations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid sm:w-[400px] md:w-[500px] md:grid-cols-1 lg:w-[600px] rounded-b-lg">
                    {destinations.map((destination) => (
                      <ListItem
                        key={destination.title}
                        title={destination.title}
                        href={destination.href}
                      >
                        {destination.description}
                      </ListItem>
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

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              /* User is logged in */
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleProfileClick}
                  className="flex items-center gap-2"
                >
                  {user.profile.profilePicture ? (
                    <img
                      src={user.profile.profilePicture}
                      alt={`${user.profile.firstName} ${user.profile.lastName}`}
                      className="w-6 h-6 rounded-full object-cover"
                      style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL }}
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline font-medium">
                    {user.profile.firstName || user.email}
                  </span>
                </Button>
              </>
            ) : (
              /* User is not logged in */
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
            )}

            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 bg-muted hover:bg-muted/80 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Login Dialog */}
      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen}
        onSignUpClick={() => setIsSignUpOpen(true)}
      />
      
      {/* Sign Up Dialog */}
      <SignUpDialog 
        open={isSignUpOpen} 
        onOpenChange={setIsSignUpOpen}
        onLoginClick={() => setIsLoginOpen(true)}
      />
    </nav>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
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
  )
}
