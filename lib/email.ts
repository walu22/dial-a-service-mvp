import sgMail from '@sendgrid/mail';
import { supabase } from '../supabaseClient';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface VerificationEmailData {
  to: string;
  providerName: string;
  businessName: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export async function sendVerificationEmail(data: VerificationEmailData) {
  const msg = {
    to: data.to,
    from: 'noreply@dialaservice.com',
    subject: `Your Dial a Service Account ${data.status === 'approved' ? 'has been approved' : 'needs attention'}`,
    templateId: data.status === 'approved' ? 'd-TEMPLATE_ID_APPROVED' : 'd-TEMPLATE_ID_REJECTED',
    dynamic_template_data: {
      providerName: data.providerName,
      businessName: data.businessName,
      status: data.status,
      rejectionReason: data.rejectionReason || '',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`,
    },
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Create email templates
export const emailTemplates = {
  APPROVED: `
    <h1>Account Approved</h1>
    <p>Dear {{providerName}},</p>
    <p>Congratulations! Your Dial a Service account has been approved.</p>
    <p>You can now start accepting jobs for your business: {{businessName}}.</p>
    <p><a href="{{loginUrl}}" class="btn-primary">Login to Dashboard</a></p>
  `,

  REJECTED: `
    <h1>Account Review Update</h1>
    <p>Dear {{providerName}},</p>
    <p>We've reviewed your application for {{businessName}}.</p>
    <p>Unfortunately, we need some adjustments:</p>
    <p>{{rejectionReason}}</p>
    <p>You can resubmit your application through the login page.</p>
    <p><a href="{{loginUrl}}" class="btn-primary">Login to Resubmit</a></p>
  `,
};
