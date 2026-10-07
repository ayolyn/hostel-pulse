"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { 
    OGBOMOSO_BBOX, 
    LAUTECH_MAIN_GATE, 
    KEY_LOCATIONS,
    matchOgbomosoLocation,
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
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

// Zero-token fallbacks
const FALLBACK_DARK = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const FALLBACK_SATELLITE = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

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
        return LAUTECH_MAIN_GATE; // [4.2624, 8.1708]
    });

    const [address, setAddress] = useState(initialAddress);
    const [isSatellite, setIsSatellite] = useState(true); // Default to Satellite for roof-dropping
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchDebounce = useRef<NodeJS.Timeout | null>(null);
    const lastTapTimeRef = useRef<number>(0);

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

    // Create a highly visible, mobile touch-friendly custom marker element
    const createMarkerElement = () => {
        const el = document.createElement('div');
        el.className = 'hostel-map-picker-pin';
        el.style.width = '38px';
        el.style.height = '46px';
        el.style.cursor = 'grab';
        el.style.userSelect = 'none';
        el.style.touchAction = 'none';
        el.innerHTML = `
            <div style="position: relative; width: 38px; height: 46px; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6)); pointer-events: auto;">
                <div style="width: 34px; height: 34px; border-radius: 50%; background: #22c55e; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
                <div style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; margin-top: 2px;"></div>
            </div>
        `;
        return el;
    };

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
            maxBounds: OGBOMOSO_BBOX, // Lock viewport strictly inside Ogbomoso
            attributionControl: false
        });

        newMap.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

        const enhancePickerClarity = (m: mapboxgl.Map) => {
            try {
                if (m.getLayer('satellite')) {
                    m.setPaintProperty('satellite', 'raster-contrast', 0.18);
                    m.setPaintProperty('satellite', 'raster-saturation', 0.22);
                    m.setPaintProperty('satellite', 'raster-brightness-min', 0.02);
                    m.setPaintProperty('satellite', 'raster-brightness-max', 0.98);
                }
                if (m.getLayer('satellite-fallback-layer')) {
                    m.setPaintProperty('satellite-fallback-layer', 'raster-contrast', 0.22);
                    m.setPaintProperty('satellite-fallback-layer', 'raster-saturation', 0.22);
                }
            } catch (e) {
                // Safe ignore
            }
        };

        let onTouchStartHandler: ((e: TouchEvent) => void) | null = null;
        let onTouchEndHandler: ((e: TouchEvent) => void) | null = null;

        newMap.on('load', () => {
            enhancePickerClarity(newMap);

            const markerElement = createMarkerElement();
            const newMarker = new mapboxgl.Marker({ 
                element: markerElement,
                draggable: true, 
                anchor: 'bottom'
            })
                .setLngLat(startCoords)
                .addTo(newMap);

            newMarker.on('drag', () => {
                const lngLat = newMarker.getLngLat();
                setCoordinates([lngLat.lng, lngLat.lat]);
            });

            newMarker.on('dragend', () => {
                const lngLat = newMarker.getLngLat();
                handleCoordinateUpdate(lngLat.lng, lngLat.lat);
            });

            marker.current = newMarker;
            newMap.resize();

            // Mobile-first touch-tap handling directly on canvas
            const canvas = newMap.getCanvas();
            let touchStartTime = 0;
            let touchStartX = 0;
            let touchStartY = 0;

            onTouchStartHandler = (e: TouchEvent) => {
                if (e.touches.length === 1) {
                    touchStartTime = Date.now();
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
            };

            onTouchEndHandler = (e: TouchEvent) => {
                if (Date.now() - touchStartTime < 350 && e.changedTouches.length === 1) {
                    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
                    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
                    if (dx < 12 && dy < 12) {
                        lastTapTimeRef.current = Date.now();
                        const rect = canvas.getBoundingClientRect();
                        const point: [number, number] = [
                            e.changedTouches[0].clientX - rect.left,
                            e.changedTouches[0].clientY - rect.top
                        ];
                        const lngLat = newMap.unproject(point);
                        if (marker.current) {
                            marker.current.setLngLat([lngLat.lng, lngLat.lat]);
                            handleCoordinateUpdate(lngLat.lng, lngLat.lat);
                        }
                    }
                }
            };

            canvas.addEventListener('touchstart', onTouchStartHandler, { passive: true });
            canvas.addEventListener('touchend', onTouchEndHandler, { passive: true });
        });

        // Click anywhere to quickly move the pin (skips if touch tap just handled)
        newMap.on('click', (e) => {
            if (Date.now() - lastTapTimeRef.current < 450) return;
            if (marker.current) {
                marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
                handleCoordinateUpdate(e.lngLat.lng, e.lngLat.lat);
            }
        });

        map.current = newMap;

        const resizeTimer = setTimeout(() => newMap.resize(), 300);

        return () => {
            clearTimeout(resizeTimer);
            if (map.current) {
                const canvas = map.current.getCanvas();
                if (onTouchStartHandler) canvas.removeEventListener('touchstart', onTouchStartHandler);
                if (onTouchEndHandler) canvas.removeEventListener('touchend', onTouchEndHandler);
            }
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

        // Re-attach marker and enhance clarity after style reload
        map.current.once('style.load', () => {
            if (marker.current && map.current) {
                marker.current.addTo(map.current);
            }
            if (toSatellite && map.current) {
                try {
                    if (map.current.getLayer('satellite')) {
                        map.current.setPaintProperty('satellite', 'raster-contrast', 0.18);
                        map.current.setPaintProperty('satellite', 'raster-saturation', 0.22);
                    }
                    if (map.current.getLayer('tile-layer')) {
                        map.current.setPaintProperty('tile-layer', 'raster-contrast', 0.22);
                        map.current.setPaintProperty('tile-layer', 'raster-saturation', 0.20);
                    }
                } catch (e) {}
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
        }, 250);
    };

    const handleSelectSearchResult = (result: GeocodeResult) => {
        setShowResults(false);
        setSearchQuery('');
        setAddress(result.text);

        if (map.current && marker.current) {
            map.current.flyTo({
                center: result.center,
                zoom: 17,
                duration: 1000
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
                duration: 800
            });
            marker.current.setLngLat(LAUTECH_MAIN_GATE);
            handleCoordinateUpdate(LAUTECH_MAIN_GATE[0], LAUTECH_MAIN_GATE[1]);
        }
    };

    // Drop pin at current map center (vital for mobile touch precision)
    const dropPinAtCenter = useCallback(() => {
        if (map.current && marker.current) {
            const center = map.current.getCenter();
            marker.current.setLngLat([center.lng, center.lat]);
            handleCoordinateUpdate(center.lng, center.lat);
        }
    }, [handleCoordinateUpdate]);

    // Sync with external initialAddress changes (e.g. user selects "Takie Market Area" from LocationCombobox)
    useEffect(() => {
        if (!initialAddress || !map.current || !marker.current) return;
        
        // 1. Direct or fuzzy match with enriched key locations
        const match = matchOgbomosoLocation(initialAddress);
        if (match) {
            map.current.flyTo({ center: match.coordinates, zoom: 16.5, duration: 800 });
            marker.current.setLngLat(match.coordinates);
            setCoordinates(match.coordinates);
            setAddress(initialAddress);
            onLocationChange({ lng: match.coordinates[0], lat: match.coordinates[1], address: initialAddress });
            return;
        }

        // 2. Dynamic geocoding fallback for custom addresses
        let cancelled = false;
        searchOgbomosoPlaces(initialAddress).then((results) => {
            if (cancelled || !results || results.length === 0 || !map.current || !marker.current) return;
            const top = results[0];
            map.current.flyTo({ center: top.center, zoom: 16.5, duration: 800 });
            marker.current.setLngLat(top.center);
            setCoordinates(top.center);
            setAddress(top.place_name || initialAddress);
            onLocationChange({ lng: top.center[0], lat: top.center[1], address: initialAddress });
        }).catch(() => {});

        return () => { cancelled = true; };
    }, [initialAddress]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync if edit coordinates are updated
    useEffect(() => {
        if (typeof initialLng === 'number' && typeof initialLat === 'number' && initialLng !== 0 && initialLat !== 0) {
            if (initialLng !== coordinates[0] || initialLat !== coordinates[1]) {
                setCoordinates([initialLng, initialLat]);
                if (map.current && marker.current) {
                    map.current.flyTo({ center: [initialLng, initialLat], zoom: 16.5, duration: 800 });
                    marker.current.setLngLat([initialLng, initialLat]);
                }
            }
        }
    }, [initialLng, initialLat]); // eslint-disable-line react-hooks/exhaustive-deps

    const executeSearch = (queryText: string) => {
        const text = queryText.trim();
        if (text.length < 2) return;
        
        const match = matchOgbomosoLocation(text);
        if (match && map.current && marker.current) {
            map.current.flyTo({ center: match.coordinates, zoom: 16.5, duration: 800 });
            marker.current.setLngLat(match.coordinates);
            handleCoordinateUpdate(match.coordinates[0], match.coordinates[1]);
            setShowResults(false);
            return;
        }

        searchOgbomosoPlaces(text).then(results => {
            if (results.length > 0) {
                handleSelectSearchResult(results[0]);
            }
        });
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Top Helper Bar & Address Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700/80 rounded-xl sm:rounded-2xl px-3 py-2 sm:py-2.5 focus-within:border-[#BEF264] transition-colors shadow-md">
                        <button
                            type="button"
                            onClick={() => executeSearch(searchQuery)}
                            className="p-0.5 text-gray-400 hover:text-[#BEF264] transition-colors"
                            title="Execute search"
                        >
                            <Search className="w-4 h-4 shrink-0" />
                        </button>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    executeSearch(searchQuery);
                                }
                            }}
                            placeholder="Search Ogbomoso area (Under-G, Adenike, Takie)..."
                            className="bg-transparent outline-none text-xs sm:text-sm font-medium text-white w-full placeholder:font-normal placeholder:text-gray-500"
                        />
                        {isSearching ? (
                            <Loader2 className="w-4 h-4 text-[#BEF264] animate-spin shrink-0" />
                        ) : searchQuery.trim().length >= 2 ? (
                            <button
                                type="button"
                                onClick={() => executeSearch(searchQuery)}
                                className="px-2 py-0.5 bg-[#BEF264] text-black text-[10px] font-bold rounded uppercase shrink-0 hover:bg-[#aee64b] transition-colors"
                            >
                                Find
                            </button>
                        ) : null}
                    </div>

                    {/* Auto-suggest dropdown locked to Ogbomoso bbox */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-950/95 backdrop-blur-xl border border-neutral-700 rounded-xl sm:rounded-2xl p-1.5 shadow-2xl z-50 max-h-56 overflow-y-auto">
                            {searchResults.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleSelectSearchResult(r)}
                                    className="w-full text-left px-3 py-2 hover:bg-neutral-800 rounded-lg text-xs font-medium text-gray-200 hover:text-white flex items-center justify-between transition-colors"
                                >
                                    <span className="truncate">{r.place_name}</span>
                                    <span className="text-[10px] text-[#BEF264] font-bold uppercase shrink-0 ml-2">Jump</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Satellite / Dark Mode Toggles */}
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700/80 p-1 rounded-xl sm:rounded-2xl shadow-md shrink-0 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => toggleMapStyle(true)}
                        className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                            isSatellite
                                ? 'bg-[#BEF264] text-black shadow-sm'
                                : 'text-gray-400 hover:text-white'
                        }`}
                        title="Satellite View (Best for pinpointing hostel roofs)"
                    >
                        🛰️ Satellite
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleMapStyle(false)}
                        className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                            !isSatellite
                                ? 'bg-[#BEF264] text-black shadow-sm'
                                : 'text-gray-400 hover:text-white'
                        }`}
                        title="Street Map View"
                    >
                        🗺️ Dark
                    </button>
                </div>
            </div>

            {/* Quick Landmark Jump Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 shrink-0">Jump:</span>
                {[
                    { label: 'Takie', query: 'Takie Market Area' },
                    { label: 'Under-G', query: 'Under-G Area' },
                    { label: 'Adenike', query: 'Adenike Area' },
                    { label: 'Aroje', query: 'Aroje Area' },
                    { label: 'Stadium', query: 'Stadium Area' },
                ].map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                            const match = matchOgbomosoLocation(item.query);
                            if (match && map.current && marker.current) {
                                map.current.flyTo({ center: match.coordinates, zoom: 16.5, duration: 800 });
                                marker.current.setLngLat(match.coordinates);
                                handleCoordinateUpdate(match.coordinates[0], match.coordinates[1]);
                            }
                        }}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/70 hover:border-[#BEF264] rounded-md text-[10px] font-medium text-gray-300 hover:text-white shrink-0 transition-colors"
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Interactive Mapbox Canvas */}
            <div className="w-full h-[320px] sm:h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden relative border border-neutral-800 bg-neutral-950 shadow-xl group">
                <div ref={mapContainer} className="w-full h-full" />

                {/* Floating Guide Instructions Pill */}
                <div className="absolute top-2.5 left-2.5 right-20 sm:right-auto pointer-events-none z-10">
                    <div className="flex items-center gap-2 bg-[#151718]/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 shadow-lg max-w-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        <span className="text-[11px] font-medium text-gray-200 truncate">
                            Tap map or drag pin onto rooftop
                        </span>
                    </div>
                </div>

                {/* Quick Map Action Controls (Pin Center & Recenter) */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={dropPinAtCenter}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#BEF264] text-black hover:bg-[#aee64b] font-bold text-[11px] rounded-full shadow-lg transition-all active:scale-95"
                        title="Place pin at center of current view"
                    >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Pin Center</span>
                    </button>
                    <button
                        type="button"
                        onClick={recenterLautech}
                        className="p-1.5 bg-neutral-900/90 text-white hover:text-[#BEF264] border border-gray-700 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95"
                        title="Recenter to LAUTECH Campus"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Bottom Coordinates & Detected Street Bar */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                    <div className="pointer-events-auto bg-[#151718]/95 backdrop-blur-md border border-gray-700/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xl">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                    <span>Hostel Coordinates</span>
                                    {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                                </p>
                                <p className="text-xs font-medium text-white truncate">
                                    {address || 'Targeting rooftop...'}
                                </p>
                            </div>
                        </div>

                        {/* Coordinates Pill */}
                        <div className="flex items-center gap-2 bg-neutral-900/90 px-2.5 py-1 rounded-lg border border-white/5 font-mono text-[10px] sm:text-[11px] text-gray-300 self-end sm:self-auto shrink-0">
                            <span>Lat: <strong className="text-emerald-400 font-semibold">{coordinates[1].toFixed(5)}</strong></span>
                            <span className="text-gray-600">|</span>
                            <span>Lng: <strong className="text-emerald-400 font-semibold">{coordinates[0].toFixed(5)}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyLocationPicker;
