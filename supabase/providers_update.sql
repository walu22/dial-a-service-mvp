-- Add additional fields to providers table
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS profile_picture_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS total_jobs integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_jobs integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings numeric(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_providers_skills ON providers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(average_rating);
CREATE INDEX IF NOT EXISTS idx_providers_last_active ON providers(last_active_at);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_providers_updated_at();

-- Add trigger to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_last_active
  BEFORE UPDATE ON providers
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_last_active_at();
