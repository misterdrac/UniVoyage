import { Link, useNavigate } from "react-router-dom"
import { Plane, Sun, Moon, User, Menu, X } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LoginDialog, SignUpDialog } from "@/components/auth"
import { useState, useEffect, useRef } from "react"
import { UI_CONSTANTS } from "@/lib/constants"

//todo refactor this file

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleProfileClick = () => {
    navigate('/profile')
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

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

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:block">
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
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>

            {user ? (
              /* User is logged in */
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleProfileClick}
                  className="hidden sm:flex items-center gap-2"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                      style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL }}
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline font-medium">
                    {user.name || user.email}
                  </span>
                </Button>
              </>
            ) : (
              /* User is not logged in */
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="hidden sm:block"
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {user && (
                <>
                  <Link
                    to="/my-trips"
                    className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Trips
                  </Link>
                  <Link
                    to="/trip-planner"
                    className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Trip Planner
                  </Link>
                </>
              )}

              {/* Mobile Destinations Dropdown */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-foreground mb-2">Destinations</div>
                <div className="ml-4 space-y-1">
                  {destinations.map((destination) => (
                    <Link
                      key={destination.title}
                      to={destination.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      handleProfileClick()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover mr-2"
                        style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.SMALL }}
                      />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    <span className="font-medium">
                      {user.name || user.email}
                    </span>
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setIsLoginOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
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
