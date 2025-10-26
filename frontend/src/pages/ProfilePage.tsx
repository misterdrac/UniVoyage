import React, { useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { UI_CONSTANTS } from '@/lib/constants';
import { updateUserProfile } from '@/data/mockUsers'; 

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out successfully");
  };

  if (!user) return null;

  // --- Lokalni “view model” (ne diramo AuthContext ni backend)
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // kopija usera za prikaz i formu
  const [current, setCurrent] = useState(user);
  const [form, setForm] = useState({
    firstName: current.profile.firstName || '',
    lastName: current.profile.lastName || '',
    dateOfBirth: current.profile.dateOfBirth || '',
    phoneNumber: current.profile.phoneNumber || '',
    countryOfResidence: current.profile.countryOfResidence || '',
    languages: (current.profile.languages || []).join(', '),
    countriesVisited: (current.profile.countriesVisited || []).join(', '),
    interests: (current.profile.interests || []).join(', '),
  });

  // avatar (data URL za preview)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(current.profile.profilePicture);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const dirty = useMemo(() => {
    const csv = (arr?: string[]) => (arr && arr.length ? arr.join(', ') : '');
    return (
      avatarDataUrl !== current.profile.profilePicture ||
      form.firstName !== current.profile.firstName ||
      form.lastName !== current.profile.lastName ||
      form.dateOfBirth !== current.profile.dateOfBirth ||
      form.phoneNumber !== current.profile.phoneNumber ||
      form.countryOfResidence !== current.profile.countryOfResidence ||
      form.languages !== csv(current.profile.languages) ||
      form.countriesVisited !== csv(current.profile.countriesVisited) ||
      form.interests !== csv(current.profile.interests)
    );
  }, [form, avatarDataUrl, current]);

  const setField = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const parseCsv = (s: string) =>
    s.split(',').map(x => x.trim()).filter(Boolean);

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Ime i prezime su obavezni.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      // simuliramo “upload” – samo koristimo data URL (nema backenda)
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth || '',
        phoneNumber: form.phoneNumber || '',
        countryOfResidence: form.countryOfResidence || '',
        languages: parseCsv(form.languages),
        countriesVisited: parseCsv(form.countriesVisited),
        interests: parseCsv(form.interests),
        profilePicture: avatarDataUrl, 
      };

      const updated = updateUserProfile(current.id, payload);
      if (!updated) throw new Error('Failed to update profile');

      // lokalni prikaz
      setCurrent(updated);
      setEditing(false);
      toast.success('Profil spremljen (lokalno)');
    } catch (e: any) {
      setError(e.message || 'Greška pri spremanju');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      firstName: current.profile.firstName || '',
      lastName: current.profile.lastName || '',
      dateOfBirth: current.profile.dateOfBirth || '',
      phoneNumber: current.profile.phoneNumber || '',
      countryOfResidence: current.profile.countryOfResidence || '',
      languages: (current.profile.languages || []).join(', '),
      countriesVisited: (current.profile.countriesVisited || []).join(', '),
      interests: (current.profile.interests || []).join(', '),
    });
    setAvatarDataUrl(current.profile.profilePicture);
    setError(null);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="shrink-0">
              {avatarDataUrl ? (
                <img
                  src={avatarDataUrl}
                  alt={`${form.firstName} ${form.lastName}`}
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

              {editing && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => setAvatarDataUrl(reader.result as string);
                      reader.readAsDataURL(f); // “mock upload”
                    }}
                  />
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      Promijeni avatar
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1">
              {!editing ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {current.profile.firstName} {current.profile.lastName}
                  </h2>
                  <p className="text-muted-foreground">{current.email}</p>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm">First name</span>
                    <input className="w-full border rounded-xl p-2" value={form.firstName} onChange={(e)=>setField('firstName', e.target.value)} />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm">Last name</span>
                    <input className="w-full border rounded-xl p-2" value={form.lastName} onChange={(e)=>setField('lastName', e.target.value)} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
          {!editing ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Date of Birth:</span> {current.profile.dateOfBirth || 'Not provided'}</p>
              <p><span className="font-medium">Phone:</span> {current.profile.phoneNumber || 'Not provided'}</p>
              <p><span className="font-medium">Country of Residence:</span> {current.profile.countryOfResidence || 'Not provided'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-sm">Date of Birth</span>
                <input className="w-full border rounded-xl p-2" placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChange={(e)=>setField('dateOfBirth', e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Phone</span>
                <input className="w-full border rounded-xl p-2" value={form.phoneNumber} onChange={(e)=>setField('phoneNumber', e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Country of Residence</span>
                <input className="w-full border rounded-xl p-2" value={form.countryOfResidence} onChange={(e)=>setField('countryOfResidence', e.target.value)} />
              </label>
              <label className="space-y-1 md:col-span-3">
                <span className="text-sm">Languages (comma separated)</span>
                <input className="w-full border rounded-xl p-2" value={form.languages} onChange={(e)=>setField('languages', e.target.value)} />
              </label>
              <label className="space-y-1 md:col-span-3">
                <span className="text-sm">Countries Visited (comma separated)</span>
                <input className="w-full border rounded-xl p-2" value={form.countriesVisited} onChange={(e)=>setField('countriesVisited', e.target.value)} />
              </label>
              <label className="space-y-1 md:col-span-3">
                <span className="text-sm">Interests (comma separated)</span>
                <input className="w-full border rounded-xl p-2" value={form.interests} onChange={(e)=>setField('interests', e.target.value)} />
              </label>
            </div>
          )}
        </div>

        {}
      </div>
    </div>
  );
};

export default ProfilePage;
