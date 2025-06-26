-- Add scheduling fields to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS start_time timestamptz,
ADD COLUMN IF NOT EXISTS end_time timestamptz,
ADD COLUMN IF NOT EXISTS duration_minutes integer,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_provider_date ON jobs(provider_id, start_time);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_date ON jobs(customer_id, start_time);
CREATE INDEX IF NOT EXISTS idx_jobs_status_date ON jobs(status, start_time);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();
