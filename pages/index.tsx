import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user) {
      router.push('/account');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Dial a Service - Connect with Local Service Providers</title>
        <meta name="description" content="Find and connect with trusted service providers in Zambia and Namibia" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Welcome to Dial a Service
            </h1>
            <p className="text-xl text-secondary mb-8">
              Connect with trusted service providers in Zambia and Namibia
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="btn primary px-6 py-3 text-lg hover:shadow-primary-lg transition-all duration-200"
            >
              Get Started
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Find Local Providers</h3>
              </div>
              <p className="text-secondary">
                Easily find verified service providers in your area across various industries.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 1.536l-.105-.105A5.5 5.5 0 0018 10.5V6a5.5 5.5 0 00-11 0v4.5m11 0l-.105-.105M6 18.084l-.105.105A5.5 5.5 0 0012 21.5v-4.5m0-11V6a5.5 5.5 0 00-11 0v4.5m11 0l.105.105A5.5 5.5 0 0012 13.5V18a5.5 5.5 0 0011 0v-4.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Book Services</h3>
              </div>
              <p className="text-secondary">
                Schedule appointments with providers that fit your needs and availability.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Track Progress</h3>
              </div>
              <p className="text-secondary">
                Monitor your service requests and provider status in real-time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
