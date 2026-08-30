'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Fix for default marker icon in leaflet with Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    latitude?: number;
    longitude?: number;
};

interface PropertyMapProps {
    properties: Property[];
}

function MapUpdater({ properties }: { properties: Property[] }) {
    const map = useMap();

    useEffect(() => {
        if (properties.length > 0) {
            const validProps = properties.filter(p => p.latitude && p.longitude);
            if (validProps.length > 0) {
                const bounds = L.latLngBounds(validProps.map(p => [p.latitude!, p.longitude!]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [properties, map]);

    return null;
}

export default function PropertyMap({ properties }: PropertyMapProps) {
    // Default center to LAUTECH / Ogbomoso area
    const defaultCenter: [number, number] = [8.139, 4.258];

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 relative z-0">
            <MapContainer 
                center={defaultCenter} 
                zoom={14} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {properties.map(p => {
                    if (!p.latitude || !p.longitude) return null;
                    
                    return (
                        <Marker 
                            key={p.id} 
                            position={[p.latitude, p.longitude]}
                            icon={customIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="w-48 overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
                                    <div className="h-32 w-full bg-gray-200 relative">
                                        <img 
                                            src={p.images?.[0] ?? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'} 
                                            alt={p.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded-md text-xs font-bold shadow">
                                            ₦{Number(p.price).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm line-clamp-1 text-gray-900 dark:text-white">{p.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.location}</p>
                                        <Link 
                                            href={`/property/${p.id}`}
                                            className="mt-3 block w-full text-center bg-[#BEF264] text-black hover:bg-[#aade59] py-1.5 rounded-lg text-xs font-bold uppercase transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                <MapUpdater properties={properties} />
            </MapContainer>
            
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
            `}</style>
        </div>
    );
}
