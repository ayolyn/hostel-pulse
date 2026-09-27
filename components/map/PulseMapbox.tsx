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
    pulseMode?: boolean;
    snapMode?: boolean; // Backward compatibility alias
    activeCategory?: string;
    flyToLocation?: [number, number] | null;
}

// Iconic Campus Activity Hotspots in Ogbomoso
export const PULSE_HOTSPOTS: Hotspot[] = [
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
const PULSE_NIGHT_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';
const PULSE_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';
const PULSE_SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

// 100% Zero-Token Sleek Dark Raster Base (Esri Dark Gray Canvas - No watermark, no API key needed)
export const ESRI_DARK_CANVAS_STYLE: any = {
    version: 8,
    name: 'Pulse Midnight Base',
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
            id: 'pulse-dark-bg',
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

// High-Resolution Aerial Satellite Fallback Style (Esri World Imagery + Reference labels)
export const ESRI_SATELLITE_STYLE: any = {
    version: 8,
    name: 'Pulse Satellite Aerial',
    sources: {
        'esri-satellite': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri, Maxar, Earthstar Geographics'
        },
        'esri-satellite-labels': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
        }
    },
    layers: [
        {
            id: 'satellite-bg',
            type: 'background',
            paint: {
                'background-color': '#050b14'
            }
        },
        {
            id: 'esri-satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19
        },
        {
            id: 'esri-satellite-labels-layer',
            type: 'raster',
            source: 'esri-satellite-labels',
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

/**
 * Procedural 3D building polygon generator for genuine 3D perspective extrusions
 * Returns closed GeoJSON coordinates [[lng, lat], ...]
 */
function createBuildingPolygon(
    centerLng: number, 
    centerLat: number, 
    widthMeters: number, 
    lengthMeters: number, 
    rotationDeg: number = 0
): [number, number][] {
    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((centerLat * Math.PI) / 180);
    const rad = (rotationDeg * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    const halfW = widthMeters / 2;
    const halfL = lengthMeters / 2;

    const corners: [number, number][] = [
        [-halfW, -halfL],
        [halfW, -halfL],
        [halfW, halfL],
        [-halfW, halfL],
        [-halfW, -halfL]
    ];

    return corners.map(([x, y]) => {
        const rotX = x * cosR - y * sinR;
        const rotY = x * sinR + y * cosR;
        return [
            centerLng + rotX / lngMeters,
            centerLat + rotY / latMeters
        ];
    });
}

// Comprehensive realistic 3D building footprints for LAUTECH Campus and student districts (85+ structures)
const CAMPUS_3D_BUILDINGS = [
    // 1. LAUTECH Central Academic & Administrative Complex
    { name: 'Senate Administrative Tower', lng: 4.2685, lat: 8.1382, width: 44, length: 28, rotation: 12, height: 42, min_height: 0, color: '#1e293b' },
    { name: 'Senate East Wing', lng: 4.2692, lat: 8.1382, width: 28, length: 18, rotation: 12, height: 28, min_height: 0, color: '#243247' },
    { name: 'Senate West Wing', lng: 4.2678, lat: 8.1382, width: 28, length: 18, rotation: 12, height: 28, min_height: 0, color: '#243247' },
    { name: 'Senate Council Chambers', lng: 4.2685, lat: 8.1375, width: 34, length: 24, rotation: 12, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Olusegun Oke Central Library', lng: 4.2725, lat: 8.1378, width: 54, length: 36, rotation: -8, height: 28, min_height: 0, color: '#1e293b' },
    { name: 'Library Reading Annex & Archives', lng: 4.2732, lat: 8.1374, width: 36, length: 22, rotation: -8, height: 20, min_height: 0, color: '#243247' },
    { name: 'Central ICT Complex & CBT Centre', lng: 4.2715, lat: 8.1384, width: 42, length: 28, rotation: -8, height: 26, min_height: 0, color: '#2a3b52' },
    { name: 'CAD & Cyber Lab Annex', lng: 4.2720, lat: 8.1390, width: 36, length: 22, rotation: -8, height: 20, min_height: 0, color: '#1e293b' },
    { name: 'Great Hall & Alumni Event Centre', lng: 4.2670, lat: 8.1365, width: 56, length: 36, rotation: 20, height: 24, min_height: 0, color: '#1e293b' },
    { name: '1200-Seater Amphitheatre', lng: 4.2678, lat: 8.1358, width: 44, length: 32, rotation: 20, height: 22, min_height: 0, color: '#243247' },
    { name: 'MKO Abiola Lecture Theatre', lng: 4.2683, lat: 8.1350, width: 38, length: 24, rotation: 15, height: 20, min_height: 0, color: '#1e293b' },
    { name: '250 Lecture Theatre', lng: 4.2690, lat: 8.1355, width: 32, length: 20, rotation: 15, height: 18, min_height: 0, color: '#1b2636' },
    { name: '500 Lecture Theatre Hall', lng: 4.2696, lat: 8.1348, width: 36, length: 24, rotation: 15, height: 18, min_height: 0, color: '#243247' },
    { name: '750 Lecture Theatre Hall', lng: 4.2704, lat: 8.1342, width: 40, length: 26, rotation: 15, height: 20, min_height: 0, color: '#1e293b' },
    { name: 'Faculty of Engineering (Block A - Mech/Civil)', lng: 4.2698, lat: 8.1402, width: 50, length: 24, rotation: 35, height: 26, min_height: 0, color: '#1e293b' },
    { name: 'Faculty of Engineering (Block B - Elect/Comp)', lng: 4.2706, lat: 8.1410, width: 50, length: 24, rotation: 35, height: 26, min_height: 0, color: '#243247' },
    { name: 'Faculty of Engineering (Block C - Chem/Food)', lng: 4.2712, lat: 8.1418, width: 48, length: 24, rotation: 35, height: 24, min_height: 0, color: '#1b2636' },
    { name: 'Central Engineering Workshops', lng: 4.2720, lat: 8.1424, width: 46, length: 28, rotation: 35, height: 18, min_height: 0, color: '#1e293b' },
    { name: 'Faculty of Pure & Applied Sciences (Block 1)', lng: 4.2708, lat: 8.1360, width: 48, length: 26, rotation: 0, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Faculty of Pure & Applied Sciences (Block 2)', lng: 4.2715, lat: 8.1366, width: 46, length: 24, rotation: 0, height: 24, min_height: 0, color: '#243247' },
    { name: 'Science Laboratory Complex', lng: 4.2716, lat: 8.1354, width: 42, length: 24, rotation: 0, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Faculty of Environmental Sciences', lng: 4.2658, lat: 8.1412, width: 46, length: 26, rotation: -25, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Architecture Design Studios', lng: 4.2652, lat: 8.1420, width: 38, length: 22, rotation: -25, height: 20, min_height: 0, color: '#243247' },
    { name: 'Urban & Regional Planning Complex', lng: 4.2646, lat: 8.1428, width: 40, length: 24, rotation: -25, height: 20, min_height: 0, color: '#1b2636' },
    { name: 'College of Health Sciences Complex', lng: 4.2640, lat: 8.1385, width: 52, length: 28, rotation: 10, height: 26, min_height: 0, color: '#1e293b' },
    { name: 'Medical Anatomy & Pathology Labs', lng: 4.2646, lat: 8.1393, width: 44, length: 24, rotation: 10, height: 22, min_height: 0, color: '#243247' },
    { name: 'Faculty of Agricultural Sciences', lng: 4.2736, lat: 8.1352, width: 48, length: 26, rotation: 5, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Faculty of Management Sciences', lng: 4.2675, lat: 8.1395, width: 46, length: 24, rotation: 10, height: 22, min_height: 0, color: '#243247' },
    { name: 'Student Union Building (SUB)', lng: 4.2660, lat: 8.1350, width: 40, length: 26, rotation: 15, height: 18, min_height: 0, color: '#1e293b' },
    { name: 'University Health Centre', lng: 4.2650, lat: 8.1370, width: 38, length: 24, rotation: 15, height: 16, min_height: 0, color: '#243247' },
    { name: 'Sports Pavilion & Gymnasium', lng: 4.2710, lat: 8.1432, width: 54, length: 34, rotation: 40, height: 22, min_height: 0, color: '#1e293b' },
    { name: 'Stadium Spectators Grandstand', lng: 4.2718, lat: 8.1440, width: 60, length: 20, rotation: 40, height: 18, min_height: 0, color: '#243247' },
    { name: 'Convocation Arena & Stage', lng: 4.2680, lat: 8.1425, width: 52, length: 30, rotation: 0, height: 16, min_height: 0, color: '#1b2636' },
    { name: 'LAUTECH Main Gate Complex', lng: 4.2670, lat: 8.1338, width: 34, length: 18, rotation: 0, height: 14, min_height: 0, color: '#1e293b' },
    { name: 'Gate Commercial Banks Terminal', lng: 4.2664, lat: 8.1343, width: 30, length: 16, rotation: 0, height: 14, min_height: 0, color: '#243247' },
    { name: 'Campus On-Site Hall 1', lng: 4.2740, lat: 8.1400, width: 44, length: 28, rotation: 20, height: 22, min_height: 0, color: '#1e293b' },
    { name: 'Campus On-Site Hall 2', lng: 4.2748, lat: 8.1408, width: 44, length: 28, rotation: 20, height: 22, min_height: 0, color: '#243247' },
    { name: 'Post-Graduate Student Hall', lng: 4.2730, lat: 8.1415, width: 40, length: 26, rotation: 20, height: 20, min_height: 0, color: '#1b2636' },

    // 2. Under-G Student District Hostels, Plazas & Apartments
    { name: 'Under-G Food & Hub Center', lng: 4.2580, lat: 8.1360, width: 38, length: 22, rotation: 25, height: 20, min_height: 0, color: '#1e293b' },
    { name: 'Under-G Commercial Plaza', lng: 4.2588, lat: 8.1365, width: 36, length: 20, rotation: 25, height: 18, min_height: 0, color: '#243247' },
    { name: 'Diamond Villa Student Hostel', lng: 4.2570, lat: 8.1375, width: 40, length: 26, rotation: 20, height: 26, min_height: 0, color: '#1e293b' },
    { name: 'Royal Crest Apartments', lng: 4.2562, lat: 8.1382, width: 42, length: 28, rotation: 20, height: 26, min_height: 0, color: '#243247' },
    { name: 'Platinum Hall Lodge', lng: 4.2580, lat: 8.1386, width: 44, length: 26, rotation: 15, height: 28, min_height: 0, color: '#1e293b' },
    { name: 'Emerald Court Hostel', lng: 4.2592, lat: 8.1376, width: 38, length: 24, rotation: 15, height: 22, min_height: 0, color: '#243247' },
    { name: 'Crystal Heights Hostel', lng: 4.2564, lat: 8.1355, width: 38, length: 24, rotation: 30, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Sunshine Villa Residence', lng: 4.2555, lat: 8.1366, width: 34, length: 22, rotation: 30, height: 20, min_height: 0, color: '#243247' },
    { name: 'Alpha Court Lodge', lng: 4.2574, lat: 8.1348, width: 36, length: 22, rotation: 20, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Prestige Lodge Apartments', lng: 4.2584, lat: 8.1352, width: 38, length: 24, rotation: 20, height: 24, min_height: 0, color: '#243247' },
    { name: 'White House Student Villa', lng: 4.2598, lat: 8.1362, width: 40, length: 26, rotation: 25, height: 22, min_height: 0, color: '#1e293b' },
    { name: 'Harmony Heights Hostel', lng: 4.2550, lat: 8.1378, width: 42, length: 26, rotation: 15, height: 26, min_height: 0, color: '#243247' },
    { name: 'Kings Court Residence', lng: 4.2542, lat: 8.1385, width: 38, length: 24, rotation: 15, height: 22, min_height: 0, color: '#1e293b' },
    { name: 'Prime Haven Student Lodge', lng: 4.2568, lat: 8.1394, width: 40, length: 26, rotation: 15, height: 24, min_height: 0, color: '#243247' },
    { name: 'Excel Court Apartments', lng: 4.2586, lat: 8.1396, width: 36, length: 22, rotation: 10, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Marvel Hall Hostel', lng: 4.2598, lat: 8.1388, width: 42, length: 26, rotation: 10, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Crown Student Apartments', lng: 4.2576, lat: 8.1368, width: 38, length: 24, rotation: 25, height: 24, min_height: 0, color: '#243247' },
    { name: 'Under-G Supermarket Plaza', lng: 4.2605, lat: 8.1370, width: 34, length: 20, rotation: 25, height: 18, min_height: 0, color: '#1b2636' },
    { name: 'Student Cyber & Tech Hub', lng: 4.2602, lat: 8.1358, width: 32, length: 20, rotation: 25, height: 18, min_height: 0, color: '#243247' },

    // 3. Adenike Student Corridor (high density student living)
    { name: 'Adenike Transit Terminal', lng: 4.2622, lat: 8.1402, width: 34, length: 22, rotation: -10, height: 16, min_height: 0, color: '#1e293b' },
    { name: 'Harmony Lodge Hostels', lng: 4.2615, lat: 8.1412, width: 42, length: 26, rotation: -10, height: 26, min_height: 0, color: '#1e293b' },
    { name: 'Olive Student Palace', lng: 4.2635, lat: 8.1415, width: 40, length: 26, rotation: -10, height: 24, min_height: 0, color: '#243247' },
    { name: 'Shalom Court Hostels', lng: 4.2620, lat: 8.1426, width: 44, length: 28, rotation: -15, height: 26, min_height: 0, color: '#1e293b' },
    { name: 'Goshen Villa Residence', lng: 4.2608, lat: 8.1420, width: 38, length: 24, rotation: -15, height: 22, min_height: 0, color: '#243247' },
    { name: 'Apex Luxury Lodge', lng: 4.2640, lat: 8.1432, width: 40, length: 26, rotation: -15, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Bethel Court', lng: 4.2626, lat: 8.1440, width: 36, length: 22, rotation: -15, height: 22, min_height: 0, color: '#243247' },
    { name: 'Grace Villa Hostels', lng: 4.2612, lat: 8.1435, width: 38, length: 24, rotation: -10, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Zion Crest Apartments', lng: 4.2632, lat: 8.1448, width: 40, length: 26, rotation: -10, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Silver Spring Lodge', lng: 4.2645, lat: 8.1442, width: 38, length: 24, rotation: -10, height: 22, min_height: 0, color: '#243247' },
    { name: 'Peace Haven Hostels', lng: 4.2602, lat: 8.1445, width: 36, length: 22, rotation: -15, height: 20, min_height: 0, color: '#1b2636' },
    { name: 'Oasis Court Apartments', lng: 4.2622, lat: 8.1456, width: 42, length: 26, rotation: -15, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Millennium Student Lodge', lng: 4.2638, lat: 8.1462, width: 38, length: 24, rotation: -15, height: 22, min_height: 0, color: '#243247' },
    { name: 'Adenike Shopping Mart & Plaza', lng: 4.2618, lat: 8.1395, width: 34, length: 20, rotation: -10, height: 18, min_height: 0, color: '#1b2636' },

    // 4. Aroje & Stadium District
    { name: 'Horizon Student Lodge', lng: 4.2695, lat: 8.1495, width: 40, length: 26, rotation: 5, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Cedar Villa', lng: 4.2710, lat: 8.1510, width: 38, length: 24, rotation: 5, height: 22, min_height: 0, color: '#243247' },
    { name: 'Grace Court Hostels', lng: 4.2685, lat: 8.1518, width: 42, length: 26, rotation: 5, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Prime Heights Hostel', lng: 4.2720, lat: 8.1526, width: 38, length: 24, rotation: 5, height: 22, min_height: 0, color: '#243247' },
    { name: 'Legacy Apartments Aroje', lng: 4.2702, lat: 8.1534, width: 36, length: 22, rotation: 5, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Summit Hall Lodge', lng: 4.2678, lat: 8.1504, width: 40, length: 24, rotation: 5, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'Ogbomoso Township Stadium Grandstand', lng: 4.2520, lat: 8.1380, width: 56, length: 24, rotation: 20, height: 22, min_height: 0, color: '#243247' },
    { name: 'General Hospital Main Medical Wing', lng: 4.2550, lat: 8.1300, width: 52, length: 28, rotation: 0, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'General Hospital Doctors Quarters', lng: 4.2562, lat: 8.1305, width: 40, length: 22, rotation: 0, height: 20, min_height: 0, color: '#243247' },

    // 5. Takie Commercial Square
    { name: 'First Bank Financial Plaza', lng: 4.2430, lat: 8.1335, width: 36, length: 26, rotation: 45, height: 30, min_height: 0, color: '#1e293b' },
    { name: 'GTBank Commercial Tower', lng: 4.2442, lat: 8.1340, width: 34, length: 24, rotation: 45, height: 28, min_height: 0, color: '#243247' },
    { name: 'Zenith & Access Bank Complex', lng: 4.2438, lat: 8.1328, width: 38, length: 26, rotation: 45, height: 28, min_height: 0, color: '#1e293b' },
    { name: 'Takie Central Market Mall', lng: 4.2450, lat: 8.1346, width: 50, length: 34, rotation: 45, height: 24, min_height: 0, color: '#1e293b' },
    { name: 'City Mega Supermarket', lng: 4.2425, lat: 8.1346, width: 42, length: 28, rotation: 45, height: 22, min_height: 0, color: '#243247' },
    { name: 'Heritage Shopping Plaza', lng: 4.2455, lat: 8.1332, width: 40, length: 24, rotation: 45, height: 22, min_height: 0, color: '#1b2636' },
    { name: 'Ogbomoso Central Town Hall', lng: 4.2420, lat: 8.1320, width: 44, length: 26, rotation: 45, height: 22, min_height: 0, color: '#243247' },
    { name: 'UBA Commercial Building', lng: 4.2448, lat: 8.1322, width: 36, length: 22, rotation: 45, height: 26, min_height: 0, color: '#1e293b' }
];

function generateCampus3DBuildingsGeoJSON(extraProperties: Property[] = []): any {
    const features: any[] = [];
    
    // 1. Add all 85+ defined campus & district 3D buildings
    CAMPUS_3D_BUILDINGS.forEach((b, i) => {
        features.push({
            type: 'Feature',
            id: `campus-bldg-${i}`,
            properties: {
                name: b.name,
                height: b.height,
                min_height: b.min_height || 0,
                color: b.color || '#1e293b'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [createBuildingPolygon(b.lng, b.lat, b.width, b.length, b.rotation || 0)]
            }
        });
    });

    // 2. Add realistic 3D building extrusions beneath every active hostel/property
    extraProperties.forEach((p, idx) => {
        const coords = getPropertyCoordinates(p);
        const hash = (p.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rot = (hash % 90) - 45;
        const bldgHeight = 18 + (hash % 12);
        features.push({
            type: 'Feature',
            id: `prop-bldg-${p.id || idx}`,
            properties: {
                name: p.title || 'Student Hostel Lodge',
                height: bldgHeight,
                min_height: 0,
                color: '#1e293b'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [createBuildingPolygon(coords[0], coords[1], 26, 22, rot)]
            }
        });
    });

    return {
        type: 'FeatureCollection',
        features
    };
}

export default function PulseMapbox({ 
    properties = [], 
    center = [4.2667, 8.1333], // Default center around LAUTECH Main Gate
    zoom = 14.2,
    showLandmarks = true,
    pulseMode = true,
    snapMode,
    activeCategory = 'all',
    flyToLocation = null
}: PulseMapboxProps) {
    const isPulseActive = pulseMode ?? snapMode ?? true;
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const fallbackRef = useRef(false);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [is3DMode, setIs3DMode] = useState(true);
    const [activeStyleName, setActiveStyleName] = useState<'pulse-night' | 'pulse-dark' | 'pulse-satellite' | 'midnight-base'>('pulse-night');
    const activeStyleNameRef = useRef(activeStyleName);
    const [liveProperties, setLiveProperties] = useState<Property[]>([]);
    const [liveRoommates, setLiveRoommates] = useState<Roommate[]>([]);
    
    // Interactive Campus Pulse Drawers / Modals
    const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const supabase = createClient();

    // Priority: explicitly passed properties first; fallback to live properties if passed is empty
    const displayProperties = properties && properties.length > 0 
        ? properties 
        : (liveProperties.length > 0 ? liveProperties : properties);

    const displayPropertiesRef = useRef<Property[]>(displayProperties);
    useEffect(() => {
        displayPropertiesRef.current = displayProperties;
    }, [displayProperties]);

    const isSatelliteActive = activeStyleName === 'pulse-satellite';

    /**
     * Add Mapbox composite fill-extrusion 3D layer and procedural GeoJSON building blocks
     * If in satellite mode, hides 3D solid extrusions so high-resolution rooftops are visible
     */
    const apply3DBuildingLayers = useCallback((m: mapboxgl.Map, currentProperties: Property[], isSatelliteMode: boolean) => {
        try {
            const style = m.getStyle();
            if (!style) return;

            // Configure directional lighting for real architectural depth and shadow on 3D building faces
            if (typeof m.setLight === 'function') {
                m.setLight({
                    anchor: 'viewport',
                    color: '#ffffff',
                    intensity: 0.45,
                    position: [1.5, 180, 50]
                });
            }

            const labelLayerId = style.layers?.find(
                (l: any) => l.type === 'symbol' && l.layout && l.layout['text-field']
            )?.id;

            const visibilityState: 'visible' | 'none' = isSatelliteMode ? 'none' : 'visible';

            // 1. If Mapbox Composite vector source exists (official Mapbox style), add/update Mapbox 3D building extrusion
            if (m.getSource('composite')) {
                if (!m.getLayer('3d-buildings-composite')) {
                    m.addLayer(
                        {
                            id: '3d-buildings-composite',
                            source: 'composite',
                            'source-layer': 'building',
                            filter: ['==', 'extrude', 'true'],
                            type: 'fill-extrusion',
                            minzoom: 12,
                            layout: {
                                visibility: visibilityState
                            },
                            paint: {
                                'fill-extrusion-color': '#1e293b',
                                'fill-extrusion-height': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    12, 0,
                                    14.05, ['coalesce', ['get', 'height'], 16]
                                ],
                                'fill-extrusion-base': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    12, 0,
                                    14.05, ['coalesce', ['get', 'min_height'], 0]
                                ],
                                'fill-extrusion-opacity': 0.92
                            }
                        },
                        labelLayerId
                    );
                } else {
                    m.setLayoutProperty('3d-buildings-composite', 'visibility', visibilityState);
                }
            }

            // 2. Add / Update LAUTECH & Ogbomoso procedural 3D GeoJSON building blocks
            const campusGeoJSON = generateCampus3DBuildingsGeoJSON(currentProperties);
            const existingSource = m.getSource('pulse-campus-3d') as mapboxgl.GeoJSONSource | undefined;
            if (existingSource) {
                existingSource.setData(campusGeoJSON);
            } else {
                m.addSource('pulse-campus-3d', {
                    type: 'geojson',
                    data: campusGeoJSON
                });
            }

            if (!m.getLayer('pulse-campus-3d-layer')) {
                m.addLayer(
                    {
                        id: 'pulse-campus-3d-layer',
                        type: 'fill-extrusion',
                        source: 'pulse-campus-3d',
                        minzoom: 11,
                        layout: {
                            visibility: visibilityState
                        },
                        paint: {
                            'fill-extrusion-color': ['coalesce', ['get', 'color'], '#1e293b'],
                            'fill-extrusion-height': ['coalesce', ['get', 'height'], 18],
                            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                            'fill-extrusion-opacity': 0.92
                        }
                    },
                    labelLayerId
                );
            } else {
                m.setLayoutProperty('pulse-campus-3d-layer', 'visibility', visibilityState);
            }
        } catch (err) {
            console.warn('[PulseMapbox] Note adding 3D building layers:', err);
        }
    }, []);

    // Toggle 3D tilt camera (Campus Pulse bird's eye 48-degree angle vs top-down 2D)
    const toggle3D = useCallback(() => {
        if (!map.current) return;
        const targetPitch = is3DMode ? 0 : 48;
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
            pitch: 48,
            bearing: -10,
            duration: 1200,
            essential: true
        });
    }, []);

    // Switch theme style seamlessly between Pulse Night, Dark, Satellite & Base
    const switchStyle = useCallback((styleKey: 'pulse-night' | 'pulse-dark' | 'pulse-satellite' | 'midnight-base') => {
        if (!map.current) return;
        try {
            if (styleKey === 'pulse-night') {
                if (hasMapboxToken && !fallbackRef.current) {
                    map.current.setStyle(PULSE_NIGHT_STYLE);
                    setActiveStyleName('pulse-night');
                } else {
                    map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                    setActiveStyleName('midnight-base');
                }
            } else if (styleKey === 'pulse-dark') {
                if (hasMapboxToken && !fallbackRef.current) {
                    map.current.setStyle(PULSE_DARK_STYLE);
                    setActiveStyleName('pulse-dark');
                } else {
                    map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                    setActiveStyleName('midnight-base');
                }
            } else if (styleKey === 'pulse-satellite') {
                if (hasMapboxToken && !fallbackRef.current) {
                    map.current.setStyle(PULSE_SATELLITE_STYLE);
                    setActiveStyleName('pulse-satellite');
                } else {
                    map.current.setStyle(ESRI_SATELLITE_STYLE);
                    setActiveStyleName('pulse-satellite');
                }
            } else {
                map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                setActiveStyleName('midnight-base');
            }
        } catch (err) {
            console.warn('[PulseMapbox] Style switch failed, falling back:', err);
            if (styleKey === 'pulse-satellite') {
                map.current.setStyle(ESRI_SATELLITE_STYLE);
                setActiveStyleName('pulse-satellite');
            } else {
                map.current.setStyle(ESRI_DARK_CANVAS_STYLE);
                setActiveStyleName('midnight-base');
            }
        }
        setTimeout(() => map.current?.resize(), 200);
    }, []);

    // Handlers for the Floating 🛰️ / 3D Toggle Pill
    const handleToggleSatellite = useCallback(() => {
        if (!map.current) return;
        switchStyle('pulse-satellite');
        map.current.easeTo({
            pitch: 15,
            bearing: 0,
            duration: 900
        });
    }, [switchStyle]);

    const handleToggle3D = useCallback(() => {
        if (!map.current) return;
        if (activeStyleName === 'pulse-satellite') {
            switchStyle('pulse-night');
        }
        map.current.easeTo({
            pitch: 48,
            bearing: -12,
            duration: 900
        });
        setIs3DMode(true);
    }, [activeStyleName, switchStyle]);

    // Keep activeStyleNameRef synced and update 3D layers when style or properties change
    useEffect(() => {
        activeStyleNameRef.current = activeStyleName;
        if (map.current && mapLoaded) {
            apply3DBuildingLayers(map.current, displayProperties, activeStyleName === 'pulse-satellite');
        }
    }, [activeStyleName, displayProperties, mapLoaded, apply3DBuildingLayers]);

    // Initialize Map with 3D perspective
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Check WebGL availability
        if (typeof mapboxgl.supported === 'function' && !mapboxgl.supported()) {
            console.warn('[PulseMapbox] WebGL not supported on this device/browser.');
        }

        const defaultCenter: [number, number] = center || [4.2667, 8.1333];
        const defaultZoom = zoom || 14.2;

        const initialStyle = hasMapboxToken ? PULSE_NIGHT_STYLE : ESRI_DARK_CANVAS_STYLE;
        if (!hasMapboxToken) {
            setActiveStyleName('midnight-base');
            activeStyleNameRef.current = 'midnight-base';
        }

        let newMap: mapboxgl.Map;
        try {
            newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: initialStyle,
                center: defaultCenter,
                zoom: defaultZoom,
                pitch: 48, // Signature Campus Pulse 3D tilt
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
                    pitch: 48,
                    bearing: -10,
                    attributionControl: false
                });
                setActiveStyleName('midnight-base');
                activeStyleNameRef.current = 'midnight-base';
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
                console.warn('[PulseMapbox] Token authorization failed. Activating zero-token fallback.');
                try {
                    if (activeStyleNameRef.current === 'pulse-satellite') {
                        newMap.setStyle(ESRI_SATELLITE_STYLE);
                    } else {
                        newMap.setStyle(ESRI_DARK_CANVAS_STYLE);
                        setActiveStyleName('midnight-base');
                        activeStyleNameRef.current = 'midnight-base';
                    }
                } catch (sErr) {
                    console.error('[PulseMapbox] Failed to apply fallback:', sErr);
                }
            }
        });

        const handleMapReady = () => {
            setMapLoaded(true);
            apply3DBuildingLayers(newMap, displayPropertiesRef.current, activeStyleNameRef.current === 'pulse-satellite');
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

    // Live Supabase query for Pulse Mode
    useEffect(() => {
        if (!isPulseActive) return;

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
    }, [isPulseActive, supabase]);

    // Render Markers with Campus Pulse Avatar / Heatmap / Price aesthetics
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clean previous markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // 1. Render Campus Activity Hotspots
        if (showLandmarks && (activeCategory === 'all' || activeCategory === 'hotspots' || activeCategory === 'markets' || activeCategory === 'transport' || activeCategory === 'cafes' || activeCategory === 'library')) {
            const filteredHotspots = PULSE_HOTSPOTS.filter(h => {
                if (activeCategory === 'all' || activeCategory === 'hotspots') return true;
                if (activeCategory === 'markets') return h.category === 'market';
                if (activeCategory === 'transport') return h.category === 'transit';
                if (activeCategory === 'cafes') return h.category === 'food';
                if (activeCategory === 'library') return h.category === 'study' || h.category === 'campus';
                return true;
            });

            filteredHotspots.forEach(hotspot => {
                const wrapper = document.createElement('div');
                wrapper.className = 'pulse-hotspot-container cursor-pointer select-none group';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = 'center';
                wrapper.style.transform = 'translate(-50%, -50%)';

                wrapper.innerHTML = `
                    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                        <!-- Pulsing Heatmap Halo -->
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

        // 2. Render Roommate Avatars
        if (isPulseActive && (activeCategory === 'all' || activeCategory === 'roommates')) {
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
                const zoneMatch = PULSE_HOTSPOTS.find(h => h.name.toLowerCase().includes(rm.preferred_zone?.toLowerCase() || '')) || PULSE_HOTSPOTS[0];
                const hash = (rm.id || rm.full_name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                const fuzzedLng = zoneMatch.lng + (((hash % 100) - 50) * 0.00028);
                const fuzzedLat = zoneMatch.lat + ((((hash * 3) % 100) - 50) * 0.00028);

                // Adhere strictly to User Rule #2 for Avatar/Logo resolution
                const avatarSrc = rm.avatar_url || rm.logo_url;
                const initials = (rm.full_name || 'U').substring(0, 2).toUpperCase();

                const el = document.createElement('div');
                el.className = 'pulse-avatar-marker cursor-pointer select-none group';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.alignItems = 'center';
                el.style.transform = 'translate(-50%, -100%)';

                el.innerHTML = `
                    <!-- Floating Speech Bubble -->
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

                    <!-- Circular Avatar with Radar Aura -->
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

        // 3. Render Sleek Hostel Price Tags
        if (activeCategory === 'all' || activeCategory === 'hostels') {
            displayProperties.forEach(p => {
                const coords = getPropertyCoordinates(p);
                const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0));
                const priceFormatted = priceNum > 1000 ? `${(priceNum / 1000).toFixed(0)}k` : priceNum;

                const el = document.createElement('div');
                el.className = 'pulse-hostel-pill cursor-pointer select-none';
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

    }, [properties, liveProperties, liveRoommates, isPulseActive, showLandmarks, mapLoaded, activeCategory, displayProperties]);

    return (
        <div className="w-full min-h-[500px] h-[540px] md:h-[640px] rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10 bg-[#090d16] font-sans">
            {/* Map Container */}
            <div 
                ref={mapContainer} 
                className="w-full h-full absolute inset-0" 
                style={{ width: '100%', height: '100%', minHeight: '480px' }} 
            />

            {/* Top Campus Pulse Live Radar HUD */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                {/* Left Live Campus Radar Badge */}
                <div className="pointer-events-auto flex items-center gap-2 bg-neutral-950/85 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BEF264]"></span>
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-white">
                        LAUTECH PULSE RADAR
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase text-[#BEF264] bg-[#BEF264]/10 px-2 py-0.5 rounded-full border border-[#BEF264]/20">
                        140+ ACTIVE
                    </span>
                </div>

                {/* Right Camera & Theme Controls */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {/* Compass / 3D Tilt Toggle */}
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

                    {/* Theme Switcher Dropdown */}
                    <div className="relative group">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-xl px-3 py-2 rounded-full border border-white/15 text-white text-xs font-black uppercase transition-all shadow-xl hover:text-[#BEF264]"
                        >
                            <Layers className="w-3.5 h-3.5 text-[#BEF264]" />
                            <span className="hidden sm:inline-block">
                                {activeStyleName === 'pulse-night' ? 'Night' : activeStyleName === 'pulse-dark' ? 'Dark' : activeStyleName === 'pulse-satellite' ? 'Satellite' : 'Base'}
                            </span>
                        </button>
                        <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-neutral-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl min-w-[145px] z-30">
                            <button
                                onClick={() => switchStyle('pulse-night')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'pulse-night' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🌙 Pulse Night
                            </button>
                            <button
                                onClick={() => switchStyle('pulse-dark')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'pulse-dark' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🌑 Pulse Dark
                            </button>
                            <button
                                onClick={() => switchStyle('pulse-satellite')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'pulse-satellite' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🛰️ Pulse Satellite
                            </button>
                            <button
                                onClick={() => switchStyle('midnight-base')}
                                className={`text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeStyleName === 'midnight-base' ? 'bg-[#BEF264] text-black font-extrabold' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                            >
                                🌌 Pulse Base
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating 🛰️ / 3D Mode Toggle Pill (Matching reference UI) */}
            <div className="absolute top-16 right-4 z-20 pointer-events-auto">
                <div className="flex items-center bg-neutral-950/90 backdrop-blur-xl border border-white/20 p-1 rounded-full shadow-2xl">
                    <button
                        type="button"
                        onClick={handleToggleSatellite}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                            isSatelliteActive
                                ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/25 scale-105'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                        title="High-Resolution Satellite Aerial View"
                    >
                        <span className="text-sm">🛰️</span>
                        <span className="text-[11px]">Satellite</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleToggle3D}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                            !isSatelliteActive
                                ? 'bg-[#BEF264] text-black shadow-lg shadow-[#BEF264]/25 scale-105'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                        title="3D Building Extrusions View"
                    >
                        <span className="text-sm">🏙️</span>
                        <span className="text-[11px]">3D</span>
                    </button>
                </div>
            </div>

            {/* Interactive Roommate Profile Sheet */}
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
                                            onError={(e: any) => { 
                                                e.currentTarget.onerror = null; 
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedRoommate.full_name || 'User')}`; 
                                            }}
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

            {/* Interactive Hotspot Details Sheet */}
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
                                href={`/dashboard/student?tab=find-hostel&search=${encodeURIComponent(selectedHotspot.name)}`}
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

            {/* Bottom Campus Pulse Quick Hub Carousel */}
            {!selectedRoommate && !selectedHotspot && !selectedProperty && (
                <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {PULSE_HOTSPOTS.map(h => (
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
