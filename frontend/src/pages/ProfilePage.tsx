import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { UI_CONSTANTS, LANGUAGES, TRAVEL_INTERESTS } from '@/lib/constants';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out successfully");
  };

  // This should never happen due to ProtectedRoute, but TypeScript needs this
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>

        {/* Inspect mockUsers.ts for the user object structure */}
        {/* Search https://ui.shadcn.com/docs/components for components to use */}
        {/* You can also try to find components on https://21st.dev/community/components */}
        
        {/* TODO: Add edit profile functionality */}
        {/* TODO: Implement profile picture upload */}
        {/* TODO: Add form validation for all profile fields */}
        {/* TODO: Create multi-select component for interests */}
        {/* TODO: Create autocomplete component for languages and countries visited */}
        {/* TODO: Add save/cancel buttons with loading states */}
        {/* TODO: Integrate with backend API endpoints: PUT /api/user/profile, POST /api/user/profile-picture */}
        
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="shrink-0">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="rounded-full object-cover border-2 border-border"
                  style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE }}
                />
              ) : (
                <div 
                  className="rounded-full bg-muted flex items-center justify-center border-2 border-border"
                  style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE }}
                >
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {user.name}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium">Country:</span> {user.country || 'Not provided'}</p>
            <p><span className="font-medium">Role:</span> {user.role || 'USER'}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Travel Information</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-2">Languages Spoken:</p>
              <div className="flex flex-wrap gap-2">
                {user.languages.length > 0 ? (
                  user.languages.map((langCode, index) => {
                    const language = LANGUAGES.find(l => l.value === langCode);
                    return (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        {language?.label || langCode}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">No languages specified</span>
                )}
              </div>
            </div>
            
            <div>
              <p className="font-medium text-foreground mb-2">Countries Visited:</p>
              <div className="flex flex-wrap gap-2">
                {user.visited.length > 0 ? (
                  user.visited.map((country, index) => (
                    <span key={index} className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-md text-sm">
                      {country}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">No countries visited yet</span>
                )}
              </div>
            </div>
            
            <div>
              <p className="font-medium text-foreground mb-2">Hobbies & Interests:</p>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.length > 0 ? (
                  user.hobbies.map((interestValue, index) => {
                    const interest = TRAVEL_INTERESTS.find(i => i.value === interestValue);
                    return (
                      <span key={index} className="bg-accent/10 text-accent-foreground px-2 py-1 rounded-md text-sm">
                        {interest?.label || interestValue}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">No hobbies specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>
          <div className="space-y-2 text-sm text-muted-foreground mb-6">
            <p><span className="font-medium">Member since:</span> {new Date(user.dateOfRegister).toLocaleDateString()}</p>
            <p><span className="font-medium">Last login:</span> {user.dateOfLastSignin ? new Date(user.dateOfLastSignin).toLocaleDateString() : 'Never'}</p>
            <p><span className="font-medium">Account status:</span> <span className="text-green-600">Active</span></p>
          </div>
          
          <div className="pt-4 border-t border-border">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
