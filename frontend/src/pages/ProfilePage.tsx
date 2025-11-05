import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { LogOut, User, Edit2, Save, X, Camera, Loader2, MapPin, Globe, Languages, Award, Calendar, TrendingUp, Mail, Star, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { UI_CONSTANTS, LANGUAGES, TRAVEL_INTERESTS, COUNTRIES } from '@/lib/constants';
import { ChipSelect } from '@/components/ui/chip-select';
import { AutoComplete, type Option } from '@/components/ui/autocomplete';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';

const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, uploadProfilePicture, isLoading } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for profile
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [country, setCountry] = useState<Option | undefined>(undefined);
  
  // Form state for interests
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);

  // Initialize form data when user loads
  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setSurname(user.surname || '');
      setCountry(user.country ? COUNTRIES.find(c => c.value === user.country) : undefined);
      setHobbies(user.hobbies || []);
      setLanguages(user.languages || []);
      setVisited(user.visited || []);
    }
  }, [user]);

  // Initialize profile form data when editing starts
  React.useEffect(() => {
    if (user && isEditingProfile) {
      setFirstName(user.firstName || '');
      setSurname(user.surname || '');
      setCountry(user.country ? COUNTRIES.find(c => c.value === user.country) : undefined);
    }
  }, [user, isEditingProfile]);

  // Initialize interests form data when editing starts
  React.useEffect(() => {
    if (user && isEditingInterests) {
      setHobbies(user.hobbies || []);
      setLanguages(user.languages || []);
      setVisited(user.visited || []);
    }
  }, [user, isEditingInterests]);

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out successfully");
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelProfile = () => {
    // Reset to original user values
    if (user) {
      setFirstName(user.firstName || '');
      setSurname(user.surname || '');
      setCountry(user.country ? COUNTRIES.find(c => c.value === user.country) : undefined);
      setImagePreview(null);
    }
    setIsEditingProfile(false);
  };

  const handleEditInterests = () => {
    setIsEditingInterests(true);
  };

  const handleCancelInterests = () => {
    // Reset to original user values
    if (user) {
      setHobbies(user.hobbies || []);
      setLanguages(user.languages || []);
      setVisited(user.visited || []);
    }
    setIsEditingInterests(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setIsUploadingImage(true);
    try {
      const result = await uploadProfilePicture(file);
      if (result.success) {
        toast.success('Profile picture updated successfully!');
        setImagePreview(null);
      } else {
        toast.error(result.error || 'Failed to upload profile picture');
        setImagePreview(null);
      }
    } catch (error) {
      toast.error('An error occurred while uploading your profile picture');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters');
      return;
    }

    setIsSavingProfile(true);
    
    try {
      const result = await updateProfile({
        firstName: firstName.trim(),
        surname: surname.trim() || undefined,
        country: country?.value || undefined,
      });

      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveInterests = async () => {
    setIsSavingInterests(true);
    
    try {
      const result = await updateProfile({
        hobbies,
        languages,
        visited,
      });

      if (result.success) {
        toast.success('Travel information updated successfully!');
        setIsEditingInterests(false);
      } else {
        toast.error(result.error || 'Failed to update travel information');
      }
    } catch (error) {
      toast.error('An error occurred while updating your travel information');
    } finally {
      setIsSavingInterests(false);
    }
  };

  // This should never happen due to ProtectedRoute, but TypeScript needs this
  if (!user) {
    return null;
  }

  // Convert visited countries to Option[] for ChipSelect
  const visitedOptions = visited.map(code => {
    const country = COUNTRIES.find(c => c.value === code);
    return { value: code, label: country?.label || code };
  });

  const handleVisitedChange = (values: string[]) => {
    setVisited(values);
  };

  // Convert languages to Option[] for ChipSelect
  const languageOptions = LANGUAGES.map(lang => ({
    value: lang.value,
    label: lang.label
  }));

  // Convert hobbies to Option[] for ChipSelect
  const hobbyOptions = TRAVEL_INTERESTS.map(interest => ({
    value: interest.value,
    label: interest.label
  }));

  // Calculate stats
  const stats = {
    countriesVisited: user.visited?.length || 0,
    languagesSpoken: user.languages?.length || 0,
    interests: user.hobbies?.length || 0,
    memberFor: Math.floor((new Date().getTime() - new Date(user.dateOfRegister).getTime()) / (1000 * 60 * 60 * 24)),
  };

  // Calculate profile completion
  const profileFields = [
    user.firstName,
    user.surname,
    user.country,
    user.profileImage,
    user.languages?.length > 0,
    user.visited?.length > 0,
    user.hobbies?.length > 0,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  // Achievement badges with tiers
  const getAchievementTier = (value: number, thresholds: number[]) => {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (value >= thresholds[i]) {
        return i;
      }
    }
    return -1;
  };

  const getTierColor = (tier: number) => {
    const colors = [
      { name: 'Bronze', bg: 'from-amber-600/20 to-amber-700/10', border: 'border-amber-600', icon: 'text-amber-600', star: 'text-amber-500' },
      { name: 'Silver', bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400', icon: 'text-slate-400', star: 'text-slate-300' },
      { name: 'Gold', bg: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500', icon: 'text-yellow-500', star: 'text-yellow-400' },
      { name: 'Emerald', bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500', icon: 'text-emerald-500', star: 'text-emerald-400' },
      { name: 'Ruby', bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500', icon: 'text-red-500', star: 'text-red-400' },
      { name: 'Sapphire', bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500', icon: 'text-blue-500', star: 'text-blue-400' },
      { name: 'Amethyst', bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500', icon: 'text-purple-500', star: 'text-purple-400' },
      { name: 'Diamond', bg: 'from-cyan-400/20 to-cyan-500/10', border: 'border-cyan-400', icon: 'text-cyan-400', star: 'text-cyan-300' },
      { name: 'Cosmic', bg: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500', icon: 'text-indigo-500', star: 'text-indigo-400' },
    ];
    return colors[Math.min(tier, colors.length - 1)] || colors[colors.length - 1];
  };

  // Language achievements
  const languageTiers = [
    { name: 'Bilingual', threshold: 2, description: 'Speak 2 languages' },
    { name: 'Polyglot', threshold: 3, description: 'Speak 3 languages' },
    { name: 'Linguist', threshold: 5, description: 'Speak 5+ languages' },
    { name: 'Master Linguist', threshold: 10, description: 'Speak 10+ languages' },
  ];

  // Country achievements
  const countryTiers = [
    { name: 'Wanderer', threshold: 5, description: 'Visit 5 countries' },
    { name: 'Explorer', threshold: 10, description: 'Visit 10 countries' },
    { name: 'World Traveler', threshold: 20, description: 'Visit 20 countries' },
    { name: 'Globetrotter', threshold: 50, description: 'Visit 50 countries' },
    { name: 'Master Traveler', threshold: 100, description: 'Visit 100 countries' },
    { name: 'Legendary Explorer', threshold: 150, description: 'Visit 150 countries' },
    { name: 'UN Ambassador', threshold: 193, description: 'Visit all 193 UN member countries' },
  ];

  // Interest achievements
  const interestTiers = [
    { name: 'Curious', threshold: 2, description: 'Have 2 interests' },
    { name: 'Enthusiast', threshold: 5, description: 'Have 5+ interests' },
    { name: 'Passionate', threshold: 10, description: 'Have 10+ interests' },
  ];

  // Member duration achievements (in days)
  const memberTiers = [
    { name: 'Newcomer', threshold: 30, description: 'Member for 1 month' },
    { name: 'Loyal', threshold: 365, description: 'Member for 1 year' },
    { name: 'Dedicated', threshold: 730, description: 'Member for 2 years' },
    { name: 'Veteran', threshold: 1825, description: 'Member for 5 years' },
    { name: 'Champion', threshold: 3650, description: 'Member for 10 years' },
    { name: 'Legend', threshold: 18250, description: 'Member for 50 years' },
    { name: 'Immortal', threshold: 365000, description: 'Member for 1000 years (How is this possible?)' },
  ];

  // Get current tier for each achievement type
  const languageTier = getAchievementTier(stats.languagesSpoken, languageTiers.map(t => t.threshold));
  const countryTier = getAchievementTier(stats.countriesVisited, countryTiers.map(t => t.threshold));
  const interestTier = getAchievementTier(stats.interests, interestTiers.map(t => t.threshold));
  const memberTier = getAchievementTier(stats.memberFor, memberTiers.map(t => t.threshold));

  // Build achievements array
  const achievements = [
    {
      name: languageTier >= 0 ? languageTiers[languageTier].name : 'Bilingual',
      icon: Languages,
      unlocked: languageTier >= 0,
      description: languageTier >= 0 ? languageTiers[languageTier].description : 'Speak 2 languages',
      tier: languageTier,
      type: 'language',
    },
    {
      name: countryTier >= 0 ? countryTiers[countryTier].name : 'Wanderer',
      icon: Globe,
      unlocked: countryTier >= 0,
      description: countryTier >= 0 ? countryTiers[countryTier].description : 'Visit 5 countries',
      tier: countryTier,
      type: 'country',
    },
    {
      name: interestTier >= 0 ? interestTiers[interestTier].name : 'Curious',
      icon: Sparkles,
      unlocked: interestTier >= 0,
      description: interestTier >= 0 ? interestTiers[interestTier].description : 'Have 2 interests',
      tier: interestTier,
      type: 'interest',
    },
    {
      name: memberTier >= 0 ? memberTiers[memberTier].name : 'Newcomer',
      icon: Trophy,
      unlocked: memberTier >= 0,
      description: memberTier >= 0 ? memberTiers[memberTier].description : 'Member for 1 month',
      tier: memberTier,
      type: 'member',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </div>
              {!isEditingProfile && (
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="shrink-0 relative">
              <div className="relative group">
                {(imagePreview || user.profileImage) ? (
                  <img
                    src={imagePreview || user.profileImage}
                    alt={`${user.firstName} ${user.surname || ''}`.trim()}
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
                {isUploadingImage && (
                  <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                {isEditingProfile && (
                  <button
                    type="button"
                    onClick={handleImageClick}
                    disabled={isUploadingImage || isLoading}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploadingImage || isLoading || !isEditingProfile}
              />
              {isEditingProfile && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click to upload
                </p>
              )}
            </div>
            <div className="flex-1 w-full">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        First Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        disabled={isSavingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Surname
                      </label>
                      <Input
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="Enter your surname"
                        disabled={isSavingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Country of Origin
                    </label>
                    <AutoComplete
                      options={COUNTRIES}
                      value={country}
                      onValueChange={setCountry}
                      placeholder="Select your country..."
                      emptyMessage="No countries found"
                      disabled={isSavingProfile}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {user.firstName} {user.surname || ''}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="space-y-2">
                    {user.country && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">Country:</span> {COUNTRIES.find(c => c.value === user.country)?.label || user.country}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {isEditingProfile && (
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button
                onClick={handleCancelProfile}
                variant="outline"
                disabled={isSavingProfile}
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile || !firstName.trim()}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingProfile ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Profile Completion Card */}
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Profile Completion
              </span>
              <span className="text-2xl font-bold text-primary">{profileCompletion}%</span>
            </CardTitle>
            <CardDescription>Complete your profile to enable us to give you more tailored suggestions and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedFields} of {profileFields.length} fields completed
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Countries Visited</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.countriesVisited} />
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Languages Spoken</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.languagesSpoken} />
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Languages className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Interests</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.interests} />
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Member For</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={stats.memberFor} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">days</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Achievements
            </CardTitle>
            <CardDescription>Unlock achievements by completing various milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                const tierColor = achievement.unlocked ? getTierColor(achievement.tier) : null;
                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${tierColor?.bg} ${tierColor?.border} shadow-md hover:shadow-lg`
                        : 'bg-muted/50 border-muted opacity-60'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${achievement.unlocked ? '' : 'grayscale'}`}>
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked 
                          ? 'bg-background/50' 
                          : 'bg-muted'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          achievement.unlocked 
                            ? tierColor?.icon || 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${
                          achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && tierColor && (
                          <p className={`text-xs font-medium mt-1 ${tierColor.icon}`}>
                            {tierColor.name} Tier
                          </p>
                        )}
                      </div>
                    </div>
                    {achievement.unlocked && tierColor && (
                      <div className="absolute top-2 right-2">
                        <Star className={`w-4 h-4 ${tierColor.star} fill-current`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Travel Information Card */}
        <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Travel Information
                </CardTitle>
                <CardDescription>Your travel preferences and experiences</CardDescription>
              </div>
              {!isEditingInterests && (
                <Button
                  onClick={handleEditInterests}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
          {isEditingInterests ? (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Languages Spoken
                </label>
                <ChipSelect
                  options={languageOptions}
                  value={languages}
                  onChange={setLanguages}
                  placeholder="Select languages..."
                  disabled={isSavingInterests}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Countries Visited
                </label>
                <ChipSelect
                  options={COUNTRIES}
                  value={visited}
                  onChange={handleVisitedChange}
                  placeholder="Select countries you've visited..."
                  disabled={isSavingInterests}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Hobbies & Interests
                </label>
                <ChipSelect
                  options={hobbyOptions}
                  value={hobbies}
                  onChange={setHobbies}
                  placeholder="Select your interests..."
                  disabled={isSavingInterests}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  onClick={handleCancelInterests}
                  variant="outline"
                  disabled={isSavingInterests}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveInterests}
                  disabled={isSavingInterests}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingInterests ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
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
                    user.visited.map((countryCode, index) => {
                      const country = COUNTRIES.find(c => c.value === countryCode);
                      return (
                        <span key={index} className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-md text-sm">
                          {country?.label || countryCode}
                        </span>
                      );
                    })
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
          )}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Member since</p>
                  <p className="text-base font-semibold text-foreground">
                    {new Date(user.dateOfRegister).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last login</p>
                  <p className="text-base font-semibold text-foreground">
                    {user.dateOfLastSignin 
                      ? new Date(user.dateOfLastSignin).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Never'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-base font-semibold text-green-600">Active</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                  disabled={isEditingProfile || isEditingInterests}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
