import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text } from '@react-email/components';

export const WithdrawalApprovedEmail = ({ amount = '0', bankName = 'your bank', accountNumber = '' }: { amount?: string, bankName?: string, accountNumber?: string }) => (
    <Html>
        <Head />
        <Preview>Withdrawal Approved - Hostel Pulse</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px', margin: '40px auto' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>Withdrawal Approved! 💸</Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    Your withdrawal request of <strong>₦{amount}</strong> has been successfully approved by the Admin team.
                </Text>
                <Text style={{ fontSize: '16px', color: '#555' }}>
                    The funds are being transferred to your <strong>{bankName}</strong> account ending in <strong>{accountNumber.slice(-4)}</strong>. Please allow some time for the funds to reflect in your bank account.
                </Text>
            </Container>
        </Body>
    </Html>
);
