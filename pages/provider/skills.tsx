import { useRouter } from 'next/router';
import { useAuth } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function ProviderSkills() {
  const router = useRouter();
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadSkills();
  }, [user, router]);

  const loadSkills = async () => {
    try {
      // Get all available skills
      const { data: allSkills, error: skillsError } = await supabase
        .from('skills')
        .select('*');

      if (skillsError) throw skillsError;

      // Get provider's selected skills
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('skills')
        .eq('id', user?.id)
        .single();

      if (providerError) throw providerError;

      setSkills(allSkills || []);
      setSelectedSkills(provider?.skills || []);
    } catch (err) {
      setError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId]
    );
  };

  const handleSubmit = async () => {
    try {
      const user = supabase.auth.getUser().data.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('providers')
        .update({
          skills: selectedSkills,
        })
        .eq('id', user.id);

      if (error) throw error;

      router.push('/provider/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update skills');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Skills</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSkills.includes(skill.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSkillToggle(skill.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{skill.name}</h3>
                  {selectedSkills.includes(skill.id) && (
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-500">{skill.description}</p>
                <p className="mt-2 text-xs text-gray-400">Category: {skill.category}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="btn primary w-full"
          >
            Save Skills
          </button>
        </div>
      </div>
    </Layout>
  );
}
