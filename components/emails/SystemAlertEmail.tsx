import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button } from '@react-email/components';

export const SystemAlertEmail = ({ title = 'New Notification', message = '', link = '' }: { title?: string, message?: string, link?: string }) => (
    <Html>
        <Head />
        <Preview>{title} - Hostel Pulse</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '4px', margin: '40px auto' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{title}</Text>
                <Text style={{ fontSize: '16px', color: '#555', lineHeight: '1.5' }}>
                    {message}
                </Text>
                
                {link && link !== '#' && (
                    <Section style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Button href={`https://hostelpulse.app${link}`} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                            View Details
                        </Button>
                    </Section>
                )}
            </Container>
        </Body>
    </Html>
);
