import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 via-purple-600 to-purple-500 relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-8 z-10">
        <div className="flex space-x-8 text-white">
          <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-blue-200 transition-colors">About</Link>
          <Link to="/tour" className="hover:text-blue-200 transition-colors">Tour</Link>
          <Link to="/contact" className="hover:text-blue-200 transition-colors">Contact</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center min-h-screen px-8 py-16">
        {/* Left Section - Text Content */}
        <div className="flex-1 max-w-2xl z-10">
          {/* Logo */}
          <div className="mb-8">
            <span className="text-white text-xl font-semibold">Logo Here</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
            Travel Apps
            <br />
            Reservation
          </h1>

          {/* Description */}
          <p className="text-white/90 text-lg mb-8 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris.
          </p>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View More
          </Button>

          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-12">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Twitter className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Right Section - Simple Illustration */}
        <div className="flex-1 flex justify-center items-center relative z-10">
          <div className="relative">
            {/* Large Phone Mockup */}
            <div className="w-80 h-96 bg-white rounded-3xl shadow-2xl p-4 relative">
              {/* Phone Screen Content */}
              <div className="w-full h-full bg-gray-50 rounded-2xl p-4 space-y-3">
                {/* App Header */}
                <div className="bg-blue-500 h-8 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Travel App</span>
                </div>
                
                {/* Reservation Items */}
                <div className="space-y-2">
                  <div className="bg-blue-100 h-6 rounded"></div>
                  <div className="bg-orange-100 h-6 rounded"></div>
                  <div className="bg-blue-100 h-6 rounded"></div>
                  <div className="bg-orange-100 h-6 rounded"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
