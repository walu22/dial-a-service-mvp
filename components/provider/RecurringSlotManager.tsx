import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';

interface RecurringSlot {
  id: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  status: string;
  notes: string | null;
}

interface RecurringSlotForm {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  status: string;
  notes: string;
}

export default function RecurringSlotManager() {
  const [slots, setSlots] = useState<RecurringSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RecurringSlotForm>({
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
    status: 'available',
    notes: '',
  });

  useEffect(() => {
    loadRecurringSlots();
  }, []);

  const loadRecurringSlots = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: slotsData, error: slotsError } = await supabase
        .from('recurring_slots')
        .select('*')
        .eq('provider_id', supabase.auth.getUser().data.user?.id)
        .order('start_time');

      if (slotsError) throw slotsError;
      setSlots(slotsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load recurring slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = async (slotId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('recurring_slots')
        .update({
          status,
          notes: notes || null,
        })
        .eq('id', slotId);

      if (error) throw error;
      await loadRecurringSlots();
    } catch (err) {
      setError(err.message || 'Failed to update recurring slot');
    }
  };

  const handleAddSlot = async () => {
    try {
      const { error } = await supabase
        .from('recurring_slots')
        .insert({
          provider_id: supabase.auth.getUser().data.user?.id,
          start_time: form.startTime,
          end_time: form.endTime,
          days_of_week: form.daysOfWeek,
          status: form.status,
          notes: form.notes,
        });

      if (error) throw error;
      setShowForm(false);
      await loadRecurringSlots();
    } catch (err) {
      setError(err.message || 'Failed to add recurring slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this recurring slot?')) return;

    try {
      const { error } = await supabase
        .from('recurring_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      await loadRecurringSlots();
    } catch (err) {
      setError(err.message || 'Failed to delete recurring slot');
    }
  };

  const renderRecurringSlots = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return slots.map((slot) => (
      <div
        key={slot.id}
        className={`p-4 rounded-lg mb-4 ${
          slot.status === 'available' ? 'bg-green-50 border-green-200' :
          slot.status === 'unavailable' ? 'bg-gray-50 border-gray-200' :
          'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">
              {format(new Date(`1970-01-01T${slot.start_time}`), 'HH:mm')} - 
              {format(new Date(`1970-01-01T${slot.end_time}`), 'HH:mm')}
            </h3>
            <div className="flex gap-1 mt-1">
              {daysOfWeek.map((day, index) => (
                <span
                  key={day}
                  className={`px-2 py-1 rounded-full text-xs ${
                    slot.days_of_week.includes(index)
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
            {slot.notes && <p className="text-sm text-gray-500 mt-2">{slot.notes}</p>}
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
    ));
  };

  const renderDayCheckboxes = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek.map((day, index) => (
      <div key={day} className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`day-${index}`}
          checked={form.daysOfWeek.includes(index)}
          onChange={(e) => {
            if (e.target.checked) {
              setForm({ ...form, daysOfWeek: [...form.daysOfWeek, index] });
            } else {
              setForm({ ...form, daysOfWeek: form.daysOfWeek.filter(d => d !== index) });
            }
          }}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor={`day-${index}`} className="text-sm">
          {day}
        </label>
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
        <h2 className="text-xl font-bold">Recurring Time Slots</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn primary"
        >
          {showForm ? 'Cancel' : 'Add Recurring Slot'}
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
              <label className="block text-sm font-medium mb-2">Days of Week</label>
              <div className="space-y-2">
                {renderDayCheckboxes()}
              </div>
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
              Add Recurring Slot
            </button>
          </form>
        </div>
      )}

      {renderRecurringSlots()}
    </div>
  );
}
