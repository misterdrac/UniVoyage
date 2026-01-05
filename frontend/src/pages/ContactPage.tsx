import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { FaXTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Contact Information Cards */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Email Us</CardTitle>
              </div>
              <CardDescription>
                Send us an email anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:contact@univoyage.com" 
                className="text-primary hover:underline font-medium"
              >
                contact@univoyage.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                We typically respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Support</CardTitle>
              </div>
              <CardDescription>
                Need help? We're here for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:support@univoyage.com" 
                className="text-primary hover:underline font-medium"
              >
                support@univoyage.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Technical support and assistance
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Location</CardTitle>
              </div>
              <CardDescription>
                Where we're based
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                Rijeka, Croatia
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Serving students worldwide
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com"
                      className="bg-background"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input 
                    id="subject" 
                    placeholder="What's this about?"
                    className="bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    className="bg-background resize-none"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Social Media & Additional Info */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Connect With Us</CardTitle>
                <CardDescription>
                  Follow us on social media for updates and travel inspiration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                      <FaFacebook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook</p>
                      <p className="text-xs text-muted-foreground">Follow us</p>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                      <FaInstagram className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-xs text-muted-foreground">Follow us</p>
                    </div>
                  </a>

                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-gray-800/10 dark:bg-gray-200/10 group-hover:bg-gray-800/20 dark:group-hover:bg-gray-200/20 transition-colors">
                      <FaXTwitter className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">X</p>
                      <p className="text-xs text-muted-foreground">Follow us</p>
                    </div>
                  </a>

                  <a
                    href="https://linkedin.com/company/univoyage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                      <FaLinkedin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-xs text-muted-foreground">Company</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">General Inquiries</p>
                      <p className="text-sm text-muted-foreground">Within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Support Requests</p>
                      <p className="text-sm text-muted-foreground">Within 12-24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-primary/20 mt-0.5">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Urgent Matters</p>
                      <p className="text-sm text-muted-foreground">Please email with "URGENT" in subject</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">How do I create an account?</h3>
                <p className="text-sm text-muted-foreground">
                  Click the "Sign Up" button in the header to create your free account. You can also sign up with Google for faster registration.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is UniVoyage free to use?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! UniVoyage is completely free for students. Create unlimited trips, explore destinations, and connect with other travelers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I share my trips?</h3>
                <p className="text-sm text-muted-foreground">
                  Currently, trips are private to your account. We're working on sharing features for the future!
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do I report a bug?</h3>
                <p className="text-sm text-muted-foreground">
                  Please email us at support@univoyage.com with details about the issue. Include screenshots if possible.
        </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
