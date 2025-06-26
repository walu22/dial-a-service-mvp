-- Create time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- available, reserved, unavailable
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_slots_provider ON time_slots(provider_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots(status);

-- Add RLS policies
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own slots" ON time_slots
  FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage their own slots" ON time_slots
  FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_time_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_time_slots_updated_at();
