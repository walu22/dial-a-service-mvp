import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

interface Job {
  id: number;
  created_at: string;
  customer_id: string;
  category: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed';
}

export default function CustomerPage() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);

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

  const submitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const { error } = await supabase.from('jobs').insert({
      customer_id: userId,
      category,
      description,
      status: 'pending',
    });
    if (error) setMessage(error.message);
    else {
      setMessage('Job posted!');
      setDescription('');
      fetchJobs();
    }
  };

  const fetchJobs = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setJobs(data as Job[]);
  };

  useEffect(() => {
    if (userId) fetchJobs();
  }, [userId]);

  if (!userId)
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <Head>
          <title>Customer – Dial a Service</title>
        </Head>
        <h1>Customer Login</h1>
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
        <title>Post a Job – Dial a Service</title>
      </Head>
      <h1>Post a Job</h1>
      <form onSubmit={submitJob} style={{ marginTop: '1.5rem' }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        >
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>Cleaning</option>
          <option>Carpentry</option>
        </select>
        <input
          type="text"
          placeholder="Describe the job"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button type="submit" className="btn primary" style={{ marginLeft: '1rem' }}>
          Submit
        </button>
      </form>
      <p>{message}</p>

      <h2 style={{ marginTop: '3rem' }}>My Jobs</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map((job) => (
          <li key={job.id} style={{ margin: '1rem 0', borderBottom: '1px solid #e2e6ea', paddingBottom: '0.5rem' }}>
            <strong>{job.category}</strong> – {job.description} (<em>{job.status}</em>)
          </li>
        ))}
      </ul>
    </main>
  );
}
