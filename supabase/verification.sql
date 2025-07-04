-- Add verification status field
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_approved_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add RLS policies for verification status
ALTER POLICY "providers owner select" ON providers
SET ROW LEVEL SECURITY TO true
WITH CHECK (
  auth.uid() = id
  OR auth.role() = 'admin'
);

ALTER POLICY "providers owner update" ON providers
SET ROW LEVEL SECURITY TO true
WITH CHECK (
  auth.uid() = id
  OR auth.role() = 'admin'
);
