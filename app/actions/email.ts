
'use server';

import { sendNotificationEmail } from '@/lib/email/resend';
import { getEmailTemplate } from './emailTemplates';

export async function sendOnboardingEmail(email: string, name: string) {
    try {
        const html = getEmailTemplate({
            subHeading: 'WELCOME TO HOSTEL PULSE',
            title: `Welcome, ${name}!`,
            body: 'Welcome to the coolest student housing platform in Ogbomoso.<br><br>Make sure to complete your profile to get started and find your dream hostel.',
            buttonText: 'Complete Profile',
            buttonLink: 'https://hostelpulse.app/dashboard/student',
            showFallbackLink: true
        });
        const res = await sendNotificationEmail(email, 'Welcome to Hostel Pulse! 🎉', html);
        return { success: res.success };
    } catch (e) {
        console.error('Error in sendOnboardingEmail:', e);
        return { success: false };
    }
}

export async function sendComplianceEmail(email: string, name: string) {
    try {
        const html = getEmailTemplate({
            subHeading: 'COMPLIANCE UPDATE',
            title: 'Documents Submitted',
            body: `Hi ${name},<br><br>Your compliance documents have been submitted successfully. Please allow 24-48 hours for our team to review them. We will notify you once approved.`,
            buttonText: 'Go to Dashboard',
            buttonLink: 'https://hostelpulse.app/dashboard',
            showFallbackLink: false
        });
        const res = await sendNotificationEmail(email, 'Compliance Documents Submitted 📋', html);
        return { success: res.success };
    } catch (e) {
        console.error('Error in sendComplianceEmail:', e);
        return { success: false };
    }
}

