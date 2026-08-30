export type Zone = string;
export type City = string;
export type State = string;

export interface Property {
    id: number;
    title: string;
    category: 'Hostel' | 'Shop' | 'House' | 'Hotel';
    type: 'Rent' | 'Sale' | 'Shortlet';
    price: string; // Display price e.g. "₦350,000"
    pricing: {
        amount: number; // Base price (Rent, Sale price, or Daily rate)
        agencyFee?: number;
        legalFee?: number;
        inspectionFee: number;
        serviceCharge?: number;
    };
    location: string;
    state: State;
    city: City;
    zone: Zone;
    image: string;
    rating: number;
    reviews: number;
    verificationStatus: 'Verified' | 'Live View' | 'Pending';
    escrowStatus?: 'Locked' | 'Released' | 'Disputed';
    features: string[];
    // Category Specifics
    hostelDetails?: {
        utilityScores: { light: number; water: number };
        distanceToGate: string;
    };
    houseDetails?: {
        landSize: string; // e.g. "1 Plot"
        documents: string[]; // ["C of O", "Survey Plan"]
    };
    shopDetails?: {
        floorSize: string;
        proximityToMarket: string;
    };
    hotelDetails?: {
        dailyRate: number;
        amenities: string[]; // ["WiFi", "AC"]
        checkInHours: string;
    };
}
