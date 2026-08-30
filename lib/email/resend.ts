/**
 * Sends a notification email using Resend API via raw fetch to avoid Edge runtime crashes.
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

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Hostel Pulse <info@hostelpulse.app>',
                to: [to],
                subject: subject,
                html: htmlTemplate,
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Resend API Error:', data);
            return { success: false, error: data.message };
        }

        console.log(`Email successfully sent to ${to}: ${data?.id}`);
        return { success: true, data };
    } catch (e: any) {
        // Handle gracefully without crashing main thread
        console.error('Failed to send notification email (caught exception):', e);
        return { success: false, error: e?.message || 'Unknown error' };
    }
}
