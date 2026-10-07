/**
 * Ogbomoso High-Accuracy Geocoding & GIS Utility
 * Strictly fenced to Ogbomoso, Oyo State, Nigeria to prevent erroneous out-of-state results.
 */

// Strict Bounding Box for Ogbomoso: [minLng, minLat, maxLng, maxLat]
export const OGBOMOSO_BBOX: [number, number, number, number] = [4.1900, 8.1000, 4.3100, 8.2200];

// Verified GPS Coordinates for LAUTECH & Key Landmarks (confirmed via Google Maps)
export const LAUTECH_MAIN_GATE: [number, number] = [4.2624, 8.1708]; // Verified: Old Ogbomoso-Ilorin Road
export const OGBOMOSO_MAP_CENTER: [number, number] = [4.2640, 8.1680];

export const KEY_LOCATIONS = [
    { 
        name: 'LAUTECH Main Gate', 
        coordinates: [4.2624, 8.1708] as [number, number], 
        lng: 4.2624, 
        lat: 8.1708, 
        type: 'Landmark', 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        description: 'Main campus security gate, shuttle park and central meeting hub. (Old Ogbomoso-Ilorin Road)'
    },
    { 
        name: 'Under-G Market', 
        coordinates: [4.2618, 8.1635] as [number, number], 
        lng: 4.2618, 
        lat: 8.1635, 
        type: 'Market', 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        description: 'Bustling student food strip near 2nd gate, supermarkets and cyber cafes.'
    },
    { 
        name: 'Adenike Transit Hub', 
        coordinates: [4.2659, 8.1739] as [number, number], 
        lng: 4.2659, 
        lat: 8.1739, 
        type: 'Transport', 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        description: 'High-density student hostel corridor and transit junction, north of campus.'
    },
    { 
        name: 'Takie Zone', 
        coordinates: [4.2490, 8.1400] as [number, number], 
        lng: 4.2490, 
        lat: 8.1400, 
        type: 'Residential', 
        color: 'text-rose-500', 
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        description: 'Commercial town centre, banking sector and main shopping plaza.'
    },
    { 
        name: 'Under-G Area', 
        coordinates: [4.2618, 8.1635] as [number, number], 
        lng: 4.2618, 
        lat: 8.1635, 
        type: 'Student Hub', 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        description: 'Prime student residential belt right beside LAUTECH gate.'
    },
    { 
        name: 'Adenike Area', 
        coordinates: [4.2659, 8.1739] as [number, number], 
        lng: 4.2659, 
        lat: 8.1739, 
        type: 'Student Hub', 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        description: 'Major student hostel area with shops and transit links.'
    },
    { 
        name: 'Takie Market Area', 
        coordinates: [4.2490, 8.1400] as [number, number], 
        lng: 4.2490, 
        lat: 8.1400, 
        type: 'Commercial', 
        color: 'text-rose-500', 
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        description: 'Central town commercial plaza and banking district.'
    },
    { 
        name: 'Aroje Area', 
        coordinates: [4.2720, 8.1820] as [number, number], 
        lng: 4.2720, 
        lat: 8.1820, 
        type: 'Residential', 
        color: 'text-cyan-500', 
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        description: 'Growing student and residential zone along Old Ilorin Road.'
    },
    { 
        name: 'Stadium Area', 
        coordinates: [4.2680, 8.1520] as [number, number], 
        lng: 4.2680, 
        lat: 8.1520, 
        type: 'Recreation', 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        description: 'Township stadium vicinity with modern apartments.'
    },
    { 
        name: 'Care Taker Area', 
        coordinates: [4.2530, 8.1320] as [number, number], 
        lng: 4.2530, 
        lat: 8.1320, 
        type: 'Residential', 
        color: 'text-indigo-500', 
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        description: 'Quiet residential neighborhood connected to town centre.'
    },
    { 
        name: 'Randa Area', 
        coordinates: [4.2420, 8.1250] as [number, number], 
        lng: 4.2420, 
        lat: 8.1250, 
        type: 'Residential', 
        color: 'text-orange-500', 
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        description: 'Southwestern commercial and residential junction.'
    },
    { 
        name: 'General Area', 
        coordinates: [4.2580, 8.1600] as [number, number], 
        lng: 4.2580, 
        lat: 8.1600, 
        type: 'Residential', 
        color: 'text-purple-500', 
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        description: 'General residential quarters around hospital and campus.'
    },
    { 
        name: 'Alata Area', 
        coordinates: [4.2660, 8.1650] as [number, number], 
        lng: 4.2660, 
        lat: 8.1650, 
        type: 'Student Hub', 
        color: 'text-teal-500', 
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        description: 'Quiet enclave adjacent to Under-G and campus fence.'
    },
    { 
        name: 'Ogbomoso General (Map Center)', 
        coordinates: [4.2640, 8.1680] as [number, number], 
        lng: 4.2640, 
        lat: 8.1680, 
        type: 'Center', 
        color: 'text-neutral-400', 
        bg: 'bg-neutral-50 dark:bg-neutral-900/20',
        description: 'Ogbomoso-LAUTECH central reference point.'
    }
];

