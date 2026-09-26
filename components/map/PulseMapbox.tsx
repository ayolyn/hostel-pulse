'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@/lib/supabase/client';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
if (token) {
    mapboxgl.accessToken = token;
}

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    images?: string[];
    latitude?: number;
    longitude?: number;
};

interface Roommate {
    id: string;
    full_name: string;
    avatar_url: string;
    department: string;
    preferred_zone: string;
    roommate_metadata: any;
}

interface PulseMapboxProps {
    properties?: Property[];
    center?: [number, number]; // [lng, lat]
    zoom?: number;
    showLandmarks?: boolean;
    snapMode?: boolean;
    activeCategory?: string;
    flyToLocation?: [number, number] | null;
}

const LANDMARKS = [
    { name: 'LAUTECH Main Gate', lng: 4.267, lat: 8.135, type: 'academic' },
    { name: 'Under-G', lng: 4.258, lat: 8.136, type: 'market' },
    { name: 'Adenike', lng: 4.262, lat: 8.140, type: 'transport' },
    { name: 'Aroje', lng: 4.270, lat: 8.150, type: 'residential' },
    { name: 'General Area', lng: 4.255, lat: 8.130, type: 'residential' }
];

// OpenStreetMap Raster Style - guaranteed to work without tokens or WebGL 3D restrictions
const OSM_RASTER_STYLE: any = {
    version: 8,
    sources: {
        'osm-tiles': {
            type: 'raster',
            tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    layers: [
        {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
        }
    ]
};

function getPropertyCoordinates(p: Property): [number, number] {
    if (typeof p.longitude === 'number' && typeof p.latitude === 'number' && p.longitude !== 0 && p.latitude !== 0) {
        return [p.longitude, p.latitude];
    }

    const loc = `${p.location || ''} ${p.title || ''}`.toLowerCase();
    const hash = (p.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterLng = ((hash % 100) - 50) * 0.00018;
    const jitterLat = (((hash * 7) % 100) - 50) * 0.00018;

    if (loc.includes('under-g') || loc.includes('under g') || loc.includes('underg')) {
        return [4.258 + jitterLng, 8.136 + jitterLat];
    }
    if (loc.includes('adenike')) {
        return [4.262 + jitterLng, 8.140 + jitterLat];
    }
    if (loc.includes('aroje')) {
        return [4.270 + jitterLng, 8.150 + jitterLat];
    }
    if (loc.includes('takie')) {
        return [4.2435 + jitterLng, 8.1338 + jitterLat];
    }
    if (loc.includes('general')) {
        return [4.255 + jitterLng, 8.130 + jitterLat];
    }
    if (loc.includes('stadium') || loc.includes('isale')) {
        return [4.252 + jitterLng, 8.138 + jitterLat];
    }
    return [4.2667 + jitterLng, 8.1333 + jitterLat];
}

export default function PulseMapbox({ 
    properties = [], 
    center = [4.2666, 8.1333], // Default to LAUTECH Main Gate
    zoom = 13.5,
    showLandmarks = false,
    snapMode = false,
    activeCategory = 'all',
    flyToLocation = null
}: PulseMapboxProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [liveProperties, setLiveProperties] = useState<Property[]>([]);
    const [liveRoommates, setLiveRoommates] = useState<Roommate[]>([]);
    
    const supabase = createClient();

    // Initialize Map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        const defaultCenter: [number, number] = center || [4.2667, 8.1333];
        // Use streets-v12 which has 100% compatibility; fall back to OSM_RASTER_STYLE if token missing
        const initialStyle = token ? 'mapbox://styles/mapbox/streets-v12' : OSM_RASTER_STYLE;

        let newMap: mapboxgl.Map;
        try {
            newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: initialStyle,
                center: defaultCenter,
                zoom: zoom || 13.5,
            });
        } catch (err) {
            console.warn('Mapbox initialization failed with standard style, falling back to OSM:', err);
            newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: OSM_RASTER_STYLE,
                center: defaultCenter,
                zoom: zoom || 13.5,
            });
        }

        // Add navigation controls (zoom, compass)
        newMap.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
        
        newMap.on('error', (e) => {
            // If style or tile load fails, gracefully fall back to OpenStreetMap
            if (e?.error?.message?.includes('style') || e?.error?.message?.includes('401') || e?.error?.message?.includes('403')) {
                console.warn('Mapbox tile error detected, falling back to OSM raster tiles:', e);
                try {
                    newMap.setStyle(OSM_RASTER_STYLE);
                } catch (styleErr) {
                    // Ignore style change error
                }
            }
        });

        newMap.on('load', () => {
            setMapLoaded(true);
            newMap.resize();
        });

        // Trigger resize periodically to handle tab switches and animations
        const timer1 = setTimeout(() => newMap?.resize(), 150);
        const timer2 = setTimeout(() => newMap?.resize(), 500);
        const timer3 = setTimeout(() => newMap?.resize(), 1200);

        const handleWindowResize = () => {
            newMap?.resize();
        };
        window.addEventListener('resize', handleWindowResize);

        map.current = newMap;

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            window.removeEventListener('resize', handleWindowResize);
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle FlyTo Location
    useEffect(() => {
        if (map.current && flyToLocation) {
            map.current.flyTo({
                center: flyToLocation,
                zoom: 15.5,
                essential: true,
                duration: 1500
            });
        }
    }, [flyToLocation]);

    // Fetch live data for Snap Map mode
    useEffect(() => {
        if (!snapMode) return;

        async function fetchLiveMapData() {
            const { data: propsData } = await supabase
                .from('properties')
                .select('*')
                .eq('is_active', true);
            if (propsData) setLiveProperties(propsData);

            const { data: roomiesData } = await supabase
                .from('student_accounts')
                .select('*')
                .eq('looking_for_roommate', true);
            if (roomiesData) setLiveRoommates(roomiesData);
        }

        fetchLiveMapData();
    }, [snapMode, supabase]);

    // Update markers when properties or map changes
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const displayProperties = snapMode 
            ? (liveProperties.length > 0 ? liveProperties : properties) 
            : properties;

        // Cleanup active markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        function renderPropertyMarkers(props: Property[]) {
            props.forEach(p => {
                const coords = getPropertyCoordinates(p);

                const el = document.createElement('div');
                el.className = 'price-pill bg-[#BEF264] text-black font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform text-xs select-none';
                const price = p.price > 1000 ? `${(p.price / 1000).toFixed(0)}k` : p.price;
                el.innerHTML = `₦${price}`;

                const imgUrl = (p.images && p.images.length > 0 && p.images[0] && p.images[0] !== 'null') 
                    ? p.images[0] 
                    : '/placeholder.jpg';

                const popupContent = `
                    <div style="font-family: inherit; min-width: 180px; padding: 6px; background: #0f172a; color: white; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="width: 100%; height: 90px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; background: #1e293b;">
                            <img src="${imgUrl}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/placeholder.jpg';" />
                        </div>
                        <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 2px 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</h4>
                        <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0;">${p.location || 'Ogbomoso'}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 900; color: #BEF264; font-size: 12px;">₦${Number(p.price).toLocaleString()}</span>
                            <a href="/property/${p.id}" style="color: #BEF264; font-weight: 800; text-transform: uppercase; font-size: 10px; text-decoration: underline;">View &rarr;</a>
                        </div>
                    </div>
                `;

                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true }).setHTML(popupContent);
                const marker = new mapboxgl.Marker(el).setLngLat(coords).setPopup(popup).addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

        function renderRoommateMarkers(roommates: Roommate[]) {
            roommates.forEach(rm => {
                const landmark = LANDMARKS.find(l => l.name === rm.preferred_zone) || LANDMARKS[4];
                const hash = (rm.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const fuzzedLng = landmark.lng + (((hash % 100) - 50) * 0.0002);
                const fuzzedLat = landmark.lat + ((((hash * 3) % 100) - 50) * 0.0002);

                const el = document.createElement('div');
                el.className = 'w-10 h-10 rounded-full border-2 border-[#BEF264] shadow-lg bg-cover bg-center cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-black text-[#BEF264] font-black text-xs';
                
                if (rm.avatar_url) {
                    el.style.backgroundImage = `url('${rm.avatar_url}')`;
                    el.innerHTML = '';
                } else {
                    el.innerHTML = (rm.full_name || 'U').substring(0, 2).toUpperCase();
                }

                const popupContent = `
                    <div style="font-family: inherit; padding: 8px; background: #0f172a; color: white; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                        <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 2px 0;">${rm.full_name}</h4>
                        <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin: 0 0 6px 0;">${rm.department || 'Student'}</p>
                        <a href="/dashboard/student?tab=roommates" style="display: inline-block; background: #BEF264; color: black; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 4px 10px; border-radius: 6px; text-decoration: none;">Connect</a>
                    </div>
                `;

                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true }).setHTML(popupContent);
                const marker = new mapboxgl.Marker(el).setLngLat([fuzzedLng, fuzzedLat]).setPopup(popup).addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

        // Render based on active category
        if (activeCategory === 'all' || activeCategory === 'hostels') {
            renderPropertyMarkers(displayProperties);
            if (snapMode && liveRoommates.length > 0 && activeCategory === 'all') {
                renderRoommateMarkers(liveRoommates);
            }
            
            // Add landmarks
            if (showLandmarks) {
                LANDMARKS.forEach(lm => {
                    const el = document.createElement('div');
                    el.className = 'bg-blue-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black shadow-md border border-white/80 select-none';
                    el.innerText = lm.name;
                    const marker = new mapboxgl.Marker(el).setLngLat([lm.lng, lm.lat]).addTo(map.current!);
                    markersRef.current.push(marker);
                });
            }
        } else if (activeCategory === 'roommates' && liveRoommates.length > 0) {
            renderRoommateMarkers(liveRoommates);
        }

        // Fit bounds if we have properties
        if (displayProperties.length > 0 && map.current && activeCategory !== 'roommates') {
            const bounds = new mapboxgl.LngLatBounds();
            displayProperties.forEach(p => {
                const coords = getPropertyCoordinates(p);
                bounds.extend(coords);
            });
            try {
                map.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1000 });
            } catch (err) {
                // Ignore bounds error if dimensions are 0
            }
        }
    }, [properties, liveProperties, liveRoommates, snapMode, showLandmarks, mapLoaded, activeCategory]);

    return (
        <div className="w-full min-h-[400px] h-[450px] md:h-[600px] rounded-2xl overflow-hidden relative shadow-xl border border-gray-200 dark:border-white/10 bg-slate-900">
            <div 
                ref={mapContainer} 
                className="w-full h-full absolute inset-0" 
                style={{ width: '100%', height: '100%', minHeight: '400px' }} 
            />
            <style jsx global>{`
                .mapboxgl-popup-content {
                    padding: 0 !important;
                    background: transparent !important;
                    box-shadow: none !important;
                }
                .mapboxgl-popup-tip {
                    display: none;
                }
            `}</style>
        </div>
    );
}
