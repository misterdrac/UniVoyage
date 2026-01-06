import { Target, Users, Heart, Globe, Award, Lightbulb, Map, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import univoyageIcon from '@/assets/univoyage_icon.svg';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function AboutPage() {
  useDocumentTitle('About');
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <img 
              src={univoyageIcon} 
              alt="UniVoyage Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16"
            />
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              About UniVoyage
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Empowering students to explore the world, one journey at a time. Discover destinations, plan adventures, and create unforgettable memories.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="border-2 mb-12 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground leading-relaxed mb-4">
              At UniVoyage, we believe that travel is one of the most transformative experiences for students. Our mission is to make travel planning accessible, affordable, and inspiring for students worldwide.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We provide comprehensive tools and resources to help students discover amazing destinations, plan their trips efficiently, manage budgets, and connect with a community of like-minded travelers. Whether you're planning a weekend getaway or a semester abroad, UniVoyage is your trusted companion.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Making travel planning accessible to all students, regardless of budget or experience level.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Building a supportive community where students can share experiences and learn from each other.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Continuously improving our platform with cutting-edge features and user-focused design.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Committed to delivering the best possible experience for every student traveler.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Section */}
        <div className="mb-12 space-y-6">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-primary">The Beginning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  UniVoyage was born from a simple observation: students love to travel, but planning trips can be overwhelming and time-consuming. As students ourselves, we experienced the frustration of juggling multiple websites, spreadsheets, and apps just to plan a single trip.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-primary">The Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We envisioned a single platform that would bring together everything a student needs to plan their perfect trip - from discovering destinations and managing budgets to tracking itineraries and finding the best deals. A platform designed specifically for students, by students.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-linear-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-primary">Today</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Today, UniVoyage serves thousands of students worldwide, helping them turn their travel dreams into reality. Based in Rijeka, Croatia, we're a global team passionate about making travel accessible and inspiring for the next generation of explorers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden relative">
                    <img 
                      src="/placeholder-team-1.jpg" 
                      alt="Team Member 1"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Users className="h-12 w-12 text-primary absolute" />
                  </div>
                </div>
                <CardTitle className="text-xl">[Team Member Name]</CardTitle>
                <CardDescription>[Role/Position]</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  [Team member description and background. Add information about their role, expertise, and contribution to UniVoyage.]
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden relative">
                    <img 
                      src="/placeholder-team-2.jpg" 
                      alt="Team Member 2"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Users className="h-12 w-12 text-primary absolute" />
                  </div>
                </div>
                <CardTitle className="text-xl">[Team Member Name]</CardTitle>
                <CardDescription>[Role/Position]</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  [Team member description and background. Add information about their role, expertise, and contribution to UniVoyage.]
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden relative">
                    <img 
                      src="/placeholder-team-3.jpg" 
                      alt="Team Member 3"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Users className="h-12 w-12 text-primary absolute" />
                  </div>
                </div>
                <CardTitle className="text-xl">[Team Member Name]</CardTitle>
                <CardDescription>[Role/Position]</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  [Team member description and background. Add information about their role, expertise, and contribution to UniVoyage.]
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden relative">
                    <img 
                      src="/placeholder-team-4.jpg" 
                      alt="Team Member 4"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Users className="h-12 w-12 text-primary absolute" />
                  </div>
                </div>
                <CardTitle className="text-xl">[Team Member Name]</CardTitle>
                <CardDescription>[Role/Position]</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  [Team member description and background. Add information about their role, expertise, and contribution to UniVoyage.]
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Goals Section */}
        <Card className="border-2 mb-12">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">Our Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Global Reach</h3>
                    <p className="text-sm text-muted-foreground">
                      Expand our platform to serve students in every corner of the world, making travel planning accessible globally.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Community Growth</h3>
                    <p className="text-sm text-muted-foreground">
                      Build a thriving community of student travelers who share experiences, tips, and support each other's adventures.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Innovation</h3>
                    <p className="text-sm text-muted-foreground">
                      Continuously innovate with AI-powered recommendations, smart budgeting tools, and seamless integrations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Partnerships</h3>
                    <p className="text-sm text-muted-foreground">
                      Partner with travel providers, universities, and organizations to offer exclusive deals and resources for students.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">UniVoyage Roadmap</CardTitle>
            </div>
            <CardDescription>
              Our vision for the future of UniVoyage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Completed */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-600">Completed</h3>
                </div>
                <div className="ml-7 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-600/20 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Budget Tracking</p>
                      <p className="text-sm text-muted-foreground">Track expenses and manage trip budgets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-600/20 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">AI Itineraries</p>
                      <p className="text-sm text-muted-foreground">AI-powered itinerary generation based on your preferences and interests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-600/20 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Packing Suggestions</p>
                      <p className="text-sm text-muted-foreground">Smart packing lists tailored to your destination and trip duration</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold text-primary">In Progress</h3>
                </div>
                <div className="ml-7 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/20 mt-1">
                      <Calendar className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Social Features</p>
                      <p className="text-sm text-muted-foreground">Share trips, connect with other travelers, and build a community</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/20 mt-1">
                      <Calendar className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-muted-foreground">Native iOS and Android applications for on-the-go trip management</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Planned */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-muted-foreground">Planned</h3>
                </div>
                <div className="ml-7 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-muted mt-1">
                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">AI Trip Recommendations</p>
                      <p className="text-sm text-muted-foreground">Personalized destination suggestions based on interests and budget</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-muted mt-1">
                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Group Trip Planning</p>
                      <p className="text-sm text-muted-foreground">Collaborative features for planning trips with friends</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-muted mt-1">
                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Travel Deals Integration</p>
                      <p className="text-sm text-muted-foreground">Direct booking and exclusive student discounts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
