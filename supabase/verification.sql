-- Add verification status field
ALTER TABLE providers
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

-- Create admin function to handle verification
CREATE OR REPLACE FUNCTION handle_provider_verification(
  provider_id uuid,
  status text,
  reason text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF status = 'approved' THEN
    UPDATE providers
    SET 
      verified = true,
      verification_status = 'approved',
      verification_approved_at = NOW(),
      verification_rejected_at = NULL,
      rejection_reason = NULL
    WHERE id = provider_id;
  ELSIF status = 'rejected' THEN
    UPDATE providers
    SET 
      verified = false,
      verification_status = 'rejected',
      verification_rejected_at = NOW(),
      rejection_reason = reason
    WHERE id = provider_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admin role
GRANT EXECUTE ON FUNCTION handle_provider_verification TO admin;
