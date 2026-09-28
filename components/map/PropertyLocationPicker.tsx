"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, Navigation, Compass, Layers, Check, Loader2, Info } from 'lucide-react';
import { 
    OGBOMOSO_BBOX, 
    LAUTECH_MAIN_GATE, 
    OGBOMOSO_MAP_CENTER, 
    searchOgbomosoPlaces, 
    reverseGeocodeOgbomoso,
    GeocodeResult 
} from '@/lib/geocoding';

const MAPBOX_PUBLIC_TOKEN = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
const hasMapboxToken = Boolean(MAPBOX_PUBLIC_TOKEN && MAPBOX_PUBLIC_TOKEN.startsWith('pk.') && MAPBOX_PUBLIC_TOKEN.length > 20);

if (hasMapboxToken) {
    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
}

const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-v9';

// Zero-token fallbacks
const FALLBACK_DARK = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const FALLBACK_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

interface PropertyLocationPickerProps {
    initialLng?: number | null;
    initialLat?: number | null;
    initialAddress?: string;
    onLocationChange: (data: { lng: number; lat: number; address: string }) => void;
}

export function PropertyLocationPicker({
    initialLng,
    initialLat,
    initialAddress = '',
    onLocationChange
}: PropertyLocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);

    const [coordinates, setCoordinates] = useState<[number, number]>(() => {
        if (typeof initialLng === 'number' && typeof initialLat === 'number' && initialLng !== 0 && initialLat !== 0) {
            return [initialLng, initialLat];
        }
        return LAUTECH_MAIN_GATE; // [4.2691, 8.1393]
    });

    const [address, setAddress] = useState(initialAddress);
    const [isSatellite, setIsSatellite] = useState(true); // Default to Satellite for roof-dropping!
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchDebounce = useRef<NodeJS.Timeout | null>(null);

    // Synchronize drag end coordinate extraction & reverse geocoding
    const handleCoordinateUpdate = useCallback(async (lng: number, lat: number) => {
        setCoordinates([lng, lat]);
        setIsGeocoding(true);

        try {
            const detectedAddress = await reverseGeocodeOgbomoso(lng, lat);
            setAddress(detectedAddress);
            onLocationChange({ lng, lat, address: detectedAddress });
        } catch (err) {
            console.warn('[LocationPicker] Reverse geocode error:', err);
            onLocationChange({ lng, lat, address: address || 'Ogbomoso' });
        } finally {
            setIsGeocoding(false);
        }
    }, [address, onLocationChange]);

    // Initialize Mapbox with draggable pin
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        const startCoords = coordinates;
        const initialStyle = hasMapboxToken ? SATELLITE_STYLE : {
            version: 8,
            sources: {
                'satellite-fallback': {
                    type: 'raster',
                    tiles: [FALLBACK_SATELLITE],
                    tileSize: 256
                }
            },
            layers: [{ id: 'satellite-fallback-layer', type: 'raster', source: 'satellite-fallback' }]
        };

        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: initialStyle as any,
            center: startCoords,
            zoom: 16.5,
            pitch: 0,
            bearing: 0,
            maxBounds: OGBOMOSO_BBOX, // Lock viewport strictly inside Ogbomoso!
            attributionControl: false
        });

        newMap.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

        newMap.on('load', () => {
            // Highly visible draggable marker as requested: new mapboxgl.Marker({ draggable: true, color: '#22c55e' })
            const newMarker = new mapboxgl.Marker({ 
                draggable: true, 
                color: '#22c55e' 
            })
                .setLngLat(startCoords)
                .addTo(newMap);

            newMarker.on('dragend', () => {
                const lngLat = newMarker.getLngLat();
                handleCoordinateUpdate(lngLat.lng, lngLat.lat);
            });

            marker.current = newMarker;
            newMap.resize();
        });

        // Click anywhere to quickly move the pin
        newMap.on('click', (e) => {
            if (marker.current) {
                marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
                handleCoordinateUpdate(e.lngLat.lng, e.lngLat.lat);
            }
        });

        map.current = newMap;

        const resizeTimer = setTimeout(() => newMap.resize(), 300);

        return () => {
            clearTimeout(resizeTimer);
            if (marker.current) marker.current.remove();
            if (map.current) map.current.remove();
            map.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Toggle Satellite and Dark modes
    const toggleMapStyle = (toSatellite: boolean) => {
        if (!map.current) return;
        setIsSatellite(toSatellite);

        if (hasMapboxToken) {
            map.current.setStyle(toSatellite ? SATELLITE_STYLE : DARK_STYLE);
        } else {
            const fallback = toSatellite ? FALLBACK_SATELLITE : FALLBACK_DARK;
            map.current.setStyle({
                version: 8,
                sources: {
                    'tile-source': {
                        type: 'raster',
                        tiles: [fallback],
                        tileSize: 256
                    }
                },
                layers: [{ id: 'tile-layer', type: 'raster', source: 'tile-source' }]
            } as any);
        }

        // Re-attach marker after style reload
        map.current.once('style.load', () => {
            if (marker.current && map.current) {
                marker.current.addTo(map.current);
            }
        });
    };

    // Live search within Ogbomoso bounding box
    const handleSearchInput = (text: string) => {
        setSearchQuery(text);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);

        if (text.trim().length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        searchDebounce.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchOgbomosoPlaces(text);
            setSearchResults(results);
            setShowResults(true);
            setIsSearching(false);
        }, 280);
    };

    const handleSelectSearchResult = (result: GeocodeResult) => {
        setShowResults(false);
        setSearchQuery('');
        setAddress(result.text);

        if (map.current && marker.current) {
            map.current.flyTo({
                center: result.center,
                zoom: 17,
                duration: 1200
            });
            marker.current.setLngLat(result.center);
            handleCoordinateUpdate(result.center[0], result.center[1]);
        }
    };

    const recenterLautech = () => {
        if (map.current && marker.current) {
            map.current.flyTo({
                center: LAUTECH_MAIN_GATE,
                zoom: 16.5,
                duration: 900
            });
            marker.current.setLngLat(LAUTECH_MAIN_GATE);
            handleCoordinateUpdate(LAUTECH_MAIN_GATE[0], LAUTECH_MAIN_GATE[1]);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Top Helper Bar & Address Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-2.5 focus-within:border-[#BEF264] transition-colors shadow-lg">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            placeholder="Search Ogbomoso area (e.g. Under-G, Adenike, Aroje)..."
                            className="bg-transparent outline-none text-xs font-bold text-white w-full placeholder:text-gray-500"
                        />
                        {isSearching && <Loader2 className="w-4 h-4 text-[#BEF264] animate-spin shrink-0" />}
                    </div>

                    {/* Auto-suggest dropdown locked to Ogbomoso bbox */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-950/95 backdrop-blur-xl border border-neutral-700 rounded-2xl p-1.5 shadow-2xl z-50 max-h-56 overflow-y-auto">
                            {searchResults.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleSelectSearchResult(r)}
                                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-800 rounded-xl text-xs font-bold text-gray-200 hover:text-white flex items-center justify-between transition-colors"
                                >
                                    <span className="truncate">{r.place_name}</span>
                                    <span className="text-[10px] text-[#BEF264] font-black uppercase shrink-0 ml-2">Jump</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Satellite / Dark Mode Toggles for precision roof viewing */}
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 p-1 rounded-2xl shadow-lg self-start sm:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => toggleMapStyle(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                            isSatellite
                                ? 'bg-[#BEF264] text-black shadow-md'
                                : 'text-gray-400 hover:text-white'
                        }`}
                        title="Satellite View (Best for pinpointing hostel roofs)"
                    >
                        🛰️ Satellite
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleMapStyle(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                            !isSatellite
                                ? 'bg-[#BEF264] text-black shadow-md'
                                : 'text-gray-400 hover:text-white'
                        }`}
                        title="Street Map View"
                    >
                        🗺️ Dark
                    </button>
                </div>
            </div>

            {/* Interactive Mapbox Canvas */}
            <div className="w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden relative border-2 border-neutral-800 bg-neutral-950 shadow-2xl group">
                <div ref={mapContainer} className="w-full h-full" />

                {/* Floating Guide Instructions Pill */}
                <div className="absolute top-3 left-3 right-3 sm:right-auto pointer-events-none z-10">
                    <div className="flex items-center gap-2 bg-[#151718]/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-700 shadow-xl max-w-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
                        <span className="text-[11px] font-bold text-gray-200 truncate">
                            🎯 Drag the green pin directly onto the hostel rooftop
                        </span>
                    </div>
                </div>

                {/* Recenter Campus Button */}
                <div className="absolute top-3 right-3 z-10">
                    <button
                        type="button"
                        onClick={recenterLautech}
                        className="p-2.5 bg-neutral-950/90 text-white hover:text-[#BEF264] border border-gray-700 rounded-full shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                        title="Recenter to LAUTECH Campus"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Bottom Coordinates & Detected Street Bar */}
                <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                    <div className="pointer-events-auto bg-[#151718]/95 backdrop-blur-md border border-gray-700 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                                    <span>Exact Hostel Coordinates</span>
                                    {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                                </p>
                                <p className="text-xs font-bold text-white truncate">
                                    {address || 'Targeting rooftop...'}
                                </p>
                            </div>
                        </div>

                        {/* Coordinates Pill */}
                        <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-[11px] text-gray-300 self-end sm:self-auto shrink-0">
                            <span>Lat: <strong className="text-green-400 font-bold">{coordinates[1].toFixed(5)}</strong></span>
                            <span className="text-gray-600">|</span>
                            <span>Lng: <strong className="text-green-400 font-bold">{coordinates[0].toFixed(5)}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyLocationPicker;
