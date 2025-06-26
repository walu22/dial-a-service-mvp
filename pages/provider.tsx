import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

interface Job {
  id: number;
  created_at: string;
  category: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed';
  customer_id: string;
}

export default function ProviderPage() {
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage(error.message);
    else setMessage('Check your email for the magic link!');
  };

  const saveSkills = async () => {
    if (!userId) return;
    await supabase.from('providers').upsert({ id: userId, skills });
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .in('category', skills)
      .order('created_at');
    if (error) console.error(error);
    else setJobs(data as Job[]);
  };

  const acceptJob = async (jobId: number) => {
    if (!userId) return;
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'accepted', provider_id: userId })
      .eq('id', jobId);
    if (error) console.error(error);
    else fetchJobs();
  };

  useEffect(() => {
    if (skills.length) fetchJobs();
  }, [skills]);

  if (!userId)
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <Head>
          <title>Provider Login – Dial a Service</title>
        </Head>
        <h1>Provider Login</h1>
        <form onSubmit={handleLogin} style={{ marginTop: '2rem' }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.6rem', width: '250px' }}
          />
          <button type="submit" className="btn primary" style={{ marginLeft: '1rem' }}>
            Send magic link
          </button>
        </form>
        <p>{message}</p>
      </main>
    );

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <Head>
        <title>Provider Dashboard – Dial a Service</title>
      </Head>
      <h1>My Skills</h1>
      <div style={{ marginBottom: '1rem' }}>
        {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry'].map((cat) => (
          <label key={cat} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              value={cat}
              checked={skills.includes(cat)}
              onChange={(e) => {
                const val = e.target.value;
                setSkills((prev) =>
                  prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
                );
              }}
            />
            {' '}
            {cat}
          </label>
        ))}
        <button className="btn primary" style={{ marginLeft: '1rem' }} onClick={saveSkills}>
          Save
        </button>
      </div>

      <h2>Available Jobs</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map((job) => (
          <li key={job.id} style={{ margin: '1rem 0', borderBottom: '1px solid #e2e6ea', paddingBottom: '0.5rem' }}>
            <strong>{job.category}</strong> – {job.description}
            <button
              className="btn primary"
              style={{ marginLeft: '1rem' }}
              onClick={() => acceptJob(job.id)}
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
