import { useRouter } from 'next/router';
import { useAuth } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import TimeSlotManager from '../../components/provider/TimeSlotManager';
import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface Day {
  date: Date;
  jobs: Job[];
  hasTimeSlots: boolean;
}

export default function ProviderCalendar() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [week, setWeek] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadWeek(selectedDate);
  }, [user, router, selectedDate]);

  const loadWeek = async (date: Date) => {
    try {
      setLoading(true);
      setError('');

      // Get week range
      const start = startOfWeek(date);
      const end = endOfWeek(date);

      // Get jobs for the week
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          customers (full_name, phone)
        `)
        .eq('provider_id', user?.id)
        .gte('start_time', format(start, 'yyyy-MM-dd'))
        .lte('end_time', format(end, 'yyyy-MM-dd'))
        .order('start_time');

      if (jobsError) throw jobsError;

      // Check for time slots
      const { data: timeSlots, error: slotsError } = await supabase
        .from('time_slots')
        .select('start_time')
        .eq('provider_id', user?.id)
        .gte('start_time', format(start, 'yyyy-MM-dd'))
        .lte('end_time', format(end, 'yyyy-MM-dd'));

      if (slotsError) throw slotsError;

      // Group jobs by day and check for time slots
      const days: Day[] = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(start, i);
        const dayJobs = jobs?.filter(job => 
          isSameDay(new Date(job.start_time), day)
        ) || [];
        const hasTimeSlots = timeSlots?.some(slot => 
          isSameDay(new Date(slot.start_time), day)
        ) || false;
        days.push({ date: day, jobs: dayJobs, hasTimeSlots });
      }

      setWeek(days);
    } catch (err) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePrevWeek = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">My Calendar</h1>

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handlePrevWeek}
              className="btn neutral"
            >
              Previous Week
            </button>
            <div className="flex-1">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={handleNextWeek}
              className="btn neutral"
            >
              Next Week
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {week.map((day) => (
              <div
                key={format(day.date, 'yyyy-MM-dd')}
                className="bg-white border border-gray-200 rounded-lg shadow-sm h-full"
              >
                <div className="p-4 border-b">
                  <h3 className="font-medium">
                    {format(day.date, 'EEEE, MMMM d')}
                  </h3>
                </div>

                {day.jobs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No jobs scheduled
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 border-b last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{job.title}</h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(job.start_time), 'h:mma')} - {format(new Date(job.end_time), 'h:mma')}
                            </p>
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

                        <div className="space-y-1 text-sm">
                          <p>{job.description}</p>
                          <p className="text-gray-500">
                            Customer: {job.customers?.full_name}
                          </p>
                          <p className="text-gray-500">
                            Price: ${job.price.toFixed(2)}
                          </p>
                        </div>

                        {job.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleJobStatus(job.id, 'accepted')}
                              className="btn primary flex-1"
                            >
                              Accept
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
                            className="btn primary w-full mt-4"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Schedule New Job</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Plumbing Repair"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe the job details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 100.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="btn primary w-full"
              >
                Schedule Job
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
