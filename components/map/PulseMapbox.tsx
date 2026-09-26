'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@/lib/supabase/client';

const rawToken = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
const hasMapboxToken = Boolean(rawToken && rawToken.startsWith('pk.') && rawToken.length > 20);

// Mapbox GL JS v2+ requires a non-empty accessToken on initialization even for custom raster tiles.
// If no token is provided in env, assign a safe fallback token so Mapbox GL constructor never throws an unhandled exception.
mapboxgl.accessToken = hasMapboxToken 
    ? rawToken 
    : 'pk.eyJ1IjoiaG9zdGVscHVsc2UiLCJhIjoiY2x6c2F5M3Q5MGFsYzJyc2J3YnIwb3V0MyJ9.A1b2C3d4E5f6G7h8I9j0';

type Property = {
    id: string;
    title: string;
    location: string;
    price: number;
    images?: string[];
    latitude?: number | string;
    longitude?: number | string;
};

interface Roommate {
    id: string;
    full_name: string;
    avatar_url: string;
    department: string;
    preferred_zone: string;
    roommate_metadata: any;
}

interface Landmark {
    name: string;
    lng: number;
    lat: number;
    type: 'academic' | 'market' | 'transport' | 'residential' | 'cafes' | 'library';
    description?: string;
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

const LANDMARKS: Landmark[] = [
    { name: 'LAUTECH Main Gate', lng: 4.267, lat: 8.135, type: 'academic', description: 'Main Entrance to LAUTECH Campus' },
    { name: 'Under-G Market', lng: 4.258, lat: 8.136, type: 'market', description: 'Major student shopping hub, groceries & provisions' },
    { name: 'Adenike Park', lng: 4.262, lat: 8.140, type: 'transport', description: 'Central student transit park & campus shuttle junction' },
    { name: 'Aroje Junction', lng: 4.270, lat: 8.150, type: 'transport', description: 'Interstate travel hub and transit point to Oyo/Ilorin' },
    { name: 'Takie Square', lng: 4.2435, lat: 8.1338, type: 'market', description: 'Central commercial district & market of Ogbomoso' },
    { name: 'LAUTECH Senate & Library', lng: 4.272, lat: 8.138, type: 'library', description: 'Central academic library and study complex' },
    { name: 'Under-G Food Strip', lng: 4.259, lat: 8.137, type: 'cafes', description: 'Popular student eateries, bukas and fast food spots' },
    { name: 'General Hospital Area', lng: 4.255, lat: 8.130, type: 'residential', description: 'Calm student residential neighborhood' },
    { name: 'Stadium / Isale', lng: 4.252, lat: 8.138, type: 'residential', description: 'Popular student residential zone near sports center' }
];

// 100% Reliable Zero-Config CartoDB Voyager Style (Requires NO token, fast global CDN)
export const CARTO_VOYAGER_STYLE: any = {
    version: 8,
    name: 'CartoDB Voyager',
    sources: {
        'carto-voyager': {
            type: 'raster',
            tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
        }
    },
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': '#f2f3f5'
            }
        },
        {
            id: 'carto-voyager-layer',
            type: 'raster',
            source: 'carto-voyager',
            minzoom: 0,
            maxzoom: 20
        }
    ]
};

// OpenStreetMap Standard Raster Style
export const OSM_RASTER_STYLE: any = {
    version: 8,
    name: 'OpenStreetMap',
    sources: {
        'osm-tiles': {
            type: 'raster',
            tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        }
    },
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': '#f2f3f5'
            }
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

