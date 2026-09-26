'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Custom SVG-based Pin Icon to prevent broken asset paths
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
    images?: string[];
    latitude?: number | string;
    longitude?: number | string;
};

interface PropertyMapProps {
    properties: Property[];
}

function getPropertyCoordinates(p: Property): [number, number] {
    const lat = typeof p.latitude === 'number' ? p.latitude : parseFloat(String(p.latitude ?? ''));
    const lng = typeof p.longitude === 'number' ? p.longitude : parseFloat(String(p.longitude ?? ''));

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return [lat, lng];
    }

    const loc = `${p.location || ''} ${p.title || ''}`.toLowerCase();
    const hash = (p.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterLng = ((hash % 100) - 50) * 0.00018;
    const jitterLat = (((hash * 7) % 100) - 50) * 0.00018;

    if (loc.includes('under-g') || loc.includes('under g') || loc.includes('underg')) {
        return [8.136 + jitterLat, 4.258 + jitterLng];
    }
    if (loc.includes('adenike')) {
        return [8.140 + jitterLat, 4.262 + jitterLng];
    }
    if (loc.includes('aroje')) {
        return [8.150 + jitterLat, 4.270 + jitterLng];
    }
    if (loc.includes('takie')) {
        return [8.1338 + jitterLat, 4.2435 + jitterLng];
    }
    if (loc.includes('general')) {
        return [8.130 + jitterLat, 4.255 + jitterLng];
    }
    if (loc.includes('stadium') || loc.includes('isale')) {
        return [8.138 + jitterLat, 4.252 + jitterLng];
    }
    return [8.1333 + jitterLat, 4.2667 + jitterLng];
}

function MapUpdater({ properties }: { properties: Property[] }) {
    const map = useMap();

    useEffect(() => {
        // Fix Leaflet blank tile issue on dynamic mount / tab change
        const resize = () => {
            map.invalidateSize();
        };

        const timer1 = setTimeout(resize, 150);
        const timer2 = setTimeout(resize, 500);
        const timer3 = setTimeout(resize, 1200);

        window.addEventListener('resize', resize);
        const container = map.getContainer();
        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && container) {
            ro = new ResizeObserver(() => resize());
            ro.observe(container);
        }

        if (properties.length > 0) {
            const coords = properties.map(p => getPropertyCoordinates(p));
            if (coords.length > 0) {
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            window.removeEventListener('resize', resize);
            if (ro) ro.disconnect();
        };
    }, [properties, map]);

    return null;
}

export default function PropertyMap({ properties }: PropertyMapProps) {
    const defaultCenter: [number, number] = [8.139, 4.258];

    return (
        <div className="w-full min-h-[400px] h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 relative z-0">
            <MapContainer 
                center={defaultCenter} 
                zoom={14} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
                />
                
                {properties.map(p => {
                    const coords = getPropertyCoordinates(p);
                    const imgUrl = (p.images && p.images.length > 0 && p.images[0] && p.images[0] !== 'null') 
                        ? p.images[0] 
                        : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5';
                    
                    return (
                        <Marker 
                            key={p.id} 
                            position={coords}
                            icon={customIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="w-48 overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
                                    <div className="h-32 w-full bg-gray-200 relative">
                                        <img 
                                            src={imgUrl} 
                                            alt={p.title}
                                            className="w-full h-full object-cover"
                                            onError={(e: any) => { e.currentTarget.src = '/placeholder.jpg'; }}
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
