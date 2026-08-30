import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function BlogPostPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    
    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !post) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/50">
                <PublicHeader />
                <main className="pt-40 px-6 max-w-3xl mx-auto w-full pb-24 text-center">
                    <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">Article Not Found</h1>
                    <p className="text-gray-500 mb-8">This article may have been removed or the link is invalid.</p>
                    <Link href="/blog" className="bg-[#BEF264] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a6d456] transition-all shadow-lg">
                        Back to Journal
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
            <PublicHeader />
            
            <main className="pt-32 pb-24">
                <article className="max-w-3xl mx-auto px-6 w-full">
                    
                    <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-xs uppercase tracking-widest mb-10 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Journal
                    </Link>

                    {/* Article Header */}
                    <header className="mb-12">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="bg-[#BEF264] text-black px-3 py-1 rounded-full">{post.category}</span>
                            <span className="text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-gray-400">{post.read_time}</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
                            {post.title}
                        </h1>
                        
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {post.excerpt}
                        </p>
                    </header>
                </article>

                {/* Hero Image */}
                {post.image_url && (
                    <div className="w-full max-w-6xl mx-auto px-6 mb-16">
                        <div className="relative aspect-[21/9] w-full rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-neutral-800">
                            <Image 
                                src={post.image_url} 
                                alt={post.title} 
                                fill 
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <div className="max-w-3xl mx-auto px-6 w-full">
                    <div className="prose prose-lg max-w-none">
                        {/* We are just splitting mock text by newlines for paragraph breaks since it's just raw text */}
                        {post.content.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx} className="mb-6 text-gray-600 dark:text-gray-300 leading-loose text-lg font-medium">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    <hr className="my-12 border-gray-100 dark:border-white/5" />
                    
                    {/* Share & Author placeholder */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center font-black text-gray-400 dark:text-neutral-500 uppercase">
                                HQ
                            </div>
                            <div>
                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">HostelPulse HQ</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">Editorial Team</p>
                            </div>
                        </div>
                        
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://hostelpulse.com.ng/blog/${post.id}`} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-500 px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-blue-100 transition-colors">
                            Share on Twitter
                        </a>
                    </div>
                </div>

            </main>
        </div>
    );
}
