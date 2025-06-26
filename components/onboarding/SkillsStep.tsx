import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Skill {
  name: string;
  checked: boolean;
  description: string;
}

const SKILLS = [
  { name: 'Plumbing', description: 'Installation and repair of water systems' },
  { name: 'Electrical', description: 'Wiring, repairs, and installations' },
  { name: 'Cleaning', description: 'House cleaning and maintenance' },
  { name: 'Gardening', description: 'Landscaping and lawn care' },
  { name: 'Painting', description: 'Interior and exterior painting' },
  { name: 'Handyman', description: 'General repairs and maintenance' },
];

export default function SkillsStep() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const validate = () => {
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill');
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
          skills: selectedSkills,
        })
        .eq('id', supabase.auth.getUser().data.user?.id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      setError(err.message || 'Failed to save skills');
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

      <div className="space-y-4">
        {SKILLS.map((skill) => (
          <div key={skill.name} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={skill.name}
              checked={selectedSkills.includes(skill.name)}
              onChange={() => handleSkillToggle(skill.name)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor={skill.name} className="flex-1">
              <div className="font-medium">{skill.name}</div>
              <div className="text-sm text-gray-500">{skill.description}</div>
            </label>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        Select all services you can provide. You can add more later.
      </div>
    </div>
  );
}
