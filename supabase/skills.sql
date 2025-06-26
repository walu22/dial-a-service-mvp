-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create skills categories
INSERT INTO skills (name, description, category) VALUES
  ('Plumbing', 'Installation and repair of water systems', 'Home Services'),
  ('Electrical', 'Wiring, repairs, and installations', 'Home Services'),
  ('Cleaning', 'House cleaning and maintenance', 'Home Services'),
  ('Gardening', 'Landscaping and lawn care', 'Home Services'),
  ('Painting', 'Interior and exterior painting', 'Home Services'),
  ('Handyman', 'General repairs and maintenance', 'Home Services'),
  ('Carpentry', 'Woodworking and furniture repair', 'Home Services'),
  ('HVAC', 'Heating, ventilation, and air conditioning', 'Home Services'),
  ('Pest Control', 'Insect and rodent management', 'Home Services'),
  ('Landscaping', 'Garden design and maintenance', 'Home Services'),
  ('Roofing', 'Roof repair and installation', 'Home Services'),
  ('Flooring', 'Floor installation and repair', 'Home Services'),
  ('Window Cleaning', 'Residential and commercial window cleaning', 'Home Services'),
  ('Moving', 'Local and long-distance moving services', 'Home Services'),
  ('Computer Repair', 'Hardware and software troubleshooting', 'Tech Services'),
  ('Networking', 'Home and office network setup', 'Tech Services'),
  ('Event Setup', 'Event space preparation and cleanup', 'Event Services'),
  ('Party Planning', 'Full event coordination and execution', 'Event Services'),
  ('Catering', 'Food preparation and service', 'Event Services'),
  ('Photography', 'Event and portrait photography', 'Creative Services'),
  ('Video Production', 'Event and promotional video creation', 'Creative Services'),
  ('Graphic Design', 'Digital and print design services', 'Creative Services'),
  ('Social Media', 'Content creation and management', 'Marketing Services'),
  ('Marketing', 'Digital marketing and advertising', 'Marketing Services'),
  ('Website Design', 'Custom website development', 'Tech Services'),
  ('App Development', 'Mobile and web application development', 'Tech Services');

-- Add RLS policies
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public skills view" ON skills
  FOR SELECT
  USING (true);

CREATE POLICY "No updates allowed" ON skills
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
