"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, MousePointerClick, Zap, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Removed mock data generator

export default function AnalyticsTab({ userId }: { userId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        impressions: 0,
        views: 0,
        leads: 0,
        ctr: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            const supabase = createClient();
            try {
                // Fetch properties owned by this user
                const { data: properties, error: propErr } = await supabase
                    .from('properties')
                    .select('id')
                    .eq('landlord_id', userId);
                
                if (propErr) throw propErr;

                const propertyIds = properties?.map((p: any) => p.id) || [];
                
                if (propertyIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch analytics for the last 30 days
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const { data: rawEvents, error: evErr } = await supabase
                    .from('property_analytics')
                    .select('event_type, created_at')
                    .in('property_id', propertyIds)
                    .gte('created_at', thirtyDaysAgo);

                if (evErr) throw evErr;

                // Group by date
                const grouped: Record<string, { views: number; leads: number; impressions: number }> = {};
                
                // Initialize last 30 days empty
                for (let i = 29; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    grouped[dateStr] = { views: 0, leads: 0, impressions: 0 };
                }

                rawEvents?.forEach((ev: any) => {
                    const d = new Date(ev.created_at);
                    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (grouped[dateStr]) {
                        if (ev.event_type === 'view') grouped[dateStr].views += 1;
                        if (ev.event_type === 'lead') grouped[dateStr].leads += 1;
                        if (ev.event_type === 'impression') grouped[dateStr].impressions += 1;
                    }
                });

                const formattedData = Object.keys(grouped).map(date => ({
                    date,
                    ...grouped[date]
                }));

                setData(formattedData);

                const totalImp = formattedData.reduce((sum, item) => sum + item.impressions, 0);
                const totalViews = formattedData.reduce((sum, item) => sum + item.views, 0);
                const totalLeads = formattedData.reduce((sum, item) => sum + item.leads, 0);
                
                setStats({
                    impressions: totalImp,
                    views: totalViews,
                    leads: totalLeads,
                    ctr: totalImp > 0 ? (totalViews / totalImp) * 100 : 0,
                });

            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [userId]);

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-white/5 p-4 md:p-5 shadow-sm">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Analytics & Performance</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Track your property views, leads, and market reach over the last 30 days.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Total Impressions</span>
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Eye className="w-4 h-4" />
                        </div>
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.impressions.toLocaleString()}</span>
                </div>
                
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Total Views</span>
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-[#BEF264]/20 flex items-center justify-center text-green-600 dark:text-[#BEF264]">
                            <MousePointerClick className="w-4 h-4" />
                        </div>
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.views.toLocaleString()}</span>
                </div>
                
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Total Leads</span>
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <MessageCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.leads.toLocaleString()}</span>
                </div>
                
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Click-Through Rate</span>
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.ctr.toFixed(1)}%</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 rounded-2xl p-6 h-[400px]">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Performance Over 30 Days</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6b7280' }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 800, textTransform: 'uppercase' }}
                            labelStyle={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="views" name="Views" stroke="#BEF264" strokeWidth={4} dot={{ r: 4, fill: '#BEF264', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="leads" name="Leads" stroke="#f97316" strokeWidth={3} dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
