export interface Hotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

export interface ProcessedHotel {
  name: string;
  price: number;
  supplier: string;
  commissionPct: number;
}

export interface HotelFilter {
  minPrice?: number;
  maxPrice?: number;
}

export interface SupplierResponse {
  hotels: Hotel[];
  supplier: string;
  status: 'healthy' | 'unhealthy';
  error?: string;
}
