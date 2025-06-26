import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@supabase/auth-helpers-react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Step {
  title: string;
  content: JSX.Element;
}

interface WizardProps {
  steps: Step[];
  onComplete: () => void;
}

export default function ProviderOnboardingWizard({ steps, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500">
              {steps.map((_, index) => (
                <span key={index} className="flex-1">
                  {index === currentStep ? (
                    <span className="text-primary font-medium">{steps[index].title}</span>
                  ) : (
                    steps[index].title
                  )}
                </span>
              ))}
            </div>
            <div className="flex">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 ${index < currentStep ? 'bg-primary' : 'bg-gray-200'} h-1 rounded-full`}
                />
              ))}
            </div>
          </div>

          {/* Current step content */}
          {steps[currentStep].content}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="btn neutral hover:bg-neutral/90"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn primary"
            >
              {currentStep === steps.length - 1 ? 'Complete Onboarding' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