/**
 * Robust matcher for Ogbomoso location strings to key coordinates
 */
export function matchOgbomosoLocation(query: string): typeof KEY_LOCATIONS[0] | null {
    if (!query || typeof query !== 'string') return null;
    const clean = query.toLowerCase().trim();

    // 1. Direct or substring check
    for (const loc of KEY_LOCATIONS) {
        const locLower = loc.name.toLowerCase();
        if (clean === locLower || clean.includes(locLower) || locLower.includes(clean)) {
            return loc;
        }
    }

    // 2. Token overlap check (ignoring generic stop words like 'area', 'market', 'zone')
    const stopWords = new Set(['area', 'market', 'zone', 'hub', 'vicinity', 'road', 'street']);
    const tokens = clean
        .split(/[\s,./-]+/)
        .map(t => t.trim())
        .filter(t => t.length >= 3 && !stopWords.has(t));

    for (const token of tokens) {
        for (const loc of KEY_LOCATIONS) {
            const locTokens = loc.name
                .toLowerCase()
                .split(/[\s,./-]+/)
                .filter(t => !stopWords.has(t));
            if (locTokens.some(lt => lt.includes(token) || token.includes(lt))) {
                return loc;
            }
        }
    }

    return null;
}

export interface GeocodeResult {
    id: string;
    place_name: string;
    text: string;
    center: [number, number]; // [lng, lat]
    relevance: number;
}

/**
 * Perform Mapbox Geocoding strictly constrained to Ogbomoso bounds & Nigeria country
 */
export async function searchOgbomosoPlaces(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 2) return [];

    const token = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
    if (!token) {
        // Fallback to local key locations match
        const q = query.toLowerCase();
        return KEY_LOCATIONS
            .filter(l => l.name.toLowerCase().includes(q))
            .map(l => ({
                id: l.name,
                place_name: `${l.name}, Ogbomoso, Oyo State, Nigeria`,
                text: l.name,
                center: l.coordinates,
                relevance: 1
            }));
    }

    try {
        const bboxStr = OGBOMOSO_BBOX.join(',');
        const proximityStr = LAUTECH_MAIN_GATE.join(',');
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?bbox=${bboxStr}&proximity=${proximityStr}&country=ng&access_token=${token}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Geocoding HTTP error ${res.status}`);

        const data = await res.json();
        return (data.features || []).map((f: any) => ({
            id: f.id,
            place_name: f.place_name,
            text: f.text,
            center: f.center as [number, number],
            relevance: f.relevance || 1
        }));
    } catch (err) {
        console.warn('[Geocoding] Search failed, falling back to local list:', err);
        const q = query.toLowerCase();
        return KEY_LOCATIONS
            .filter(l => l.name.toLowerCase().includes(q))
            .map(l => ({
                id: l.name,
                place_name: `${l.name}, Ogbomoso`,
                text: l.name,
                center: l.coordinates,
                relevance: 1
            }));
    }
}

/**
 * Reverse geocode [longitude, latitude] to closest street/neighborhood in Ogbomoso
 */
export async function reverseGeocodeOgbomoso(lng: number, lat: number): Promise<string> {
    const token = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
    if (!token) {
        return findClosestKeyLocationName(lng, lat);
    }

    try {
        const bboxStr = OGBOMOSO_BBOX.join(',');
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?bbox=${bboxStr}&country=ng&types=address,poi,neighborhood,locality&access_token=${token}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Reverse geocoding HTTP error ${res.status}`);

        const data = await res.json();
        const feature = data.features?.[0];
        if (feature) {
            const placeName = feature.text || feature.place_name;
            return placeName.replace(/, Oyo, Nigeria/gi, '').replace(/, Nigeria/gi, '').trim();
        }
    } catch (err) {
        console.warn('[Geocoding] Reverse geocoding failed:', err);
    }

    return findClosestKeyLocationName(lng, lat);
}

function findClosestKeyLocationName(lng: number, lat: number): string {
    let closestName = 'Under-G Area, Ogbomoso';
    let minDistance = Infinity;

    for (const loc of KEY_LOCATIONS) {
        const dx = loc.lng - lng;
        const dy = loc.lat - lat;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
            minDistance = dist;
            closestName = `${loc.name} Vicinity, Ogbomoso`;
        }
    }

    return closestName;
}
