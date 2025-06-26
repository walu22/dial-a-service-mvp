import { useRouter } from 'next/router';
import { useAuth } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';

export default function PendingVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Check verification status
    checkVerificationStatus();

    // Set up real-time subscription
    const { data: { subscription } } = supabase
      .channel('providers-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'providers',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          checkVerificationStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, router]);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: provider } = await supabase
        .from('providers')
        .select('verified, verification_status')
        .eq('id', user.id)
        .single();

      if (!provider) {
        setStatus('pending');
        return;
      }

      if (provider.verified) {
        setStatus('approved');
        router.push('/provider/dashboard');
      } else if (provider.verification_status === 'rejected') {
        setStatus('rejected');
      } else {
        setStatus('pending');
      }
    } catch (err) {
      setError(err.message || 'Failed to check verification status');
    }
  };

  const resendVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('providers')
        .update({
          verification_status: 'pending',
          verification_requested_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setStatus('pending');
    } catch (err) {
      setError(err.message || 'Failed to request verification');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Verification Status</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {status === 'pending' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Pending Verification</h2>
              <p className="mb-4">
                Your account is currently being reviewed by our team. This usually takes 1-3 business days.
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">What to Expect:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>We review your ID document and business information</li>
                  <li>We verify your professional credentials</li>
                  <li>We check your references and background</li>
                </ul>
              </div>
            </div>

            <button
              onClick={resendVerification}
              className="btn primary w-full"
            >
              Resend Verification Request
            </button>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Verification Approved!</h2>
            <p>You can now start accepting jobs. Redirecting to your dashboard...</p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Verification Rejected</h2>
            <p className="mb-4">
              Your verification request has been rejected. Please check the following:
            </p>
            <div className="space-y-2">
              <ul className="list-disc list-inside text-red-600">
                <li>Is your ID document clear and legible?</li>
                <li>Is your business information complete?</li>
                <li>Do you meet our minimum experience requirements?</li>
              </ul>
              <button
                onClick={resendVerification}
                className="btn primary mt-4"
              >
                Resubmit Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
