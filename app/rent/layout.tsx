import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent Secure Hostels',
  description: 'Find 100% escrow-protected hostels in Ogbomoso.',
};

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
