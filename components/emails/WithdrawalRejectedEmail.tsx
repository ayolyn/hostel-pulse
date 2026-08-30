import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text } from '@react-email/components';

export const WithdrawalRejectedEmail = ({ amount = '0' }: { amount?: string }) => (
    <Html>
        <Head />
        <Preview>Withdrawal Rejected - Hostel Pulse</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px', margin: '40px auto' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>Withdrawal Rejected ❌</Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    Your withdrawal request of <strong>₦{amount}</strong> was rejected by the Admin team.
                </Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    The funds have been returned to your Hostel Pulse wallet. If you believe this is an error, please ensure your bank details are correct and try again, or contact support.
                </Text>
            </Container>
        </Body>
    </Html>
);
