import Link from "next/link";
import Image from "next/image";
import { HostelPulseLogo } from "@/components/ui/HostelPulseLogo";
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 py-8 md:py-24 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-16">

                {/* Brand Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 group">
                        <HostelPulseLogo variant="dark" size={36} />
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs font-medium">
                        The trust layer for Ogbomoso real estate. Secure escrow, verified listings, and physical inspections.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#BEF264]/10 hover:text-[#BEF264] transition-all border border-white/5">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#BEF264]/10 hover:text-[#BEF264] transition-all border border-white/5">
                            <Instagram className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Gig Economy Card */}
                <div className="hidden lg:col-span-1 bg-[#BEF264]/5 md:block p-6 md:p-5 rounded-2xl border border-[#BEF264]/20 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <h4 className="text-white font-black uppercase tracking-tight">Make Money</h4>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                        Join 500+ agents in Ogbomoso earning ₦100k+ monthly. List houses, manage inspections, get paid safely.
                    </p>
                    <Link href="/agent" className="block w-full bg-[#BEF264] text-black text-center py-3 md:py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-[#BEF264]/10">
                        Become a Verified Agent
                    </Link>
                </div>

                {/* Links Container for Mobile Grid */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-5">
                    {/* Explore Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6">Explore</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><Link href="/rent" className="hover:text-[#BEF264] transition-all">Hostels</Link></li>
                            <li><Link href="/search?category=Shop" className="hover:text-[#BEF264] transition-all">Shops</Link></li>
                            <li><Link href="/buy" className="hover:text-[#BEF264] transition-all">Lands</Link></li>
                            <li><Link href="/search?category=Shortlet" className="hover:text-[#BEF264] transition-all">Shortlets</Link></li>
                        </ul>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><Link href="/how-it-works" className="hover:text-[#BEF264] transition-all">How it Works</Link></li>
                            <li><Link href="/safety" className="hover:text-[#BEF264] transition-all">Safety Center</Link></li>
                            <li><Link href="/admin" className="hover:text-[#BEF264] transition-all">HQ Admin</Link></li>
                            <li><Link href="/contact" className="hover:text-[#BEF264] transition-all">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto mt-12 md:mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    &copy; {new Date().getFullYear()} HOSTELPULSE. Built for LAUTECH & Beyond.
                </p>
                <div className="flex gap-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <Link href="#" className="hover:text-white transition-all">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-all">Terms</Link>
                </div>
            </div>
        </footer>
    );
}