function getLandmarkBadgeClass(type: string): string {
    switch (type) {
        case 'market':
            return 'bg-amber-500 text-black border-amber-300';
        case 'transport':
            return 'bg-blue-600 text-white border-blue-400';
        case 'cafes':
            return 'bg-orange-500 text-white border-orange-300';
        case 'library':
        case 'academic':
            return 'bg-emerald-600 text-white border-emerald-400';
        default:
            return 'bg-indigo-600 text-white border-indigo-400';
    }
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
    const fallbackRef = useRef(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [activeProvider, setActiveProvider] = useState<'mapbox' | 'carto' | 'osm'>('carto');
    const [liveProperties, setLiveProperties] = useState<Property[]>([]);
    const [liveRoommates, setLiveRoommates] = useState<Roommate[]>([]);
    
    const supabase = createClient();

    // Switch provider manually
    const switchProvider = useCallback((provider: 'mapbox' | 'carto' | 'osm') => {
        if (!map.current) return;
        if (provider === 'carto') {
            map.current.setStyle(CARTO_VOYAGER_STYLE);
            setActiveProvider('carto');
        } else if (provider === 'osm') {
            map.current.setStyle(OSM_RASTER_STYLE);
            setActiveProvider('osm');
        } else if (provider === 'mapbox' && hasMapboxToken) {
            fallbackRef.current = false;
            map.current.setStyle('mapbox://styles/mapbox/streets-v12');
            setActiveProvider('mapbox');
        }
        setTimeout(() => map.current?.resize(), 150);
    }, []);

    // Initialize Map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Check WebGL availability
        if (typeof mapboxgl.supported === 'function' && !mapboxgl.supported()) {
            console.warn('[PulseMapbox] WebGL not supported on this device/browser.');
        }

        const defaultCenter: [number, number] = center || [4.2667, 8.1333];
        const defaultZoom = zoom || 13.5;

        // Zero-config Carto Voyager raster tiles are the 100% reliable default to prevent silent failures & blank grey canvases
        const initialStyle = CARTO_VOYAGER_STYLE;

        let newMap: mapboxgl.Map;
        try {
            newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: initialStyle,
                center: defaultCenter,
                zoom: defaultZoom,
                attributionControl: true,
            });
        } catch (err) {
            console.warn('[PulseMapbox] Initialization failed with primary style, attempting OSM fallback:', err);
            try {
                newMap = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: OSM_RASTER_STYLE,
                    center: defaultCenter,
                    zoom: defaultZoom,
                    attributionControl: true,
                });
                setActiveProvider('osm');
                fallbackRef.current = true;
            } catch (osmErr) {
                console.error('[PulseMapbox] Critical error initializing map:', osmErr);
                return;
            }
        }

        // Add navigation controls (zoom, compass) and fullscreen control
        newMap.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
        newMap.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Robust fallback handler for token/style errors
        const triggerFallback = (reason: string) => {
            if (fallbackRef.current) return;
            fallbackRef.current = true;
            console.warn(`[PulseMapbox] Style fallback triggered (${reason}). Switching to zero-config Carto Voyager raster tiles.`);
            setActiveProvider('carto');
            try {
                newMap.setStyle(CARTO_VOYAGER_STYLE);
            } catch (styleErr) {
                console.error('[PulseMapbox] Failed to apply Carto style, attempting OpenStreetMap:', styleErr);
                try {
                    newMap.setStyle(OSM_RASTER_STYLE);
                    setActiveProvider('osm');
                } catch (osmErr) {
                    console.error('[PulseMapbox] Critical error applying OSM fallback:', osmErr);
                }
            }
            setTimeout(() => newMap.resize(), 150);
        };

        // Listen for tile or style loading errors
        newMap.on('error', (e: any) => {
            const err = e?.error || {};
            const message = String(err.message || e?.message || e?.error || '').toLowerCase();
            const status = err.status || e?.status || err.statusCode || e?.statusCode;

            const isAuthOrTileError = 
                status === 401 ||
                status === 403 ||
                status === 404 ||
                message.includes('401') ||
                message.includes('403') ||
                message.includes('unauthorized') ||
                message.includes('forbidden') ||
                message.includes('token') ||
                message.includes('style') ||
                message.includes('failed to fetch') ||
                message.includes('network');

            if (isAuthOrTileError && !fallbackRef.current) {
                triggerFallback(`Error: ${message || status}`);
            }
        });

        // Watchdog: If map style has not loaded within 2.5s when Mapbox is active, switch to Carto
        const watchdogTimer = setTimeout(() => {
            if (!newMap.isStyleLoaded() && !fallbackRef.current) {
                triggerFallback('Watchdog timeout 2500ms');
            }
        }, 2500);

        // Mark map loaded on both initial load and style change
        const handleMapReady = () => {
            setMapLoaded(true);
            newMap.resize();
        };

        newMap.on('load', handleMapReady);
        newMap.on('style.load', handleMapReady);
        newMap.on('render', () => {
            if (newMap.isStyleLoaded()) {
                setMapLoaded(true);
            }
        });

        // ResizeObserver to handle tab switches, drawer opening, animations, and container resizes
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && mapContainer.current) {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                        newMap.resize();
                    }
                }
            });
            resizeObserver.observe(mapContainer.current);
        }

        const handleWindowResize = () => {
            newMap?.resize();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && newMap) {
                newMap.resize();
            }
        };

        window.addEventListener('resize', handleWindowResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Staggered resize calls to guarantee correct sizing across mobile orientation changes & transitions
        const resizeTimers = [
            setTimeout(() => newMap?.resize(), 50),
            setTimeout(() => newMap?.resize(), 150),
            setTimeout(() => newMap?.resize(), 300),
            setTimeout(() => newMap?.resize(), 700),
            setTimeout(() => newMap?.resize(), 1500),
            setTimeout(() => newMap?.resize(), 3000),
        ];

        map.current = newMap;

        return () => {
            clearTimeout(watchdogTimer);
            resizeTimers.forEach(t => clearTimeout(t));
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleWindowResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
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
                const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0));
                const price = priceNum > 1000 ? `${(priceNum / 1000).toFixed(0)}k` : priceNum;
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
                            <span style="font-weight: 900; color: #BEF264; font-size: 12px;">₦${Number(priceNum).toLocaleString()}</span>
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
                
                const avatarSrc = rm.avatar_url || (rm as any).logo_url;
                if (avatarSrc) {
                    el.style.backgroundImage = `url('${avatarSrc}')`;
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
        } else if (activeCategory === 'roommates' && liveRoommates.length > 0) {
            renderRoommateMarkers(liveRoommates);
        }

        // Add landmarks if enabled or matching the active category
        let categoryLandmarks: Landmark[] = [];
        if (showLandmarks) {
            if (activeCategory === 'all') {
                categoryLandmarks = LANDMARKS;
            } else if (activeCategory === 'markets') {
                categoryLandmarks = LANDMARKS.filter(l => l.type === 'market');
            } else if (activeCategory === 'transport') {
                categoryLandmarks = LANDMARKS.filter(l => l.type === 'transport');
            } else if (activeCategory === 'cafes') {
                categoryLandmarks = LANDMARKS.filter(l => l.type === 'cafes');
            } else if (activeCategory === 'library') {
                categoryLandmarks = LANDMARKS.filter(l => l.type === 'library' || l.type === 'academic');
            }
        }

        categoryLandmarks.forEach(lm => {
            const el = document.createElement('div');
            const badgeClass = getLandmarkBadgeClass(lm.type);
            el.className = `px-2.5 py-1 rounded-full text-[11px] font-black shadow-md border cursor-pointer hover:scale-110 transition-transform select-none ${badgeClass}`;
            el.innerText = lm.name;

            const popupContent = `
                <div style="font-family: inherit; min-width: 170px; padding: 8px; background: #0f172a; color: white; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #BEF264; margin: 0 0 2px 0;">${lm.type.toUpperCase()}</p>
                    <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; color: white;">${lm.name}</h4>
                    ${lm.description ? `<p style="font-size: 11px; color: #94a3b8; margin: 0;">${lm.description}</p>` : ''}
                </div>
            `;
            const popup = new mapboxgl.Popup({ offset: 15, closeButton: false, closeOnClick: true }).setHTML(popupContent);
            const marker = new mapboxgl.Marker(el).setLngLat([lm.lng, lm.lat]).setPopup(popup).addTo(map.current!);
            markersRef.current.push(marker);
        });

        // Fit bounds if we have elements
        const itemsToFit: [number, number][] = [];
        if (activeCategory === 'all' || activeCategory === 'hostels') {
            displayProperties.forEach(p => itemsToFit.push(getPropertyCoordinates(p)));
        }
        categoryLandmarks.forEach(lm => itemsToFit.push([lm.lng, lm.lat]));

        if (itemsToFit.length > 0 && map.current) {
            const bounds = new mapboxgl.LngLatBounds();
            itemsToFit.forEach(coords => bounds.extend(coords));
            try {
                map.current.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 800 });
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
            {/* Tile Provider indicator & switcher */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-white font-bold select-none shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#BEF264] animate-pulse" />
                <span className="text-gray-300">Map:</span>
                <span className="text-white font-extrabold uppercase tracking-wide">
                    {activeProvider === 'carto' ? 'Voyager' : activeProvider === 'osm' ? 'OSM' : 'Streets'}
                </span>
                <button 
                    type="button" 
                    onClick={() => {
                        if (activeProvider === 'carto') {
                            if (hasMapboxToken) switchProvider('mapbox');
                            else switchProvider('osm');
                        } else if (activeProvider === 'mapbox') {
                            switchProvider('osm');
                        } else {
                            switchProvider('carto');
                        }
                    }}
                    className="ml-1 text-[9px] font-black uppercase text-[#BEF264] hover:underline"
                >
                    Switch
                </button>
            </div>
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
