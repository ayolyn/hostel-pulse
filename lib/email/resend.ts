import { Resend } from 'resend';

/**
 * Sends a notification email using Resend
 * 
 * @param to The recipient email address
 * @param subject The subject line of the email
 * @param htmlTemplate The HTML body of the email
 */
export async function sendNotificationEmail(to: string, subject: string, htmlTemplate: string) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not defined. Email will not be sent.');
            return { success: false, error: 'Missing RESEND_API_KEY' };
        }

        // Initialize inside the function to prevent build-time crashes when env vars are missing
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'Hostel Pulse <info@hostelpulse.app>',
            to: [to],
            subject: subject,
            html: htmlTemplate,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error: error.message };
        }

        console.log(`Email successfully sent to ${to}: ${data?.id}`);
        return { success: true, data };
    } catch (e: any) {
        // Handle gracefully without crashing main thread
        console.error('Failed to send notification email (caught exception):', e);
        return { success: false, error: e?.message || 'Unknown error' };
    }
}
