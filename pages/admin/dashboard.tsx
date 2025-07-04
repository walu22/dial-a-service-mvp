import { useAuth } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';

interface Provider {
  id: string;
  full_name: string;
  business_name: string;
  years_experience: number;
  skills: string[];
  verified: boolean; // Added the verified field
  verification_status: string;
  verification_requested_at: string | null;
  rejection_reason: string | null;
  id_url: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    // Check if user is admin
    if (user.email !== 'mubitaw@uth.gov.zm') {
      window.location.href = '/';
      return;
    }

    // Fetch pending providers
    loadProviders();

    // Set up real-time subscription
    const { data: { subscription } } = supabase
      .channel('providers-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'providers',
        },
        (payload) => {
          loadProviders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('verification_status', 'pending')
        .order('verification_requested_at', { ascending: true });

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (provider: Provider, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const { error } = await supabase.rpc('send_verification_email', {
        provider_id: provider.id,
        status: status,
        reason: reason || null,
      });

      if (error) throw error;

      // Show success message
      const message = status === 'approved' 
        ? 'Provider approved and email sent successfully'
        : 'Provider rejected and email notification sent';
      
      alert(message);
    } catch (err) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Provider Verification Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {providers.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 p-6 rounded-lg">
            No pending providers to verify.
          </div>
        ) : (
          <div className="space-y-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{provider.full_name}</h3>
                    <p className="text-sm text-gray-500">{provider.business_name}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Requested: {new Date(provider.verification_requested_at!).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Years of Experience: {provider.years_experience}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {provider.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerification(provider, 'approved')}
                      className="btn primary flex-1"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve & Send Email
                      </span>
                    </button>
                    <button
                      onClick={() => handleVerification(provider, 'rejected', 'Incomplete information')}
                      className="btn neutral flex-1"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject & Send Email
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
