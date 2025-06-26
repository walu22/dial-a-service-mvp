import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const user = useUser();
  const isProtectedRoute = router.pathname !== '/' && router.pathname !== '/auth/signin';

  useEffect(() => {
    if (!user && isProtectedRoute) {
      router.push('/');
    }
  }, [user, isProtectedRoute]);

  if (!user && isProtectedRoute) {
    return null;
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Dial a Service</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <Link href="/admin" className="btn neutral">
                  Admin
                </Link>
              )}
              <Link href="/account" className="btn neutral">
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="btn neutral"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
