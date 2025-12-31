import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import univoyageIcon from "@/assets/univoyage_icon.svg";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-6">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-2">
              <img 
                src={univoyageIcon} 
                alt="UniVoyage Logo" 
                className="w-8 h-8"
              />
              <h3 className="text-xl font-bold text-foreground">UniVoyage</h3>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Your trusted companion for student travel. Discover amazing destinations,
              plan unforgettable trips, and connect with fellow travelers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Discover</h4>
                <nav className="space-y-1">
                  <Link
                    to="/destinations"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Popular
                  </Link>
                  <Link
                    to="/destinations/europe"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Europe
                  </Link>
                  <Link
                    to="/destinations/asia"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Asia
                  </Link>
                  <Link
                    to="/destinations/americas"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Americas
                  </Link>
                </nav>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">About Us</h4>
                <nav className="space-y-1">
                  <Link
                    to="/about"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Powered By */}
          <div className="md:col-span-1">
            <h4 className="text-sm font-semibold text-foreground mb-3">Powered By</h4>
            <nav className="space-y-1">
              <a
                href="https://openweathermap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Weather API
              </a>
              <a
                href="https://geoapify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Geoapify
              </a>
              <a
                href="https://amadeus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Amadeus
              </a>
              <a
                href="https://hostelworld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Hostelworld
              </a>
            </nav>
          </div>

          {/* Social Media */}
          <div className="md:col-span-1">
            <h4 className="text-sm font-semibold text-foreground mb-3">Follow Us</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Join us on these platforms for travel tips, updates, and inspiration.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="X"
              >
                <FaXTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} UniVoyage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

