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
        name: 'General Area', 
        coordinates: [4.2580, 8.1600] as [number, number], 
        lng: 4.2580, 
        lat: 8.1600, 
        type: 'Residential', 
        color: 'text-purple-500', 
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        description: 'General residential quarters around the campus vicinity.'
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
