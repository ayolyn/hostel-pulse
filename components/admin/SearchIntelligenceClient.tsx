'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { Search, TrendingUp, MapPin, DollarSign, ListFilter, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// --- Type Definitions ---
export interface SearchLog {
    id: string;
    search_term: string;
    category: string;
    min_budget: number;
    max_budget: number;
    location: string;
    created_at: string;
}

export interface SearchAggregations {
    totalSearches: number;
    mostDemandedArea: string;
    avgMaxBudget: number;
    topLocations: { name: string; count: number }[];
    categoryDemand: { name: string; value: number }[];
    budgetDistribution: { name: string; count: number }[];
    recentSearches: SearchLog[];
}

interface Props {
    data?: SearchAggregations;
}

// --- Mock Data Fallbacks ---
const MOCK_DATA: SearchAggregations = {
    totalSearches: 1254,
    mostDemandedArea: 'Under-G',
    avgMaxBudget: 155000,
    topLocations: [
        { name: 'Under-G', count: 450 },
        { name: 'Adenike', count: 320 },
        { name: 'Takie', count: 210 },
        { name: 'Aroje', count: 150 },
        { name: 'Stadium', count: 124 },
    ],
    categoryDemand: [
        { name: 'Hostel', value: 600 },
        { name: 'Self-Con', value: 400 },
        { name: 'Flat', value: 154 },
        { name: 'Shop', value: 100 },
    ],
    budgetDistribution: [
        { name: 'Under 100k', count: 120 },
        { name: '100k-150k', count: 450 },
        { name: '150k-200k', count: 380 },
        { name: '200k+', count: 304 },
    ],
    recentSearches: [
        { id: '1', search_term: 'self con in under-g', category: 'Self-Con', min_budget: 0, max_budget: 150000, location: 'Under-G', created_at: new Date().toISOString() },
        { id: '2', search_term: 'shop in takie', category: 'Shop', min_budget: 0, max_budget: 200000, location: 'Takie', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', search_term: '2 bedroom flat adenike', category: 'Flat', min_budget: 150000, max_budget: 250000, location: 'Adenike', created_at: new Date(Date.now() - 7200000).toISOString() },
    ]
};

const COLORS = ['#BEF264', '#0D9488', '#3B82F6', '#F59E0B', '#EF4444'];

export default function SearchIntelligenceClient({ data }: Props) {
    const [isMounted, setIsMounted] = useState(false);
    
    // Ensure Recharts only renders on client to avoid hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const displayData = data || MOCK_DATA;

    if (!isMounted) return <div className="p-8 text-center animate-pulse">Loading Intelligence Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Search Intelligence</h1>
                        <p className="text-sm text-gray-500 font-medium">Real-time student demand & market insights</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* 1. Top-Level Market KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#BEF264]/20 rounded-2xl flex items-center justify-center text-[#BEF264]">
                            <Search className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Searches</p>
                            <h3 className="text-3xl font-black text-gray-900">{displayData.totalSearches.toLocaleString()}</h3>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Top Area</p>
                            <h3 className="text-2xl font-black text-gray-900">{displayData.mostDemandedArea || 'N/A'}</h3>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Avg Max Budget</p>
                            <h3 className="text-2xl font-black text-gray-900">₦{displayData.avgMaxBudget.toLocaleString()}</h3>
                        </div>
                    </motion.div>
                </div>

                {/* 2. Visualization Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Locations BarChart */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                            Top Searched Locations
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={displayData.topLocations}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#BEF264" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Property Type Demand PieChart */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <ListFilter className="w-5 h-5 text-gray-400" />
                            Property Type Demand
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={displayData.categoryDemand}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {displayData.categoryDemand.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* 3. Budget Distribution Tracker */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        Budget Distribution
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData.budgetDistribution}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#BEF264" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#BEF264" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="count" stroke="#a3d64b" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 4. Live Search Feed (Data Table) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            Live Search Feed
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Date/Time</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Search Term</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Budget Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.recentSearches.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                                                {log.search_term || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                            {log.category || 'Any'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            {log.max_budget 
                                                ? `₦${(log.min_budget || 0).toLocaleString()} - ₦${log.max_budget.toLocaleString()}`
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {displayData.recentSearches.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No search logs available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
