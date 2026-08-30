"use client";

import React, { useState } from "react";
import { createBlogPost } from "./actions";
import toast from "react-hot-toast";
import { BookOpen, Send, LayoutTemplate } from "lucide-react";
import Link from "next/link";

export default function BlogCMS() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "Housing Guide",
        image_url: "",
        read_time: "5 min read",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createBlogPost(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Blog post created successfully!");
            setFormData({
                title: "",
                excerpt: "",
                content: "",
                category: "Housing Guide",
                image_url: "",
                read_time: "5 min read",
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden w-full">
            <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                            ← Back to Dashboard
                        </Link>
                        <h2 className="text-xl font-black uppercase tracking-widest border-l border-white/10 pl-4">
                            Blog CMS
                        </h2>
                    </div>
                </header>

                <div className="p-8 max-w-4xl mx-auto w-full">
                    <div className="bg-[#1e293b] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <BookOpen className="w-8 h-8 text-[#BEF264]" />
                            <h3 className="text-2xl font-black uppercase tracking-tight">Create New Post</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#BEF264]/50 outline-none transition-colors"
                                        placeholder="e.g. Top 5 Hostels..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#BEF264]/50 outline-none transition-colors"
                                        placeholder="e.g. Spotlight"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Excerpt (Short Summary)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#BEF264]/50 outline-none transition-colors"
                                    placeholder="Brief summary for the card..."
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Image URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#BEF264]/50 outline-none transition-colors"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Content (Markdown / Raw Text)</label>
                                <textarea
                                    required
                                    rows={10}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#BEF264]/50 outline-none transition-colors font-mono text-sm"
                                    placeholder="Write your article here... Paragraphs will be separated by newlines."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Read Time</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full md:w-1/3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#BEF264]/50 outline-none transition-colors"
                                    placeholder="e.g. 5 min read"
                                    value={formData.read_time}
                                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#BEF264] hover:bg-[#a6d456] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-[#BEF264]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Publish Article
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
