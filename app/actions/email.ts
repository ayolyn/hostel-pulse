
'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOnboardingEmail(email: string, name: string) {
    try {
        await resend.emails.send({
            from: 'Hostel Pulse <hello@hostel-pulse.com>',
            to: email,
            subject: 'Welcome to Hostel Pulse! ??',
            html: `<h1>Welcome, ${name}!</h1><p>Hey babe! Welcome to the coolest housing platform in Ogbomoso. Make sure to complete your profile to get started!</p>`
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
            html: `<h1>Hi ${name},</h1><p>Your compliance documents have been submitted successfully. Please allow 24-48 hours for our team to review them. We will notify you once approved!</p>`
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}
