import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function BlogPage() {
    const supabase = await createClient();
    const { data: POSTS } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (!POSTS || POSTS.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-neutral-900">
                <PublicHeader />
                <main className="pt-32 px-6 max-w-7xl mx-auto w-full pb-24 text-center">
                    <BookOpen className="w-16 h-16 text-gray-200 dark:text-neutral-800 mx-auto mb-4" />
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">No Articles Yet</h1>
                </main>
            </div>
        );
    }

    const featuredPost = POSTS[0];
    const recentPosts = POSTS.slice(1);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-neutral-900">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-7xl mx-auto w-full pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs rounded-full mb-4">
                            <BookOpen className="w-4 h-4" />
                            HOSTELPULSE Journal
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-3xl sm:text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 max-w-2xl">
                            Insights for Students & Investors
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl text-lg">
                            Tips on finding the best hostels, passing your exams, and maximizing rental yields in Ogbomoso.
                        </p>
                    </div>
                </div>

                {/* Featured Post */}
                <div className="bg-gray-900 rounded-[2.5rem] p-4 md:p-6 text-white flex flex-col md:flex-row gap-6 mb-16 items-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900 to-transparent z-10 hidden md:block" />

                    <div className="relative w-full md:w-1/2 aspect-video md:aspect-square md:absolute md:right-0 md:top-0 md:bottom-0 rounded-3xl md:rounded-none overflow-hidden z-0 bg-gray-800">
                        {featuredPost.image_url && (
                            <Image
                                src={featuredPost.image_url}
                                alt={featuredPost.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        )}
                    </div>

                    <div className="relative z-20 md:w-1/2 space-y-6">
                        <span className="inline-block px-3 py-1 bg-[#BEF264] text-black font-black uppercase tracking-widest text-xs rounded-full">
                            {featuredPost.category}
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl sm:text-2xl sm:text-3xl font-black tracking-tight leading-none">
                            {featuredPost.title}
                        </h2>
                        <p className="text-gray-400 font-medium text-lg max-w-lg">
                            {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-bold">
                            <span>{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{featuredPost.read_time}</span>
                        </div>
                        <Link href={`/blog/${featuredPost.id}`} className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
                            Read Article <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Recent Posts Grid */}
                {recentPosts.length > 0 && (
                    <>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Latest Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.id}`} className="block group">
                                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-5 shrink-0 bg-gray-100 dark:bg-neutral-800 border border-white/5">
                                        {post.image_url && (
                                            <Image
                                                src={post.image_url}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                                            {post.category}
                                        </div>
                                    </div>
                                    <div className="space-y-3 px-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{post.read_time}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}
