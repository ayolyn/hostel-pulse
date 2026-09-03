import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Campus Lifecycle',
  description: 'Interactive 3D map for housing, gigs, and services around LAUTECH.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
