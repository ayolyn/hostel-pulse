'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@/lib/supabase/client';
import { 
    Flame, 
    Sparkles, 
    Users, 
    Compass, 
    Navigation, 
    X, 
    MessageCircle, 
    ExternalLink, 
    MapPin, 
    GraduationCap, 
    ShieldCheck, 
    Layers,
    Home
} from 'lucide-react';

const MAPBOX_PUBLIC_TOKEN = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
const hasMapboxToken = Boolean(MAPBOX_PUBLIC_TOKEN && MAPBOX_PUBLIC_TOKEN.startsWith('pk.') && MAPBOX_PUBLIC_TOKEN.length > 20);

if (hasMapboxToken) {
    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
}

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    images?: string[];
    latitude?: number | string;
    longitude?: number | string;
    category?: string;
    status?: string;
    verification_status?: string;
};

interface Roommate {
    id: string;
    full_name: string;
    avatar_url?: string;
    logo_url?: string;
    department?: string;
    level?: string;
    preferred_zone?: string;
    roommate_metadata?: any;
    budget_range?: string;
    bio?: string;
}

interface Hotspot {
    id: string;
    name: string;
    tagline: string;
    lng: number;
    lat: number;
    category: 'campus' | 'food' | 'transit' | 'market' | 'study';
    icon: string;
    activeCount: number;
    pulseColor: string;
    badgeBg: string;
    description: string;
    walkingTimeFromGate: string;
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

// Iconic Snapchat-style Campus Activity Hotspots in Ogbomoso
export const SNAP_HOTSPOTS: Hotspot[] = [
    {
        id: 'under-g-strip',
        name: 'Under-G Food & Hub',
        tagline: 'Student Food Strip, Groceries & Cyber Hub',
        lng: 4.258,
        lat: 8.136,
        category: 'food',
        icon: '🔥',
        activeCount: 52,
        pulseColor: 'rgba(249, 115, 22, 0.45)', // Amber / Orange Flame
        badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
        description: 'Bukas, Shawarma joints, campus gadget stores, student supermarkets, and photo-studios.',
        walkingTimeFromGate: '8 mins walk'
    },
    {
        id: 'lautech-main-gate',
        name: 'LAUTECH Main Gate',
        tagline: 'Campus Entry, Transit Terminal & Security Hub',
        lng: 4.267,
        lat: 8.135,
        category: 'campus',
        icon: '⚡',
        activeCount: 84,
        pulseColor: 'rgba(190, 242, 100, 0.5)', // Electric Neon Lime
        badgeBg: 'bg-[#BEF264] text-black font-extrabold',
        description: 'Main campus security gate, official student shuttle terminals, and central meeting point.',
        walkingTimeFromGate: '0 mins'
    },
    {
        id: 'adenike-park',
        name: 'Adenike Transit Hub',
        tagline: 'Hostel District & Campus Shuttle Junction',
        lng: 4.262,
        lat: 8.140,
        category: 'transit',
        icon: '🚌',
        activeCount: 38,
        pulseColor: 'rgba(56, 189, 248, 0.45)', // Electric Cyan
        badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
        description: 'Prime high-density student hostel corridor, interstate cabs to town, and evening street food.',
        walkingTimeFromGate: '12 mins walk'
    },
    {
        id: 'takie-square',
        name: 'Takie Commercial Hub',
        tagline: 'Central Shopping Plazas, Banks & Town Center',
        lng: 4.2435,
        lat: 8.1338,
        category: 'market',
        icon: '🛍️',
        activeCount: 31,
        pulseColor: 'rgba(168, 85, 247, 0.4)', // Vibrant Violet
        badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
        description: 'Commercial banking center, electronics markets, clothing boutiques, and pharmacy plaza.',
        walkingTimeFromGate: '25 mins walk / 6 mins cab'
    },
    {
        id: 'senate-library',
        name: 'Senate & ICT Library',
        tagline: 'Central Academic Complex & Study Zone',
        lng: 4.272,
        lat: 8.138,
        category: 'study',
        icon: '📚',
        activeCount: 26,
        pulseColor: 'rgba(16, 185, 129, 0.45)', // Emerald Study Glow
        badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
        description: 'Main university library, high-speed Wi-Fi study hubs, and postgraduate research center.',
        walkingTimeFromGate: '5 mins walk inside campus'
    }
];

// Mapbox Vector Styles
const SNAP_NIGHT_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';
const SNAP_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

// 100% Zero-Token Sleek Dark Raster Base (Esri Dark Gray Canvas - No watermark, no API key needed)
export const ESRI_DARK_CANVAS_STYLE: any = {
    version: 8,
    name: 'Snap Midnight Base',
    sources: {
        'esri-dark-base': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri &copy; OpenStreetMap contributors'
        },
        'esri-dark-labels': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
        }
    },
    layers: [
        {
            id: 'snap-dark-bg',
            type: 'background',
            paint: {
                'background-color': '#090d16'
            }
        },
        {
            id: 'esri-dark-base-layer',
            type: 'raster',
            source: 'esri-dark-base',
            minzoom: 0,
            maxzoom: 19
        },
        {
            id: 'esri-dark-labels-layer',
            type: 'raster',
            source: 'esri-dark-labels',
            minzoom: 0,
            maxzoom: 19
        }
    ]
};

