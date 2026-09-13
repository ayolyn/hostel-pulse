"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { adminApproveProperty, adminRejectProperty, adminRequestChanges, adminUpdateVerification } from '@/app/actions/propertyModeration';
import { CheckCircle2, XCircle, AlertCircle, Eye, MapPin, Video, CheckSquare, Square, Loader2 } from 'lucide-react';

export function PropertiesTab() {
    const supabase = createClient();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subTab, setSubTab] = useState('pending');
    const [selectedProp, setSelectedProp] = useState<any | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Checkboxes state
    const [flags, setFlags] = useState({
        address_confirmed: false,
        price_confirmed: false,
        agent_confirmed: false,
        video_confirmed: false,
        availability_confirmed: false,
        verified_walkthrough: false
    });

    const fetchProperties = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setProperties(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const filteredProps = properties.filter(p => {
        if (subTab === 'pending') return p.status === 'pending';
        if (subTab === 'active') return p.status === 'active';
        if (subTab === 'changes') return p.status === 'changes_requested';
        if (subTab === 'rejected') return p.status === 'rejected';
        if (subTab === 'taken') return p.status === 'taken';
        return true;
    });

    const openProp = (p: any) => {
        setSelectedProp(p);
        setFlags({
            address_confirmed: p.address_confirmed || false,
            price_confirmed: p.price_confirmed || false,
            agent_confirmed: p.agent_confirmed || false,
            video_confirmed: p.video_confirmed || false,
            availability_confirmed: p.availability_confirmed || false,
            verified_walkthrough: p.verified_walkthrough || false,
        });
    };

    const toggleFlag = (key: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveFlags = async (method: 'physical' | 'remote' | null) => {
        if (!selectedProp) return;
        setActionLoading(true);
        try {
            await adminUpdateVerification(selectedProp.id, flags, method, selectedProp.verification_status);
            await fetchProperties();
            alert("Verification updated");
            setSelectedProp(null);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedProp) return;
        setActionLoading(true);
        try {
            await adminApproveProperty(selectedProp.id);
            await fetchProperties();
            setSelectedProp(null);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedProp) return;
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        setActionLoading(true);
        try {
            await adminRejectProperty(selectedProp.id, reason);
            await fetchProperties();
            setSelectedProp(null);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestChanges = async () => {
        if (!selectedProp) return;
        const reason = prompt("Enter changes requested:");
        if (!reason) return;
        setActionLoading(true);
        try {
            await adminRequestChanges(selectedProp.id, reason);
            await fetchProperties();
            setSelectedProp(null);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-white/10 pb-4">
                {['pending', 'active', 'changes', 'rejected', 'taken'].map(t => (
                    <button 
                        key={t}
                        onClick={() => { setSubTab(t); setSelectedProp(null); }}
                        className={"uppercase text-xs font-black tracking-widest px-4 py-2 rounded-xl transition-all " + (subTab === t ? "bg-[#BEF264] text-black" : "bg-white/5 text-white hover:bg-white/10")}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5 text-[#BEF264]" /> Loading...</div>
            ) : !selectedProp ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProps.map(p => (
                        <div key={p.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#BEF264]/50 cursor-pointer transition-all" onClick={() => openProp(p)}>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#BEF264] mb-1">{p.verification_status}</p>
                            <h3 className="font-bold text-lg text-white mb-2">{p.title}</h3>
                            <div className="flex justify-between items-center text-sm text-gray-400">
                                <span>₦{p.price.toLocaleString()}</span>
                                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {filteredProps.length === 0 && <p className="text-gray-500">No properties found in this tab.</p>}
                </div>
            ) : (
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <button onClick={() => setSelectedProp(null)} className="text-[#BEF264] text-xs font-bold mb-4 hover:underline">&larr; Back to List</button>
                            <h2 className="text-2xl font-black text-white">{selectedProp.title}</h2>
                            <p className="text-gray-400">ID: {selectedProp.id}</p>
                        </div>
                        <div className="flex gap-2">
                            <button disabled={actionLoading} onClick={handleApprove} className="bg-emerald-500 text-black px-4 py-2 font-black rounded-lg text-xs hover:bg-emerald-400">APPROVE</button>
                            <button disabled={actionLoading} onClick={handleRequestChanges} className="bg-amber-500 text-black px-4 py-2 font-black rounded-lg text-xs hover:bg-amber-400">REQUEST CHANGES</button>
                            <button disabled={actionLoading} onClick={handleReject} className="bg-red-500 text-white px-4 py-2 font-black rounded-lg text-xs hover:bg-red-400">REJECT</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-[#BEF264] font-black uppercase text-sm border-b border-white/10 pb-2">Property Details</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <span className="text-gray-400">Category</span><span className="text-white">{selectedProp.category}</span>
                                <span className="text-gray-400">Location</span><span className="text-white">{selectedProp.location}</span>
                                <span className="text-gray-400">Bedrooms</span><span className="text-white">{selectedProp.bedrooms}</span>
                                <span className="text-gray-400">Bathrooms</span><span className="text-white">{selectedProp.bathrooms}</span>
                                <span className="text-gray-400">Agent ID</span><span className="text-white text-xs truncate" title={selectedProp.agent_id}>{selectedProp.agent_id}</span>
                            </div>

                            <h3 className="text-[#BEF264] font-black uppercase text-sm border-b border-white/10 pb-2 mt-6">Financials</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <span className="text-gray-400">Annual Rent</span><span className="text-white">₦{Number(selectedProp.price).toLocaleString()}</span>
                                <span className="text-gray-400">Agent Fee</span><span className="text-white">₦{Number(selectedProp.agent_fee || 0).toLocaleString()}</span>
                                <span className="text-gray-400">Agreement Fee</span><span className="text-white">₦{Number(selectedProp.agreement_fee || 0).toLocaleString()}</span>
                                <span className="text-gray-400">Caution Fee</span><span className="text-white">₦{Number(selectedProp.caution_fee || 0).toLocaleString()}</span>
                                <span className="text-gray-400">Inspection Fee</span><span className="text-white">₦{Number(selectedProp.inspection_fee || 0).toLocaleString()}</span>
                                <span className="text-[#BEF264] font-black">TOTAL COST</span><span className="text-[#BEF264] font-black">₦{Number(selectedProp.total_move_in_cost || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[#BEF264] font-black uppercase text-sm border-b border-white/10 pb-2">Admin Verification</h3>
                            
                            <div className="space-y-2">
                                {Object.keys(flags).map(key => (
                                    <div key={key} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFlag(key as keyof typeof flags)}>
                                        {flags[key as keyof typeof flags] ? <CheckSquare className="text-[#BEF264] w-5 h-5" /> : <Square className="text-gray-500 w-5 h-5 group-hover:text-white" />}
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white uppercase tracking-wider text-[10px]">{key.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                <button disabled={actionLoading} onClick={() => handleSaveFlags('physical')} className="bg-[#BEF264]/20 text-[#BEF264] border border-[#BEF264] px-3 py-2 text-xs font-black rounded-lg">MARK AS PHYSICALLY INSPECTED</button>
                                <button disabled={actionLoading} onClick={() => handleSaveFlags('remote')} className="bg-blue-500/20 text-blue-400 border border-blue-500 px-3 py-2 text-xs font-black rounded-lg">MARK DETAILS CHECKED</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}