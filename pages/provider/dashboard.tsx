import { useRouter } from 'next/router';
import { useAuth } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  customer_name: string;
  customer_phone: string;
  created_at: string;
}

interface ProviderStats {
  totalJobs: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<ProviderStats>({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadProviderData();

    // Set up real-time subscription
    const { data: { subscription } } = supabase
      .channel('provider-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `provider_id=eq.${user.id}`,
        },
        (payload) => {
          loadProviderData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, router]);

  const loadProviderData = async () => {
    try {
      // Load stats
      const { data: statsData, error: statsError } = await supabase
        .from('providers')
        .select(`
          total_jobs,
          completed_jobs,
          total_earnings,
          average_rating
        `)
        .eq('id', user?.id)
        .single();

      if (statsError) throw statsError;

      // Load jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          customers (full_name, phone)
        `)
        .eq('provider_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (jobsError) throw jobsError;

      setStats({
        totalJobs: statsData.total_jobs || 0,
        completedJobs: statsData.completed_jobs || 0,
        totalEarnings: statsData.total_earnings || 0,
        averageRating: statsData.average_rating || 0,
      });
      setJobs(jobsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleJobStatus = async (jobId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId);

      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Failed to update job status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-primary/10 p-6 rounded-lg">
            <h3 className="text-primary font-medium">Total Jobs</h3>
            <p className="text-2xl font-semibold mt-2">{stats.totalJobs}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-green-600 font-medium">Completed Jobs</h3>
            <p className="text-2xl font-semibold mt-2">{stats.completedJobs}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-yellow-600 font-medium">Total Earnings</h3>
            <p className="text-2xl font-semibold mt-2">${stats.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-blue-600 font-medium">Average Rating</h3>
            <div className="flex items-center mt-2">
              <span className="text-2xl font-semibold">{stats.averageRating.toFixed(1)}</span>
              <span className="text-yellow-400 ml-2">★</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Jobs</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
              No jobs yet. Start accepting jobs to grow your business!
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">{job.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Customer:</span> {job.customers?.full_name}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ${job.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {job.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJobStatus(job.id, 'accepted')}
                        className="btn primary flex-1"
                      >
                        Accept Job
                      </button>
                      <button
                        onClick={() => handleJobStatus(job.id, 'rejected')}
                        className="btn neutral flex-1"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {job.status === 'accepted' && (
                    <button
                      onClick={() => handleJobStatus(job.id, 'completed')}
                      className="btn primary w-full"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/provider/profile')}
                className="btn primary w-full"
              >
                Edit Profile
              </button>
              <button
                onClick={() => router.push('/provider/skills')}
                className="btn neutral w-full"
              >
                Manage Skills
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Support</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/provider/support')}
                className="btn neutral w-full"
              >
                Contact Support
              </button>
              <button
                onClick={() => router.push('/provider/faq')}
                className="btn neutral w-full"
              >
                FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
