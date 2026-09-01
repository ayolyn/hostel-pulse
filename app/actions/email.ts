
'use server';

import { Resend } from 'resend';
import { getEmailTemplate } from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOnboardingEmail(email: string, name: string) {
    try {
        await resend.emails.send({
            from: 'Hostel Pulse <hello@hostel-pulse.com>',
            to: email,
            subject: 'Welcome to Hostel Pulse! ??',
            html: getEmailTemplate({
                subHeading: 'WELCOME TO HOSTEL PULSE',
                title: `Welcome, ${name}!`,
                body: 'Hey babe! Welcome to the coolest student housing platform in Ogbomoso.<br><br>Make sure to complete your profile to get started and find your dream hostel.',
                buttonText: 'Complete Profile',
                buttonLink: 'https://hostel-pulse.pages.dev/dashboard/student',
                showFallbackLink: true
            })
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}

export async function sendComplianceEmail(email: string, name: string) {
    try {
        await resend.emails.send({
            from: 'Hostel Pulse <hello@hostel-pulse.com>',
            to: email,
            subject: 'Compliance Documents Submitted ???',
            html: getEmailTemplate({
                subHeading: 'COMPLIANCE UPDATE',
                title: 'Documents Submitted',
                body: `Hi ${name},<br><br>Your compliance documents have been submitted successfully. Please allow 24-48 hours for our team to review them. We will notify you once approved.`,
                buttonText: 'Go to Dashboard',
                buttonLink: 'https://hostel-pulse.pages.dev',
                showFallbackLink: false
            })
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}
