'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@/lib/supabase/client';

// Use the token from env
const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
console.log("Mapbox Token:", token);
mapboxgl.accessToken = token;

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
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
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [liveProperties, setLiveProperties] = useState<Property[]>([]);
    const [liveRoommates, setLiveRoommates] = useState<Roommate[]>([]);
    
    const supabase = createClient();

    // Initialize Map
    useEffect(() => {
        if (map.current) return; // initialize map only once
        if (!mapContainer.current) return;

        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/standard', // 3D Standard Environment
            center: center,
            zoom: zoom,
            pitch: 60, // 3D Pitch
        });

        // Add navigation controls (zoom, compass, pitch)
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        newMap.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true
            }),
            'top-right'
        );
        
        newMap.on('load', () => {
            setMapLoaded(true);
            newMap.resize();
        });

        setTimeout(() => {
            if (map.current) map.current.resize();
        }, 500);

        map.current = newMap;

        return () => {
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
                pitch: 60,
                essential: true,
                duration: 2000
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
                .eq('status', 'active');
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

        const displayProperties = snapMode ? liveProperties : properties;

        // Cleanup function for active markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        function renderPropertyMarkers(props: Property[]) {
            props.forEach(p => {
                if (!p.latitude || !p.longitude) return;

                const el = document.createElement('div');
                el.className = 'price-pill bg-[#BEF264] text-black font-black px-3 py-1 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform';
                const price = p.price > 1000 ? `${(p.price / 1000).toFixed(0)}k` : p.price;
                el.innerHTML = `₦${price}`;

                const popupContent = `<div class="p-2 text-black dark:text-white dark:bg-neutral-900 rounded-xl">
                    <h4 class="font-bold text-sm mb-1">${p.title}</h4>
                    <p class="text-xs text-gray-500 mb-2">${p.location}</p>
                    <a href="/property/${p.id}" class="text-[#BEF264] font-black uppercase text-[10px] tracking-widest hover:underline">View Details</a>
                </div>`;

                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true }).setHTML(popupContent);
                const marker = new mapboxgl.Marker(el).setLngLat([p.longitude, p.latitude]).setPopup(popup).addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

        function renderRoommateMarkers(roommates: Roommate[]) {
            roommates.forEach(rm => {
                const landmark = LANDMARKS.find(l => l.name === rm.preferred_zone) || LANDMARKS[4];
                const fuzzedLng = landmark.lng + (Math.random() - 0.5) * 0.01;
                const fuzzedLat = landmark.lat + (Math.random() - 0.5) * 0.01;

                const el = document.createElement('div');
                el.className = 'w-10 h-10 rounded-full border-2 border-[#BEF264] shadow-lg bg-cover bg-center cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-black text-[#BEF264] font-black text-xs';
                
                if (rm.avatar_url) {
                    el.style.backgroundImage = `url('${rm.avatar_url}')`;
                    el.innerHTML = '';
                } else {
                    el.innerHTML = rm.full_name.substring(0, 2).toUpperCase();
                }

                const popupContent = `<div class="p-2 text-black dark:text-white dark:bg-neutral-900 rounded-xl text-center">
                    <h4 class="font-bold text-sm">${rm.full_name}</h4>
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">${rm.department || 'Student'}</p>
                    <a href="/roommates" class="mt-2 block text-[#BEF264] font-black uppercase text-[10px] tracking-widest hover:underline">Connect</a>
                </div>`;

                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true }).setHTML(popupContent);
                const marker = new mapboxgl.Marker(el).setLngLat([fuzzedLng, fuzzedLat]).setPopup(popup).addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

        // Render based on active category
        if (activeCategory === 'all') {
            renderPropertyMarkers(displayProperties);
            if (snapMode && liveRoommates.length > 0) {
                renderRoommateMarkers(liveRoommates);
            }
            
            // Add landmarks
            if (showLandmarks) {
                LANDMARKS.forEach(lm => {
                    const el = document.createElement('div');
                    el.className = 'bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow border border-white';
                    el.innerText = lm.name;
                    const marker = new mapboxgl.Marker(el).setLngLat([lm.lng, lm.lat]).addTo(map.current!);
                    markersRef.current.push(marker);
                });
            }
        } else if (activeCategory === 'hostels') {
            renderPropertyMarkers(displayProperties);
        } else if (activeCategory === 'roommates' && snapMode && liveRoommates.length > 0) {
            renderRoommateMarkers(liveRoommates);
        }

        // Fit bounds if we have properties
        if (displayProperties.length > 0 && map.current && activeCategory !== 'roommates') {
            const validProps = displayProperties.filter(p => p.latitude && p.longitude);
            if (validProps.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                validProps.forEach(p => {
                    bounds.extend([p.longitude!, p.latitude!]);
                });
                map.current.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 1000 });
            }
        }
    }, [properties, liveProperties, liveRoommates, snapMode, showLandmarks, mapLoaded, activeCategory]);

    return (
        <div className="w-full min-h-[550px] h-[600px] rounded-2xl overflow-hidden relative shadow-xl border border-gray-200 dark:border-white/10">
            <div ref={mapContainer} className="w-full h-full min-h-[500px] absolute inset-0" style={{ width: '100%', height: '100%', minHeight: '500px' }} />
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
