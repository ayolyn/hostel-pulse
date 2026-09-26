"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    adminApproveProperty, 
    adminRejectProperty, 
    adminRequestChanges, 
    adminUpdateVerification,
    adminGetPropertyReports,
    adminDismissReport,
    adminTakeDownReportedProperty
} from '@/app/actions/propertyModeration';
import { 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    AlertTriangle, 
    Eye, 
    MapPin, 
    Video, 
    CheckSquare, 
    Square, 
    Loader2, 
    ExternalLink, 
    ShieldAlert, 
    RefreshCw 
} from 'lucide-react';

export function PropertiesTab() {
    const supabase = createClient();
    const [properties, setProperties] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(false);
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

    const fetchReports = async () => {
        setReportsLoading(true);
        try {
            const data = await adminGetPropertyReports();
            setReports(data || []);
        } catch (err) {
            console.error("fetchReports error:", err);
        } finally {
            setReportsLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchReports();
    }, []);

    const filteredProps = properties.filter(p => {
        if (subTab === 'pending') return p.status === 'pending';
        if (subTab === 'active') return p.status === 'active';
        if (subTab === 'changes') return p.status === 'changes_requested';
        if (subTab === 'rejected') return p.status === 'rejected';
        if (subTab === 'taken') return p.status === 'taken';
        if (subTab === 'duplicates') return p.status === 'flagged_duplicate' || !!p.duplicate_match_property_id;
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

    const handleDismissReport = async (reportId: string) => {
        if (!confirm("Are you sure you want to dismiss this report?")) return;
        setActionLoading(true);
        try {
            await adminDismissReport(reportId);
            await fetchReports();
        } catch (err: any) {
            alert(err.message || "Failed to dismiss report");
        } finally {
            setActionLoading(false);
        }
    };

    const handleTakeDownProperty = async (reportId: string, propertyId: string) => {
        const note = prompt("Enter takedown reason / verification note:", "Taken down following report investigation.");
        if (note === null) return;
        setActionLoading(true);
        try {
            await adminTakeDownReportedProperty(reportId, propertyId, note);
            await Promise.all([fetchReports(), fetchProperties()]);
            alert("Listing taken down and report marked resolved.");
        } catch (err: any) {
            alert(err.message || "Failed to take down property");
        } finally {
            setActionLoading(false);
        }
    };

    const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
    const duplicatePropsCount = properties.filter(p => p.status === 'flagged_duplicate' || !!p.duplicate_match_property_id).length;

    return (
        <div className="space-y-6">
            <div className="flex gap-3 border-b border-white/10 pb-4 overflow-x-auto">
                {['pending', 'active', 'changes', 'rejected', 'taken', 'duplicates', 'reported'].map(t => {
                    const isReported = t === 'reported';
                    const isDuplicates = t === 'duplicates';
                    const isActive = subTab === t;
                    return (
                        <button 
                            key={t}
                            onClick={() => { 
                                setSubTab(t); 
                                setSelectedProp(null); 
                                if (isReported) fetchReports();
                            }}
                            className={"uppercase text-xs font-black tracking-widest px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 " + (isActive ? "bg-[#BEF264] text-black" : "bg-white/5 text-white hover:bg-white/10")}
                        >
                            <span>{t}</span>
                            {isDuplicates && duplicatePropsCount > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-orange-600 text-white' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'}`}>
                                    {duplicatePropsCount}
                                </span>
                            )}
                            {isReported && pendingReportsCount > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                                    {pendingReportsCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-white/70">
                    <Loader2 className="animate-spin w-5 h-5 text-[#BEF264]" /> 
                    <span>Loading properties...</span>
                </div>
            ) : subTab === 'reported' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div>
                            <h3 className="text-white font-bold text-base">Reported Listings</h3>
                            <p className="text-xs text-gray-400">Reports submitted by students regarding fraud, fake pricing, or unavailable listings.</p>
                        </div>
                        <button 
                            onClick={fetchReports}
                            disabled={reportsLoading}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#BEF264] text-xs font-bold rounded-lg border border-white/10 flex items-center gap-1.5 transition-all"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${reportsLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {reportsLoading && reports.length === 0 ? (
                        <div className="flex items-center gap-2 text-white/70 py-8">
                            <Loader2 className="animate-spin w-5 h-5 text-[#BEF264]" /> 
                            <span>Loading reports...</span>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                            <ShieldAlert className="w-10 h-10 mx-auto text-gray-500 mb-3" />
                            <p className="font-bold text-white text-base">No Property Reports</p>
                            <p className="text-xs text-gray-400 mt-1">No reported listings found. Student submissions will appear here for review.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((r: any) => {
                                const prop = r.properties;
                                const isPending = r.status === 'pending';
                                return (
                                    <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all space-y-4">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        r.status === 'pending' 
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                                                            : r.status === 'resolved' 
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                                            : 'bg-white/10 text-gray-400 border border-white/10'
                                                    }`}>
                                                        {r.status}
                                                    </span>
                                                    <span className="text-xs text-red-300 font-bold bg-red-950/60 border border-red-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                                        {r.reason}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Reported {new Date(r.created_at).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 flex-wrap pt-1">
                                                    <h4 className="font-bold text-white text-base">
                                                        {prop?.title || `Property ID: ${r.property_id}`}
                                                    </h4>
                                                    {prop?.location && (
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-gray-500" />
                                                            {prop.location}
                                                        </span>
                                                    )}
                                                    {prop?.price && (
                                                        <span className="text-xs font-bold text-[#BEF264]">
                                                            ₦{Number(prop.price).toLocaleString()}/yr
                                                        </span>
                                                    )}
                                                </div>

                                                {r.details && (
                                                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-300">
                                                        <span className="text-gray-500 font-bold uppercase text-[10px] block mb-1">Reporter Details:</span>
                                                        {r.details}
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-400 flex items-center gap-3 pt-1">
                                                    <span>Reporter: <strong className="text-white">{r.reporter?.full_name || r.reporter?.email || r.reporter_id?.slice?.(0, 8) || 'Anonymous'}</strong></span>
                                                    {r.reporter?.email && (
                                                        <span className="text-gray-500">({r.reporter.email})</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                                                <a 
                                                    href={`/property/${r.property_id}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                                    View Property
                                                </a>
                                                
                                                {isPending && (
                                                    <>
                                                        <button 
                                                            disabled={actionLoading}
                                                            onClick={() => handleDismissReport(r.id)}
                                                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-all disabled:opacity-50"
                                                        >
                                                            Dismiss
                                                        </button>
                                                        <button 
                                                            disabled={actionLoading}
                                                            onClick={() => handleTakeDownProperty(r.id, r.property_id)}
                                                            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-900/30 transition-all disabled:opacity-50"
                                                        >
                                                            Take Down
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : !selectedProp ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProps.map(p => (
                        <div key={p.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#BEF264]/50 cursor-pointer transition-all" onClick={() => openProp(p)}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] uppercase font-black tracking-widest text-[#BEF264]">{p.verification_status}</p>
                                {(p.status === 'flagged_duplicate' || p.duplicate_confidence_score) && (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                        {p.duplicate_confidence_score || 88}% Match
                                    </span>
                                )}
                            </div>
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
                    {selectedProp.duplicate_match_property_id && (
                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <span className="text-orange-400 font-black text-xs uppercase tracking-wider block">
                                    ⚠️ Visual Collision Flagged ({selectedProp.duplicate_confidence_score || 88}% Match)
                                </span>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    Identified as potential duplicate of listing ID: {selectedProp.duplicate_match_property_id}
                                </p>
                            </div>
                            <a 
                                href="/hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c?tab=duplicates"
                                className="px-3.5 py-2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-orange-400 transition-colors"
                            >
                                Open Duplicate Review Queue
                            </a>
                        </div>
                    )}
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