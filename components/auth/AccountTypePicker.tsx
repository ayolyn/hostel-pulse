"use client";

import React, { useState } from 'react';
import { User, Home, ShieldCheck, Building2 } from 'lucide-react';

interface AccountTypePickerProps {
    onSelect: (roleId: string) => void;
    initialRole?: string;
}

const AccountTypePicker: React.FC<AccountTypePickerProps> = ({ onSelect, initialRole = 'buyer' }) => {
    const [selectedRole, setSelectedRole] = useState(initialRole);

    const roles = [
        { id: 'buyer', title: 'Student / Renter', icon: <User />, desc: 'Find a hostel near Under-G or Adenike.' },
        { id: 'landlord', title: 'Landlord', icon: <Home />, desc: 'I own a house and want direct tenants.' },
        { id: 'agent', title: 'Real Estate Agent', icon: <ShieldCheck />, desc: 'I manage multiple properties for leads.' },
        { id: 'hostel', title: 'Hostel Business', icon: <Building2 />, desc: 'Corporate accounts for private hostels.' },
    ];

    const currentRole = roles.find(r => r.id === selectedRole);

    return (
        <div className="max-w-2xl w-full mx-auto p-6 bg-[#121212] rounded-3xl shadow-2xl border border-white/5">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">Pick your lane</h2>
            <p className="text-gray-400 mb-10 font-medium">Your HOSTELPULSE experience is tailored to your mission.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-6 rounded-[2rem] border-[3px] cursor-pointer transition-all duration-300 group ${selectedRole === role.id ? 'border-[#BEF264] bg-[#BEF264]/5 shadow-lg shadow-[#BEF264]/5' : 'border-[#222] hover:border-[#333] grayscale hover:grayscale-0'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${selectedRole === role.id ? 'bg-[#BEF264] text-black scale-110 rotate-3' : 'bg-[#222] text-gray-500 group-hover:bg-[#333]'
                            }`}>
                            {React.cloneElement(role.icon as React.ReactElement, { className: "w-7 h-7" })}
                        </div>
                        <h3 className={`font-black text-xl mb-2 transition-colors duration-300 ${selectedRole === role.id ? 'text-[#BEF264]' : 'text-white'}`}>{role.title}</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">{role.desc}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onSelect(selectedRole)}
                className="w-full mt-10 bg-[#BEF264] text-black font-black py-3 rounded-[1.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#BEF264]/10 text-lg uppercase tracking-wider"
            >
                Start as {currentRole?.title}
            </button>
        </div>
    );
};

export default AccountTypePicker;
