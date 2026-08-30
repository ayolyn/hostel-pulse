import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button } from '@react-email/components';

export const EscrowReleasedEmail = ({ propertyName = 'A Property', amount = '0' }: { propertyName?: string, amount?: string }) => (
    <Html>
        <Head />
        <Preview>Funds Released - Hostel Pulse</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px', margin: '40px auto' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>Funds Released to Wallet 💰</Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    Great news! The escrow funds of <strong>₦{amount}</strong> for <strong>{propertyName}</strong> have been released to your wallet.
                </Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    You can now withdraw these funds to your local bank account at any time.
                </Text>
                <Section style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Button href="https://hostelpulse.vercel.app/dashboard/agent?tab=wallet" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none' }}>
                        Go to Wallet
                    </Button>
                </Section>
            </Container>
        </Body>
    </Html>
);
