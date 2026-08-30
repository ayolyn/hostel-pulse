import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button } from '@react-email/components';

export const WelcomeEmail = ({ userName = 'Student' }: { userName?: string }) => (
    <Html>
        <Head />
        <Preview>Welcome to Hostel Pulse!</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px', margin: '40px auto' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome to Hostel Pulse, {userName}!</Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    We're thrilled to have you join our platform. Whether you're a student looking for a safe and comfortable space, or a provider listing top-tier accommodations, you've come to the right place.
                </Text>
                <Section style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Button href="https://hostelpulse.vercel.app/dashboard" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none' }}>
                        Go to Dashboard
                    </Button>
                </Section>
            </Container>
        </Body>
    </Html>
);
