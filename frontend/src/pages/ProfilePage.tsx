import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  ProfileHeaderCard,
  ProfileCompletionCard,
  ProfileStatsCards,
  AchievementsSection,
  TravelInformationCard,
  AccountInformationCard,
  useProfileForm,
} from '@/components/profile';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ProfilePage = () => {
  useDocumentTitle('Profile');
  const { user, logout, updateProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingInterests, setIsSavingInterests] = useState(false);

  // Custom hooks for form and image management
  const {
    name,
    setName,
    surname,
    setSurname,
    country,
    setCountry,
    profileImagePath,
    setProfileImagePath,
    resetProfileForm,
    hobbies,
    setHobbies,
    languages,
    setLanguages,
    visited,
    setVisited,
    resetInterestsForm,
  } = useProfileForm({
    user,
    isEditingProfile,
    isEditingInterests,
  });

  // Handlers
  const handleLogout = useCallback(() => {
    logout();
    toast.success("You've been logged out successfully");
  }, [logout]);


  const handleEditProfile = useCallback(() => {
    // If travel info is being edited, close it before entering profile edit
    setIsEditingInterests(false);
    resetInterestsForm();
    setIsEditingProfile(true);
  }, [resetInterestsForm]);

  const handleCancelProfile = useCallback(() => {
    resetProfileForm();
    toast.info('Canceled changes to profile information');
    setIsEditingProfile(false);
  }, [resetProfileForm]);

  const handleEditInterests = useCallback(() => {
    // If profile info is being edited, close it before entering travel edit
    setIsEditingProfile(false);
    resetProfileForm();
    setIsEditingInterests(true);
  }, [resetProfileForm]);

  const handleCancelInterests = useCallback(() => {
    resetInterestsForm();
    setIsEditingInterests(false);
  }, [resetInterestsForm]);

  const handleSaveProfile = useCallback(
    async (data: { name: string; surname?: string; countryCode?: string; profileImagePath?: string }) => {
      setIsSavingProfile(true);
      try {
        const result = await updateProfile({
          name: data.name,
          surname: data.surname,
          countryCode: data.countryCode,
          profileImagePath: data.profileImagePath,
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
    },
    [updateProfile]
  );

  const handleSaveInterests = useCallback(
    async (data: { hobbies: string[]; languages: string[]; visited: string[] }) => {
      setIsSavingInterests(true);
      try {
        const hobbyIds = data.hobbies
          .map(h => Number(h))
          .filter((id): id is number => Number.isFinite(id));
        const result = await updateProfile({
          hobbyIds,
          languageCodes: data.languages,
          visitedCountryCodes: data.visited,
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
    },
    [updateProfile]
  );

  // This should never happen due to ProtectedRoute, but TypeScript needs this
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        <ProfileHeaderCard
          user={user}
          isEditing={isEditingProfile}
          isSaving={isSavingProfile}
          name={name}
          surname={surname}
          country={country}
          profileImagePath={profileImagePath}
          onEdit={handleEditProfile}
          onCancel={handleCancelProfile}
          onSave={handleSaveProfile}
          onNameChange={setName}
          onSurnameChange={setSurname}
          onCountryChange={setCountry}
          onProfileImagePathChange={setProfileImagePath}
        />

        <ProfileCompletionCard user={user} />

        <ProfileStatsCards user={user} />

        <AchievementsSection user={user} />

        <TravelInformationCard
          user={user}
          isEditing={isEditingInterests}
          isSaving={isSavingInterests}
          hobbies={hobbies}
          languages={languages}
          visited={visited}
          onEdit={handleEditInterests}
          onCancel={handleCancelInterests}
          onSave={handleSaveInterests}
          onHobbiesChange={setHobbies}
          onLanguagesChange={setLanguages}
          onVisitedChange={setVisited}
        />

        <AccountInformationCard
          user={user}
          isEditingProfile={isEditingProfile}
          isEditingInterests={isEditingInterests}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
