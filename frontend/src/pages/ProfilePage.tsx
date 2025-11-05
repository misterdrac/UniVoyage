import React, { useState, useCallback } from 'react';
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
  useProfileImage,
} from '@/components/profile';

const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, uploadProfilePicture, isLoading } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingInterests, setIsSavingInterests] = useState(false);

  // Custom hooks for form and image management
  const {
    firstName,
    setFirstName,
    surname,
    setSurname,
    country,
    setCountry,
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

  const {
    isUploadingImage,
    imagePreview,
    fileInputRef,
    handleImageClick,
    handleImageChange,
    clearImagePreview,
  } = useProfileImage({
    uploadProfilePicture,
  });

  // Handlers
  const handleLogout = useCallback(() => {
    logout();
    toast.success("You've been logged out successfully");
  }, [logout]);

  const handleEditProfile = useCallback(() => {
    setIsEditingProfile(true);
  }, []);

  const handleCancelProfile = useCallback(() => {
    resetProfileForm();
    clearImagePreview();
    setIsEditingProfile(false);
  }, [resetProfileForm, clearImagePreview]);

  const handleEditInterests = useCallback(() => {
    setIsEditingInterests(true);
  }, []);

  const handleCancelInterests = useCallback(() => {
    resetInterestsForm();
    setIsEditingInterests(false);
  }, [resetInterestsForm]);

  const handleSaveProfile = useCallback(
    async (data: { firstName: string; surname?: string; country?: string }) => {
      setIsSavingProfile(true);
      try {
        const result = await updateProfile(data);
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
        const result = await updateProfile(data);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        <ProfileHeaderCard
          user={user}
          isEditing={isEditingProfile}
          isSaving={isSavingProfile}
          isLoading={isLoading}
          firstName={firstName}
          surname={surname}
          country={country}
          imagePreview={imagePreview}
          isUploadingImage={isUploadingImage}
          fileInputRef={fileInputRef}
          onEdit={handleEditProfile}
          onCancel={handleCancelProfile}
          onSave={handleSaveProfile}
          onFirstNameChange={setFirstName}
          onSurnameChange={setSurname}
          onCountryChange={setCountry}
          onImageClick={handleImageClick}
          onImageChange={handleImageChange}
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
