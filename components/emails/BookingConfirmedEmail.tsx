import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button } from '@react-email/components';

export const BookingConfirmedEmail = ({ propertyName = 'A Property', checkInDate = 'TBD', amount = '0' }: { propertyName?: string, checkInDate?: string, amount?: string }) => (
    <Html>
        <Head />
        <Preview>Your Booking is Confirmed - Hostel Pulse</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px', margin: '40px auto' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>Booking Confirmed! 🎉</Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    Your booking for <strong>{propertyName}</strong> has been successfully processed and your funds of <strong>₦{amount}</strong> are safely locked in Escrow.
                </Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    <strong>Check-in Date:</strong> {checkInDate}
                </Text>
                <Section style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Button href="https://hostelpulse.vercel.app/dashboard/student?tab=wallet" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none' }}>
                        View Wallet Details
                    </Button>
                </Section>
            </Container>
        </Body>
    </Html>
);
