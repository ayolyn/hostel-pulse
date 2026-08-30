export const runtime = 'edge';
import { HeroSection } from '@/components/home/HeroSection';
import { UniversalSearch } from '@/components/home/UniversalSearch';
import { AboutSection } from '@/components/home/AboutSection';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { FAQSection } from '@/components/home/FAQSection';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function LandingPage() {
    return (
        <div className="min-h-screen selection:bg-[#BEF264]/30 selection:text-[#BEF264]">
            <PublicHeader />
            <main>
                {/* Section 1: Hero */}
                <HeroSection />

                {/* Section 2: Universal Search */}
                <div className="relative z-20 -mt-16 sm:-mt-20 px-6">
                    <UniversalSearch />
                </div>

                {/* Section 3: Why HOSTELPULSE */}
                <AboutSection />

                {/* Section 4: Social Proof */}
                <SocialProofSection />

                {/* Section 5: FAQ */}
                <FAQSection />
            </main>
        </div>
    );
}
