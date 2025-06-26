import ProviderOnboardingWizard from '../../components/ProviderOnboardingWizard';
import BasicInfoStep from '../../components/onboarding/BasicInfoStep';
import SkillsStep from '../../components/onboarding/SkillsStep';
import IDVerificationStep from '../../components/onboarding/IDVerificationStep';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function ProviderOnboardPage() {
  const router = useRouter();

  const steps = [
    {
      title: 'Basic Information',
      content: <BasicInfoStep />,
    },
    {
      title: 'Skills & Experience',
      content: <SkillsStep />,
    },
    {
      title: 'ID Verification',
      content: <IDVerificationStep />,
    },
  ];

  const onComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get provider data
      const { data: provider } = await supabase
        .from('providers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!provider) throw new Error('Provider not found');

      // Redirect based on verification status
      if (provider.verified) {
        router.push('/provider/dashboard');
      } else {
        router.push('/provider/pending');
      }
    } catch (err) {
      console.error('Error completing onboarding:', err);
      router.push('/');
    }
  };

  return <ProviderOnboardingWizard steps={steps} onComplete={onComplete} />;
}
