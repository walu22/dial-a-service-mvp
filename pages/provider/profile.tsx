import { useRouter } from 'next/router';
import { useAuth } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';

interface ProfileData {
  full_name: string;
  phone: string;
  business_name: string;
  business_email: string;
  years_experience: number;
  bio: string;
  profile_picture_url: string | null;
}

export default function ProviderProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    business_name: '',
    business_email: '',
    years_experience: 0,
    bio: '',
    profile_picture_url: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type and size
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = supabase.auth.getUser().data.user;
      if (!user) throw new Error('Not authenticated');

      // Upload profile picture if changed
      let profilePictureUrl = profile.profile_picture_url;
      if (file) {
        const { error: uploadError } = await supabase.storage
          .from('provider-profiles')
          .upload(
            `profile-${user.id}.jpg`,
            file,
            {
              cacheControl: '3600',
              upsert: true,
            }
          );

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('provider-profiles')
          .getPublicUrl(`profile-${user.id}.jpg`);

        profilePictureUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          business_name: profile.business_name,
          business_email: profile.business_email,
          years_experience: profile.years_experience,
          bio: profile.bio,
          profile_picture_url: profilePictureUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push('/provider/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'years_experience' ? parseInt(value) : value,
    }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Current profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                  {profile.full_name ? profile.full_name[0].toUpperCase() : 'P'}
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                pattern="[0-9]{10,15}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="business_name"
                value={profile.business_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Business Email
              </label>
              <input
                type="email"
                name="business_email"
                value={profile.business_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="years_experience"
                value={profile.years_experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                placeholder="Tell customers about your experience and services..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn primary w-full"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