// OpenStreetMap High-Contrast Fallback Style
export const OSM_RASTER_STYLE: any = {
    version: 8,
    name: 'OpenStreetMap',
    sources: {
        'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
        }
    },
    layers: [
        {
            id: 'osm-bg',
            type: 'background',
            paint: { 'background-color': '#111827' }
        },
        {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
        }
    ]
};

function getPropertyCoordinates(p: Property): [number, number] {
    const lat = typeof p.latitude === 'number' ? p.latitude : parseFloat(String(p.latitude ?? ''));
    const lng = typeof p.longitude === 'number' ? p.longitude : parseFloat(String(p.longitude ?? ''));

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return [lng, lat];
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
    center = [4.2667, 8.1333], // Default center around LAUTECH Main Gate
    zoom = 14.2,
    showLandmarks = true,
    snapMode = true,
    activeCategory = 'all',
    flyToLocation = null
}: PulseMapboxProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const fallbackRef = useRef(false);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [is3DMode, setIs3DMode] = useState(true);
    const [activeStyleName, setActiveStyleName] = useState<'snap-night' | 'snap-dark' | 'midnight-base'>('snap-night');
    const [liveProperties, setLiveProperties] = useState<Property[]>([]);
    const [liveRoommates, setLiveRoommates] = useState<Roommate[]>([]);
    
    // Interactive Snapchat Drawers / Modals
    const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const supabase = createClient();

    // Toggle 3D tilt camera (Snapchat bird's eye 45-degree angle vs top-down 2D)
    const toggle3D = useCallback(() => {
        if (!map.current) return;
        const targetPitch = is3DMode ? 0 : 45;
        const targetBearing = is3DMode ? 0 : -12;
        map.current.easeTo({
            pitch: targetPitch,
            bearing: targetBearing,
            duration: 900
        });
        setIs3DMode(!is3DMode);
    }, [is3DMode]);

    // Recenter to LAUTECH Campus
    const recenterToCampus = useCallback(() => {
        if (!map.current) return;
        map.current.flyTo({
            center: [4.2667, 8.1333],
            zoom: 14.5,
            pitch: 45,
            bearing: -10,
            duration: 1200,
            essential: true
        });
    }, []);

    // Switch theme style seamlessly
    const switchStyle = useCallback((styleKey: 'snap-night' | 'snap-dark' | 'midnight-base') => {
        if (!map.current) return;
        try {
            if (styleKey === 'snap-night') {
                if (hasMapboxToken) {
                    map.current.setStyle(SNAP_NIGHT_STYLE);
                    setActiveStyleName('snap-night');
                } else {
                    map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                    setActiveStyleName('midnight-base');
                }
            } else if (styleKey === 'snap-dark') {
                if (hasMapboxToken) {
                    map.current.setStyle(SNAP_DARK_STYLE);
                    setActiveStyleName('snap-dark');
                } else {
                    map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                    setActiveStyleName('midnight-base');
                }
            } else {
                map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                setActiveStyleName('midnight-base');
            }
        } catch (err) {
            console.warn('[PulseMapbox] Style switch failed, falling back to Esri Dark Canvas:', err);
            map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
            setActiveStyleName('midnight-base');
        }
        setTimeout(() => map.current?.resize(), 200);
    }, []);

    // Initialize Map with Snapchat 3D perspective
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Check WebGL availability
        if (typeof mapboxgl.supported === 'function' && !mapboxgl.supported()) {
            console.warn('[PulseMapbox] WebGL not supported on this device/browser.');
        }

        const defaultCenter: [number, number] = center || [4.2667, 8.1333];
        const defaultZoom = zoom || 14.2;

        const initialStyle = hasMapboxToken ? SNAP_NIGHT_STYLE : ESRI_DARK_CANVAS_STYLE;
        if (!hasMapboxToken) {
            setActiveStyleName('midnight-base');
        }

        let newMap: mapboxgl.Map;
        try {
            newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: initialStyle,
                center: defaultCenter,
                zoom: defaultZoom,
                pitch: 45, // Signature Snapchat Map 3D tilt
                bearing: -10,
                attributionControl: false // Handled natively in HUD
            });
        } catch (err) {
            console.warn('[PulseMapbox] Vector style init failed, falling back to Midnight Canvas:', err);
            try {
                newMap = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: ESRI_DARK_CANVAS_STYLE,
                    center: defaultCenter,
                    zoom: defaultZoom,
                    pitch: 45,
                    bearing: -10,
                    attributionControl: false
                });
                setActiveStyleName('midnight-base');
                fallbackRef.current = true;
            } catch (fallbackErr) {
                console.error('[PulseMapbox] Critical map error:', fallbackErr);
                return;
            }
        }

        // Add subtle zoom controls (top-right)
        newMap.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

        // Graceful error listener
        newMap.on('error', (e: any) => {
            const err = e?.error || {};
            const message = String(err.message || e?.message || '').toLowerCase();
            const status = err.status || e?.status;

            // Only fallback on hard token/auth failures
            if ((status === 401 || status === 403 || message.includes('unauthorized') || message.includes('forbidden')) && !fallbackRef.current) {
                fallbackRef.current = true;
                console.warn('[PulseMapbox] Token authorization failed. Activating zero-token Midnight Base Canvas.');
                try {
                    newMap.setStyle(ESRI_DARK_CANVAS_STYLE);
                    setActiveStyleName('midnight-base');
                } catch (sErr) {
                    console.error('[PulseMapbox] Failed to apply midnight fallback:', sErr);
                }
            }
        });

        const handleMapReady = () => {
            setMapLoaded(true);
            newMap.resize();
        };

        newMap.on('load', handleMapReady);
        newMap.on('style.load', handleMapReady);

        // Container resize observer
        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && mapContainer.current) {
            ro = new ResizeObserver(() => newMap.resize());
            ro.observe(mapContainer.current);
        }

        const handleResize = () => newMap?.resize();
        window.addEventListener('resize', handleResize);

        const resizeTimers = [
            setTimeout(() => newMap?.resize(), 100),
            setTimeout(() => newMap?.resize(), 400),
            setTimeout(() => newMap?.resize(), 1000)
        ];

        map.current = newMap;

        return () => {
            resizeTimers.forEach(t => clearTimeout(t));
            if (ro) ro.disconnect();
            window.removeEventListener('resize', handleResize);
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fly to prop change
    useEffect(() => {
        if (map.current && flyToLocation) {
            map.current.flyTo({
                center: flyToLocation,
                zoom: 15.8,
                pitch: 50,
                bearing: -12,
                duration: 1200,
                essential: true
            });
        }
    }, [flyToLocation]);

    // Live Supabase query for Snap Mode
    useEffect(() => {
        if (!snapMode) return;

        async function fetchLiveMapData() {
            try {
                const { data: propsData } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('is_active', true)
                    .limit(35);
                if (propsData) setLiveProperties(propsData);

                const { data: roomiesData } = await supabase
                    .from('student_accounts')
                    .select('*')
                    .eq('looking_for_roommate', true)
                    .limit(20);
                if (roomiesData) setLiveRoommates(roomiesData);
            } catch (err) {
                console.error('[PulseMapbox] Error fetching live data:', err);
            }
        }

        fetchLiveMapData();
    }, [snapMode, supabase]);

    // Render Markers with Snapchat Bitmoji / Heatmap / Price aesthetics
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clean previous markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const displayProperties = snapMode 
            ? (liveProperties.length > 0 ? liveProperties : properties) 
            : properties;

        // 1. Render Snapchat-style Campus Activity Hotspots
        if (showLandmarks && (activeCategory === 'all' || activeCategory === 'hotspots' || activeCategory === 'markets' || activeCategory === 'transport' || activeCategory === 'cafes' || activeCategory === 'library')) {
            const filteredHotspots = SNAP_HOTSPOTS.filter(h => {
                if (activeCategory === 'all' || activeCategory === 'hotspots') return true;
                if (activeCategory === 'markets') return h.category === 'market';
                if (activeCategory === 'transport') return h.category === 'transit';
                if (activeCategory === 'cafes') return h.category === 'food';
                if (activeCategory === 'library') return h.category === 'study' || h.category === 'campus';
                return true;
            });

            filteredHotspots.forEach(hotspot => {
                // Wrapper element
                const wrapper = document.createElement('div');
                wrapper.className = 'snap-hotspot-container cursor-pointer select-none group';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = 'center';
                wrapper.style.transform = 'translate(-50%, -50%)';

                wrapper.innerHTML = `
                    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                        <!-- Pulsing Snapchat Heatmap Halo -->
                        <div style="
                            position: absolute;
                            width: 68px;
                            height: 68px;
                            border-radius: 9999px;
                            background: radial-gradient(circle, ${hotspot.pulseColor} 0%, rgba(0,0,0,0) 70%);
                            animation: pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                            pointer-events: none;
                        "></div>
                        <!-- Hotspot Pill -->
                        <div style="
                            position: relative;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 5px 11px;
                            border-radius: 9999px;
                            backdrop-filter: blur(12px);
                            background: rgba(10, 15, 29, 0.85);
                            border: 1.5px solid rgba(255, 255, 255, 0.15);
                            box-shadow: 0 10px 25px -3px rgba(0,0,0,0.6), 0 0 15px ${hotspot.pulseColor};
                            transition: transform 0.2s ease;
                        ">
                            <span style="font-size: 13px;">${hotspot.icon}</span>
                            <span style="font-size: 11px; font-weight: 900; color: white; letter-spacing: -0.01em; white-space: nowrap;">
                                ${hotspot.name}
                            </span>
                            <span style="
                                font-size: 9px;
                                font-weight: 900;
                                color: #BEF264;
                                background: rgba(190, 242, 100, 0.15);
                                padding: 1px 6px;
                                border-radius: 9999px;
                            ">${hotspot.activeCount}</span>
                        </div>
                    </div>
                `;

                wrapper.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedHotspot(hotspot);
                    setSelectedRoommate(null);
                    setSelectedProperty(null);
                    map.current?.flyTo({
                        center: [hotspot.lng, hotspot.lat],
                        zoom: 16,
                        pitch: 50,
                        duration: 1000
                    });
                };

                const marker = new mapboxgl.Marker({ element: wrapper, anchor: 'center' })
                    .setLngLat([hotspot.lng, hotspot.lat])
                    .addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

        // 2. Render Snapchat Bitmoji / Roommate Avatars
        if (snapMode && (activeCategory === 'all' || activeCategory === 'roommates')) {
            const roommatesToRender = liveRoommates.length > 0 ? liveRoommates : [
                {
                    id: 'rm-julius',
                    full_name: 'Juliuscliniko',
                    department: 'Accounting',
                    level: '400L',
                    preferred_zone: 'Under-G',
                    avatar_url: '',
                    bio: 'Calm, focused, non-smoker looking for a study buddy near Under-G or Adenike.',
                    budget_range: '₦150k - ₦220k'
                },
                {
                    id: 'rm-tunde',
                    full_name: 'Babatunde A.',
                    department: 'Computer Science',
                    level: '300L',
                    preferred_zone: 'Adenike Park',
                    avatar_url: '',
                    bio: 'Tech enthusiast, quiet, needs self-con with stable power / solar.',
                    budget_range: '₦200k - ₦280k'
                },
                {
                    id: 'rm-sarah',
                    full_name: 'Sarah O.',
                    department: 'Nursing Science',
                    level: '200L',
                    preferred_zone: 'LAUTECH Main Gate',
                    avatar_url: '',
                    bio: 'Early bird student, clean and respectful, looking for female roommate.',
                    budget_range: '₦180k - ₦250k'
                }
            ];

            roommatesToRender.forEach(rm => {
                const zoneMatch = SNAP_HOTSPOTS.find(h => h.name.toLowerCase().includes(rm.preferred_zone?.toLowerCase() || '')) || SNAP_HOTSPOTS[0];
                const hash = (rm.id || rm.full_name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                const fuzzedLng = zoneMatch.lng + (((hash % 100) - 50) * 0.00028);
                const fuzzedLat = zoneMatch.lat + ((((hash * 3) % 100) - 50) * 0.00028);

                // Adhere strictly to User Rule #2 for Avatar/Logo resolution
                const avatarSrc = rm.avatar_url || rm.logo_url;
                const initials = (rm.full_name || 'U').substring(0, 2).toUpperCase();

                const el = document.createElement('div');
                el.className = 'snap-avatar-marker cursor-pointer select-none group';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.alignItems = 'center';
                el.style.transform = 'translate(-50%, -100%)';

                el.innerHTML = `
                    <!-- Floating Snap Speech Bubble -->
                    <div style="
                        position: relative;
                        margin-bottom: 5px;
                        padding: 3px 8px;
                        border-radius: 9999px;
                        background: rgba(15, 23, 42, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        backdrop-filter: blur(8px);
                        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        white-space: nowrap;
                    ">
                        <span style="font-size: 10px; font-weight: 900; color: white;">${rm.full_name.split(' ')[0]}</span>
                        <span style="font-size: 9px; color: #BEF264; font-weight: 800;">${rm.department ? `• ${rm.department.substring(0, 8)}` : ''}</span>
                        <span style="width: 6px; height: 6px; border-radius: 9999px; background: #22c55e;"></span>
                    </div>

                    <!-- Bitmoji Circular Avatar with Radar Aura -->
                    <div style="position: relative; width: 44px; height: 44px;">
                        <!-- Animated radar ring -->
                        <div style="
                            position: absolute;
                            inset: -3px;
                            border-radius: 9999px;
                            background: rgba(190, 242, 100, 0.25);
                            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                        "></div>

                        <!-- Avatar Frame -->
                        <div style="
                            position: relative;
                            width: 44px;
                            height: 44px;
                            border-radius: 9999px;
                            border: 2.5px solid #BEF264;
                            background: #0f172a;
                            box-shadow: 0 8px 20px rgba(0,0,0,0.8), 0 0 15px rgba(190, 242, 100, 0.4);
                            overflow: hidden;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #BEF264;
                            font-size: 12px;
                            font-weight: 900;
                        ">
                            ${avatarSrc 
                                ? `<img src="${avatarSrc}" alt="${rm.full_name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerText='${initials}';" />`
                                : initials
                            }
                        </div>

                        <!-- Active Online Dot -->
                        <div style="
                            position: absolute;
                            bottom: -1px;
                            right: -1px;
                            width: 13px;
                            height: 13px;
                            border-radius: 9999px;
                            background: #22c55e;
                            border: 2px solid #000;
                        "></div>
                    </div>

                    <!-- 3D Ground Drop-Shadow -->
                    <div style="
                        width: 26px;
                        height: 6px;
                        border-radius: 9999px;
                        background: rgba(0,0,0,0.7);
                        filter: blur(2px);
                        margin-top: 2px;
                    "></div>
                `;

                el.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedRoommate(rm as Roommate);
                    setSelectedHotspot(null);
                    setSelectedProperty(null);
                    map.current?.flyTo({
                        center: [fuzzedLng, fuzzedLat],
                        zoom: 16.5,
                        pitch: 50,
                        bearing: -15,
                        duration: 1100
                    });
                };

                const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
                    .setLngLat([fuzzedLng, fuzzedLat])
                    .addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

        // 3. Render Sleek Snap Hostel Price Tags
        if (activeCategory === 'all' || activeCategory === 'hostels') {
            displayProperties.forEach(p => {
                const coords = getPropertyCoordinates(p);
                const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0));
                const priceFormatted = priceNum > 1000 ? `${(priceNum / 1000).toFixed(0)}k` : priceNum;

                const el = document.createElement('div');
                el.className = 'snap-hostel-pill cursor-pointer select-none';
                el.style.transform = 'translate(-50%, -50%)';

                el.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 4px 10px;
                        border-radius: 9999px;
                        background: rgba(10, 15, 29, 0.9);
                        border: 1.5px solid #BEF264;
                        backdrop-filter: blur(8px);
                        box-shadow: 0 8px 18px rgba(0,0,0,0.7), 0 0 10px rgba(190, 242, 100, 0.3);
                        transition: transform 0.15s ease;
                    ">
                        <span style="font-size: 10px;">🏠</span>
                        <span style="font-size: 11px; font-weight: 900; color: #BEF264; letter-spacing: -0.01em;">
                            ₦${priceFormatted}
                        </span>
                    </div>
                `;

                el.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedProperty(p);
                    setSelectedRoommate(null);
                    setSelectedHotspot(null);
                    map.current?.flyTo({
                        center: coords,
                        zoom: 16.2,
                        pitch: 45,
                        duration: 900
                    });
                };

                const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
                    .setLngLat(coords)
                    .addTo(map.current!);
                markersRef.current.push(marker);
            });
        }

    }, [properties, liveProperties, liveRoommates, snapMode, showLandmarks, mapLoaded, activeCategory]);

    return (
        <div className="w-full min-h-[500px] h-[540px] md:h-[640px] rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10 bg-[#090d16] font-sans">
            {/* Map Container */}
            <div 
                ref={mapContainer} 
                className="w-full h-full absolute inset-0" 
                style={{ width: '100%', height: '100%', minHeight: '480px' }} 
            />

            {/* Top Snapchat Live Radar HUD */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                {/* Left Live Campus Radar Badge */}
                <div className="pointer-events-auto flex items-center gap-2 bg-neutral-950/85 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BEF264]"></span>
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-white">
                        LAUTECH SNAP RADAR
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase text-[#BEF264] bg-[#BEF264]/10 px-2 py-0.5 rounded-full border border-[#BEF264]/20">
                        140+ ACTIVE
                    </span>
                </div>

                {/* Right Camera & Theme Controls */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {/* 3D / 2D Perspective Toggle */}
                    <button
                        type="button"
                        onClick={toggle3D}
                        className="flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-xl px-3.5 py-2 rounded-full border border-white/15 text-white hover:text-[#BEF264] text-xs font-black uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95"
                        title="Toggle 3D Bird's-Eye Perspective"
                    >
                        <Compass className={`w-3.5 h-3.5 ${is3DMode ? 'text-[#BEF264]' : 'text-gray-400'}`} />
                        <span>{is3DMode ? '3D' : '2D'}</span>
                    </button>

                    {/* Recenter Campus */}
                    <button
                        type="button"
                        onClick={recenterToCampus}
                        className="p-2 bg-neutral-950/85 backdrop-blur-xl rounded-full border border-white/15 text-white hover:text-[#BEF264] transition-all shadow-xl hover:scale-105 active:scale-95"
                        title="Center Campus"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                    </button>

                    {/* Theme Switcher */}
                    <div className="relative group">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-xl px-3 py-2 rounded-full border border-white/15 text-white text-xs font-black uppercase transition-all shadow-xl hover:text-[#BEF264]"
                        >
                            <Layers className="w-3.5 h-3.5 text-[#BEF264]" />
                            <span className="hidden sm:inline-block">
                                {activeStyleName === 'snap-night' ? 'Night' : activeStyleName === 'snap-dark' ? 'Dark' : 'Base'}
                            </span>
                        </button>
                        <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-neutral-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl min-w-[130px] z-30">
                            <button
                                onClick={() => switchStyle('snap-night')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'snap-night' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🌙 Snap Night
                            </button>
                            <button
                                onClick={() => switchStyle('snap-dark')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'snap-dark' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🌑 Snap Dark
                            </button>
                            <button
                                onClick={() => switchStyle('midnight-base')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'midnight-base' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🌌 Midnight Base
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Snapchat Roommate Profile Sheet */}
            {selectedRoommate && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-30 animate-in fade-in slide-in-from-bottom-6 duration-300">
                    <div className="bg-neutral-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl text-white relative">
                        <button 
                            type="button" 
                            onClick={() => setSelectedRoommate(null)} 
                            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#BEF264] bg-neutral-900 shadow-xl flex items-center justify-center font-black text-lg text-[#BEF264]">
                                    {selectedRoommate.avatar_url || selectedRoommate.logo_url ? (
                                        <img 
                                            src={selectedRoommate.avatar_url || selectedRoommate.logo_url} 
                                            alt={selectedRoommate.full_name} 
                                            className="w-full h-full object-cover"
                                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        selectedRoommate.full_name.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-base font-black text-white truncate">{selectedRoommate.full_name}</h3>
                                    <ShieldCheck className="w-4 h-4 text-[#BEF264] shrink-0" />
                                </div>
                                <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-[#BEF264]" />
                                    {selectedRoommate.department || 'LAUTECH Student'} {selectedRoommate.level ? `(${selectedRoommate.level})` : ''}
                                </p>
                                <p className="text-[11px] text-[#BEF264] font-black uppercase tracking-wider mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Prefers: {selectedRoommate.preferred_zone || 'Campus Vicinity'}
                                </p>
                            </div>
                        </div>

                        {selectedRoommate.bio && (
                            <p className="text-xs text-gray-300 bg-white/5 border border-white/5 rounded-2xl p-3 mt-3 leading-relaxed">
                                &ldquo;{selectedRoommate.bio}&rdquo;
                            </p>
                        )}

                        {selectedRoommate.budget_range && (
                            <div className="mt-3 flex items-center justify-between text-xs bg-[#BEF264]/10 border border-[#BEF264]/20 rounded-xl px-3 py-2">
                                <span className="text-gray-300 font-bold">Roommate Budget:</span>
                                <span className="text-[#BEF264] font-black">{selectedRoommate.budget_range}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <a
                                href="/dashboard/student?tab=roommates"
                                className="flex items-center justify-center gap-2 bg-[#BEF264] hover:bg-[#a6d456] text-black font-black uppercase text-xs tracking-wider py-2.5 rounded-xl transition-all shadow-lg shadow-[#BEF264]/20"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Say Hi 👋
                            </a>
                            <button
                                type="button"
                                onClick={() => setSelectedRoommate(null)}
                                className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white font-bold uppercase text-xs py-2.5 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Snapchat Hotspot Details Sheet */}
            {selectedHotspot && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-30 animate-in fade-in slide-in-from-bottom-6 duration-300">
                    <div className="bg-neutral-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl text-white relative">
                        <button 
                            type="button" 
                            onClick={() => setSelectedHotspot(null)} 
                            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl p-2 rounded-2xl bg-white/5 border border-white/10">{selectedHotspot.icon}</span>
                            <div>
                                <h3 className="text-base font-black text-white">{selectedHotspot.name}</h3>
                                <p className="text-xs text-[#BEF264] font-bold">{selectedHotspot.tagline}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed mt-2 mb-3">
                            {selectedHotspot.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/5 rounded-2xl p-3 text-xs mb-4">
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Activity:</span>
                                <span className="text-[#BEF264] font-black">{selectedHotspot.activeCount} Students Live</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">From Main Gate:</span>
                                <span className="text-white font-black">{selectedHotspot.walkingTimeFromGate}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={`/rent?search=${encodeURIComponent(selectedHotspot.name)}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#BEF264] hover:bg-[#a6d456] text-black font-black uppercase text-xs tracking-wider py-2.5 rounded-xl transition-all shadow-lg"
                            >
                                <Home className="w-4 h-4" />
                                Hostels Near Here
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Property Preview Sheet */}
            {selectedProperty && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-30 animate-in fade-in slide-in-from-bottom-6 duration-300">
                    <div className="bg-neutral-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl text-white relative">
                        <button 
                            type="button" 
                            onClick={() => setSelectedProperty(null)} 
                            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="w-full h-32 rounded-2xl overflow-hidden bg-neutral-900 mb-3 relative">
                            <img 
                                src={(selectedProperty.images && selectedProperty.images[0]) || '/placeholder.jpg'} 
                                alt={selectedProperty.title} 
                                className="w-full h-full object-cover"
                                onError={(e: any) => { e.currentTarget.src = '/placeholder.jpg'; }}
                            />
                            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-[#BEF264] border border-[#BEF264]/30">
                                ₦{Number(selectedProperty.price).toLocaleString()}
                            </div>
                        </div>

                        <h3 className="text-sm font-black text-white truncate">{selectedProperty.title}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 mb-4">
                            <MapPin className="w-3.5 h-3.5 text-[#BEF264]" />
                            {selectedProperty.location || 'Ogbomoso'}
                        </p>

                        <div className="flex items-center gap-2">
                            <a 
                                href={`/property/${selectedProperty.id}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#BEF264] hover:bg-[#a6d456] text-black font-black uppercase text-xs py-2.5 rounded-xl transition-all shadow-lg"
                            >
                                View Details <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Snapchat Quick Hub Carousel */}
            {!selectedRoommate && !selectedHotspot && !selectedProperty && (
                <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {SNAP_HOTSPOTS.map(h => (
                            <button
                                key={h.id}
                                type="button"
                                onClick={() => {
                                    setSelectedHotspot(h);
                                    map.current?.flyTo({
                                        center: [h.lng, h.lat],
                                        zoom: 16,
                                        pitch: 50,
                                        duration: 1000
                                    });
                                }}
                                className="flex items-center gap-2 bg-neutral-950/85 hover:bg-neutral-900 backdrop-blur-xl border border-white/15 px-3.5 py-2 rounded-2xl text-white shadow-xl shrink-0 transition-all hover:scale-105 active:scale-95 text-left"
                            >
                                <span className="text-base">{h.icon}</span>
                                <div>
                                    <p className="text-xs font-black leading-tight">{h.name}</p>
                                    <span className="text-[10px] text-[#BEF264] font-bold">{h.activeCount} active</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .mapboxgl-popup-content {
                    padding: 0 !important;
                    background: transparent !important;
                    box-shadow: none !important;
                }
                .mapboxgl-popup-tip {
                    display: none;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.9; transform: scale(1); }
                    50% { opacity: 0.35; transform: scale(1.35); }
                }
            `}</style>
        </div>
    );
}
