import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function IDVerificationStep() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an ID document');
      return false;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const user = supabase.auth.getUser().data.user;
      if (!user) throw new Error('Not authenticated');

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('provider-ids')
        .upload(
          `id-${user.id}.jpg`,
          file,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-ids')
        .getPublicUrl(`id-${user.id}.jpg`);

      // Update providers table
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          id_url: publicUrl,
          verified: false, // Will be set to true by admin
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      setError(err.message || 'Failed to upload ID');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">Upload ID Document</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please upload a clear photo of your government-issued ID.
          This will be verified by our team before you can start accepting jobs.
        </p>

        <div className="space-y-4">
          {preview ? (
            <div className="relative w-full h-64 overflow-hidden rounded-lg">
              <img
                src={preview}
                alt="ID preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <label className="cursor-pointer">
                <div className="text-gray-500">
                  <div className="text-xl mb-2">Click or drag image here</div>
                  <div className="text-sm text-gray-400">
                    JPG, PNG, or PDF. Max 5MB.
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Your account will be reviewed by our team. You'll receive an email once it's verified.
      </div>
    </div>
  );
}
