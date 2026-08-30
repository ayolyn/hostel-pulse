"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/search", label: "Search", icon: Search },
        { href: "/saved", label: "Wishlist", icon: Heart },
        { href: "/dashboard", label: "Profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 w-full z-50 bg-white border-t border-gray-100 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16 px-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-primary/20 scale-110")} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
