import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface BasicInfoData {
  yearsExperience: number;
  businessName: string;
  businessEmail: string;
}

export default function BasicInfoStep() {
  const [formData, setFormData] = useState<BasicInfoData>({
    yearsExperience: 0,
    businessName: '',
    businessEmail: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsExperience' ? parseInt(value) : value,
    }));
  };

  const validate = () => {
    if (!formData.businessName.trim()) {
      setError('Please enter your business name');
      return false;
    }
    if (!formData.businessEmail.includes('@')) {
      setError('Please enter a valid business email');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          business_name: formData.businessName,
          business_email: formData.businessEmail,
          years_experience: formData.yearsExperience,
        })
        .eq('id', supabase.auth.getUser().data.user?.id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      setError(err.message || 'Failed to save information');
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
        <label className="block text-sm font-medium mb-2">
          Years of Experience
        </label>
        <input
          type="number"
          name="yearsExperience"
          value={formData.yearsExperience}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          max="50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Business Name
        </label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
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
          name="businessEmail"
          value={formData.businessEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>
    </div>
  );
}
