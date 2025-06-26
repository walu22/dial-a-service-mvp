import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

interface TimeSlotForm {
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
}

export default function TimeSlotManager({ date }: { date: Date }) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TimeSlotForm>({
    startTime: format(startOfDay(date), 'HH:mm'),
    endTime: format(endOfDay(date), 'HH:mm'),
    status: 'available',
    notes: '',
  });

  useEffect(() => {
    loadTimeSlots();
  }, [date]);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: slotsData, error: slotsError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('provider_id', supabase.auth.getUser().data.user?.id)
        .gte('start_time', format(startOfDay(date), 'yyyy-MM-dd'))
        .lte('end_time', format(endOfDay(date), 'yyyy-MM-dd'))
        .order('start_time');

      if (slotsError) throw slotsError;
      setSlots(slotsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = async (slotId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({
          status,
          notes: notes || null,
        })
        .eq('id', slotId);

      if (error) throw error;
      await loadTimeSlots();
    } catch (err) {
      setError(err.message || 'Failed to update time slot');
    }
  };

  const handleAddSlot = async () => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .insert({
          provider_id: supabase.auth.getUser().data.user?.id,
          start_time: format(new Date(date.toDateString() + ' ' + form.startTime), 'yyyy-MM-dd HH:mm'),
          end_time: format(new Date(date.toDateString() + ' ' + form.endTime), 'yyyy-MM-dd HH:mm'),
          status: form.status,
          notes: form.notes,
        });

      if (error) throw error;
      setShowForm(false);
      await loadTimeSlots();
    } catch (err) {
      setError(err.message || 'Failed to add time slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      await loadTimeSlots();
    } catch (err) {
      setError(err.message || 'Failed to delete time slot');
    }
  };

  const renderTimeSlots = () => {
    const slotsByHour: { [key: string]: TimeSlot[] } = {};
    
    // Group slots by start hour
    slots.forEach(slot => {
      const hour = format(new Date(slot.start_time), 'HH');
      if (!slotsByHour[hour]) slotsByHour[hour] = [];
      slotsByHour[hour].push(slot);
    });

    return Object.entries(slotsByHour).map(([hour, slots]) => (
      <div key={hour} className="mb-4">
        <h3 className="text-lg font-medium mb-2">{hour}:00</h3>
        <div className="space-y-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-3 rounded-lg ${
                slot.status === 'available' ? 'bg-green-50 border-green-200' :
                slot.status === 'reserved' ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">
                    {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                  </p>
                  {slot.notes && <p className="text-sm text-gray-500">{slot.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSlotChange(slot.id, 'available')}
                    className="btn neutral text-sm"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleSlotChange(slot.id, 'unavailable')}
                    className="btn neutral text-sm"
                  >
                    Unavailable
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="btn neutral text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Time Slots for {format(date, 'EEEE, MMMM d, yyyy')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn primary"
        >
          {showForm ? 'Cancel' : 'Add Time Slot'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddSlot();
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn primary w-full"
            >
              Add Time Slot
            </button>
          </form>
        </div>
      )}

      {renderTimeSlots()}
    </div>
  );
}
