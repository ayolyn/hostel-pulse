'use client';
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { Calculator as CalcIcon, TrendingUp, PieChart, Home } from 'lucide-react';

export default function CalculatorPage() {
    const [propertyValue, setPropertyValue] = useState(50000000);
    const [rentPerRoom, setRentPerRoom] = useState(250000);
    const [rooms, setRooms] = useState(12);
    const [occupancy, setOccupancy] = useState(90);

    const [results, setResults] = useState({
        annualRevenue: 0,
        grossYield: 0,
        monthlyIncome: 0,
    });

    useEffect(() => {
        const potentialRevenue = rentPerRoom * rooms;
        const actualRevenue = potentialRevenue * (occupancy / 100);
        const yieldPercent = (actualRevenue / propertyValue) * 100;
        
        setResults({
            annualRevenue: actualRevenue,
            monthlyIncome: actualRevenue / 12,
            grossYield: isNaN(yieldPercent) || !isFinite(yieldPercent) ? 0 : yieldPercent,
        });
    }, [propertyValue, rentPerRoom, rooms, occupancy]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <PublicHeader />
            <main className="pt-32 px-6 max-w-5xl mx-auto w-full pb-24">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-2xl mb-4">
                        <CalcIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-3xl sm:text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                        Investment Calculator
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto">
                        Estimate your potential returns on student housing investments in Ogbomoso. Calculate yields, occupancy rates, and break-even points.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        
                        {/* Interactive Controls */}
                        <div className="p-5 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-gray-100 space-y-8">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-6">Property Parameters</h2>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Property Value (₦)</label>
                                            <span className="font-black text-[#0D9488]">₦{propertyValue.toLocaleString()}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="5000000" max="200000000" step="1000000"
                                            value={propertyValue} 
                                            onChange={e => setPropertyValue(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Expected Rent per Room (₦)</label>
                                            <span className="font-black text-[#0D9488]">₦{rentPerRoom.toLocaleString()}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="50000" max="1000000" step="10000"
                                            value={rentPerRoom} 
                                            onChange={e => setRentPerRoom(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Number of Rooms</label>
                                            <span className="font-black text-[#0D9488]">{rooms}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="1" max="100" step="1"
                                            value={rooms} 
                                            onChange={e => setRooms(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Occupancy Rate (%)</label>
                                            <span className="font-black text-[#0D9488]">{occupancy}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="10" max="100" step="5"
                                            value={occupancy} 
                                            onChange={e => setOccupancy(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Results Panel */}
                        <div className="bg-gray-900 p-5 lg:col-span-2 text-white flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#BEF264] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
                            
                            <h2 className="text-xl font-black uppercase tracking-tight text-[#BEF264] mb-8 relative z-10">Estimation Results</h2>
                            
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Annual Revenue</p>
                                    <p className="text-2xl sm:text-3xl font-black tracking-tighter">₦{results.annualRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                
                                <div className="h-px bg-white/10 w-full" />
                                
                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Monthly Income Estim.</p>
                                    <p className="text-2xl font-black tracking-tighter">₦{results.monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                                
                                <div className="h-px bg-white/10 w-full" />

                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Gross Rental Yield</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl sm:text-2xl sm:text-2xl sm:text-3xl font-black text-[#BEF264] tracking-tighter">{results.grossYield.toFixed(1)}%</p>
                                        <span className="text-gray-400 text-sm font-medium">/ year</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Educational Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <TrendingUp className="w-8 h-8 text-blue-500 mb-4" />
                        <h3 className="font-black text-gray-900 uppercase tracking-tight mb-2">High Demand</h3>
                        <p className="text-gray-500 text-sm">Ogbomoso student population grows by 8% annually, ensuring consistent tenant demand.</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <PieChart className="w-8 h-8 text-emerald-500 mb-4" />
                        <h3 className="font-black text-gray-900 uppercase tracking-tight mb-2">Better Yields</h3>
                        <p className="text-gray-500 text-sm">Student hostels typically offer 12-15% annual rental yields compared to 6% for residential.</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <Home className="w-8 h-8 text-purple-500 mb-4" />
                        <h3 className="font-black text-gray-900 uppercase tracking-tight mb-2">Asset Appreciation</h3>
                        <p className="text-gray-500 text-sm">Properties near LAUTECH gate historically appreciate by 15-20% year over year.</p>
                    </div>
                </div>

            </main>
            
        </div>
    );
}
