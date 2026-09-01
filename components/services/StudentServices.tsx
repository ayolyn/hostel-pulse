'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Truck, Droplets, Flame, Shirt, ShoppingBag, Clock, CheckCircle, ArrowRight, ShieldCheck, MapPin, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { bookStudentService } from '@/app/actions/services';
import toast from 'react-hot-toast';

export function StudentServices() {
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const services = [
        {
            id: 'laundry',
            title: 'Laundry Service',
            icon: Shirt,
            desc: 'Professional wash, dry, and fold. Pickup from your hostel.',
            cost: 3500,
            unit: 'per bag',
            fee: 300,
            color: 'blue'
        },
        {
            id: 'gas',
            title: 'Gas Refill',
            icon: Flame,
            desc: 'Fast LPG cooking gas delivery. Picked up and returned filled.',
            cost: 15000,
            unit: '12.5kg refill',
            fee: 500,
            color: 'orange'
        },
        {
            id: 'water',
            title: 'Water Delivery',
            icon: Droplets,
            desc: 'Clean water tankers for hostels with dry wells.',
            cost: 12000,
            unit: 'full tanker',
            fee: 1000,
            color: 'sky'
        }
    ];

    const handleBooking = async (service: any) => {
        setLoading(service.id);
        const totalCost = service.cost + service.fee;
        
        try {
            const result = await bookStudentService({
                serviceType: service.title,
                details: { unit: service.unit, base_cost: service.cost },
                totalCost: totalCost,
                serviceFee: service.fee
            });
            
            if (result.error) {
                if (result.error.includes('Insufficient funds')) {
                    toast.error(
                        (t) => (
                            <div className="flex flex-col gap-2">
                                <span className="font-bold">Insufficient Wallet Balance</span>
                                <span className="text-sm">You need ₦{totalCost.toLocaleString()} to book this service.</span>
                                <button 
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        router.push('/dashboard/student?tab=wallet');
                                    }}
                                    className="bg-black text-white px-3 py-1.5 rounded-lg text-xs mt-1 self-start"
                                >
                                    Fund Wallet
                                </button>
                            </div>
                        ),
                        { duration: 6000 }
                    );
                } else {
                    toast.error(result.error);
                }
            } else {
                toast.success('Funds escrowed successfully!');
                setSelectedService({...service, success: true});
            }
        } catch (error: any) {
            toast.error('Failed to book service.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Student Services</h2>
                <p className="text-gray-500 font-medium text-sm">Verified local providers delivered to your doorstep in Ogbomoso.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {services.map((service) => (
                    <div key={service.id} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-5 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all flex flex-col group relative overflow-hidden">
                        {/* Status badge in background style */}
                        <div className={`absolute top-0 right-0 p-6 opacity-5 translate-x-4 -translate-y-4 group-hover:opacity-10 transition-opacity`}>
                            <service.icon className="w-32 h-32" />
                        </div>

                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gray-50 dark:bg-white/5`}>
                            <service.icon className={`w-8 h-8 ${service.id === 'gas' ? 'text-orange-500' : service.id === 'water' ? 'text-sky-500' : 'text-blue-500'}`} />
                        </div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3">{service.title}</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">{service.desc}</p>

                        <div className="mt-auto space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Standard Price</p>
                                    <p className="text-2xl font-black text-black dark:text-white">₦{service.cost.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{service.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0D9488] mb-1">Convenience Fee</p>
                                    <p className="text-lg font-black text-[#0D9488]">₦{service.fee.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleBooking(service)}
                                    disabled={loading === service.id}
                                    className="bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading === service.id ? 'Booking...' : 'Book Pickup'}
                                </button>
                                <button 
                                    onClick={async () => {
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (!user) return;
                                        
                                        // Use a consistent ID for service support
                                        // For now we use 'service-support' as a placeholder or a real UUID if found
                                        const supportId = '00000000-0000-0000-0000-000000000000'; // System Support UUID
                                        
                                        await supabase.from('messages').insert({
                                            sender_id: user.id,
                                            receiver_id: supportId,
                                            content: `Hi! I need assistance with ${service.title}.`
                                        });
                                        router.push(`/messages/${supportId}`);
                                    }}
                                    className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-white/10 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Chat
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Success Overlay if selected */}
            {selectedService?.success && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedService(null)} />
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl text-center max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[#BEF264]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-[#BEF264]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Request Sent!</h3>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-relaxed mb-8">
                            A verified delivery partner will contact you shortly to coordinate the {selectedService.title.toLowerCase()}.
                        </p>
                        <button 
                            onClick={() => setSelectedService(null)}
                            className="w-full bg-black dark:bg-[#BEF264] text-[#BEF264] dark:text-black py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
