export interface Report {
    gigId: string;
    repId: string;
    companyId: string;
    reason: string;
    latitude: number;
    longitude: number;
    location?: string; // Optional field for location
    imageUrl?: string;
}