-- Create function to send verification email
CREATE OR REPLACE FUNCTION send_verification_email(
  provider_id uuid,
  status text,
  reason text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  provider_data RECORD;
BEGIN
  -- Get provider data
  SELECT p.*, a.email
  INTO provider_data
  FROM providers p
  JOIN auth.users a ON p.id = a.id
  WHERE p.id = provider_id;

  -- Send email based on status
  IF status = 'approved' THEN
    PERFORM 
      http_post(
        'https://api.sendgrid.com/v3/mail/send',
        json_build_object(
          'personalizations', json_build_array(
            json_build_object(
              'to', json_build_array(
                json_build_object(
                  'email', provider_data.email
                )
              ),
              'dynamic_template_data', json_build_object(
                'providerName', provider_data.full_name,
                'businessName', provider_data.business_name,
                'status', status,
                'loginUrl', 'https://dialaservice.com/auth/signin'
              )
            )
          ),
          'from', json_build_object(
            'email', 'noreply@dialaservice.com'
          ),
          'template_id', 'd-TEMPLATE_ID_APPROVED'
        )::text,
        ARRAY[
          'Authorization: Bearer ' || current_setting('sendgrid.api_key'),
          'Content-Type: application/json'
        ]
      );
  ELSE
    PERFORM 
      http_post(
        'https://api.sendgrid.com/v3/mail/send',
        json_build_object(
          'personalizations', json_build_array(
            json_build_object(
              'to', json_build_array(
                json_build_object(
                  'email', provider_data.email
                )
              ),
              'dynamic_template_data', json_build_object(
                'providerName', provider_data.full_name,
                'businessName', provider_data.business_name,
                'status', status,
                'rejectionReason', reason,
                'loginUrl', 'https://dialaservice.com/auth/signin'
              )
            )
          ),
          'from', json_build_object(
            'email', 'noreply@dialaservice.com'
          ),
          'template_id', 'd-TEMPLATE_ID_REJECTED'
        )::text,
        ARRAY[
          'Authorization: Bearer ' || current_setting('sendgrid.api_key'),
          'Content-Type: application/json'
        ]
      );
  END IF;

  -- Update provider status
  UPDATE providers
  SET
    verified = (status = 'approved'), -- Set boolean verified flag
    verification_status = status,
    verification_approved_at = CASE WHEN status = 'approved' THEN NOW() ELSE verification_approved_at END, -- Preserve approval time if already approved
    verification_rejected_at = CASE WHEN status = 'rejected' THEN NOW() ELSE verification_rejected_at END, -- Preserve rejection time if already rejected
    rejection_reason = reason
  WHERE id = provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admin role
GRANT EXECUTE ON FUNCTION send_verification_email TO admin;
