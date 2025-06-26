-- Create recurring time slots table
CREATE TABLE IF NOT EXISTS recurring_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- Array of 0-6 representing Monday-Sunday
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_days_of_week CHECK (array_length(days_of_week, 1) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_slots_provider ON recurring_slots(provider_id);
CREATE INDEX IF NOT EXISTS idx_recurring_slots_status ON recurring_slots(status);

-- Add RLS policies
ALTER TABLE recurring_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own recurring slots" ON recurring_slots
  FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage their own recurring slots" ON recurring_slots
  FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_recurring_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recurring_slots_updated_at
  BEFORE UPDATE ON recurring_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_slots_updated_at();

-- Create function to generate time slots from recurring patterns
CREATE OR REPLACE FUNCTION generate_time_slots_for_week(
  provider_id UUID,
  week_start_date DATE
) RETURNS SETOF time_slots AS $$
DECLARE
  slot record;
  slot_date DATE;
BEGIN
  -- First delete existing slots for this week
  DELETE FROM time_slots
  WHERE provider_id = $1
    AND start_time >= $2
    AND start_time < $2 + interval '7 days';

  -- Insert new slots based on recurring patterns
  FOR slot IN
    SELECT * FROM recurring_slots
    WHERE provider_id = $1
  LOOP
    FOR i IN 0..6 LOOP
      -- Check if this day is in the days_of_week array
      IF slot.days_of_week @> ARRAY[i]::integer[] THEN
        slot_date := $2 + interval '1 day' * i;
        
        INSERT INTO time_slots (
          provider_id,
          start_time,
          end_time,
          status,
          notes
        ) VALUES (
          $1,
          slot_date + slot.start_time,
          slot_date + slot.end_time,
          slot.status,
          slot.notes
        );
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT * FROM time_slots
  WHERE provider_id = $1
    AND start_time >= $2
    AND start_time < $2 + interval '7 days'
  ORDER BY start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
