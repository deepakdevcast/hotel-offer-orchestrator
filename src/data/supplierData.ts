import { Hotel } from '../types/hotel';

// Consolidated mock data for Supplier A with multiple cities
export const supplierAData: Hotel[] = [
  // Delhi
  { hotelId: 'a1', name: 'Holtin', price: 6000, city: 'delhi', commissionPct: 10 },
  { hotelId: 'a2', name: 'Radison', price: 5900, city: 'delhi', commissionPct: 13 },
  { hotelId: 'a3', name: 'Taj Palace', price: 12000, city: 'delhi', commissionPct: 15 },
  { hotelId: 'a4', name: 'Oberoi', price: 15000, city: 'delhi', commissionPct: 12 },
  { hotelId: 'a5', name: 'Le Meridien', price: 8000, city: 'delhi', commissionPct: 18 },
  // Mumbai
  { hotelId: 'a6', name: 'Taj Mahal Palace', price: 18500, city: 'mumbai', commissionPct: 12 },
  { hotelId: 'a7', name: 'Oberoi Mumbai', price: 15800, city: 'mumbai', commissionPct: 15 },
  // Bangalore
  { hotelId: 'a8', name: 'ITC Gardenia', price: 8800, city: 'bangalore', commissionPct: 14 },
  { hotelId: 'a9', name: 'Leela Palace', price: 12200, city: 'bangalore', commissionPct: 18 },
];

// Consolidated mock data for Supplier B with multiple cities
export const supplierBData: Hotel[] = [
  // Delhi (overlaps and uniques)
  { hotelId: 'b1', name: 'Holtin', price: 5340, city: 'delhi', commissionPct: 20 },
  { hotelId: 'b2', name: 'Radison', price: 6100, city: 'delhi', commissionPct: 8 },
  { hotelId: 'b3', name: 'Taj Palace', price: 11500, city: 'delhi', commissionPct: 14 },
  { hotelId: 'b4', name: 'Marriott', price: 9000, city: 'delhi', commissionPct: 16 },
  { hotelId: 'b5', name: 'Hilton', price: 7500, city: 'delhi', commissionPct: 22 },
  // Mumbai
  { hotelId: 'b6', name: 'Taj Mahal Palace', price: 17900, city: 'mumbai', commissionPct: 13 },
  { hotelId: 'b7', name: 'Trident Nariman Point', price: 14000, city: 'mumbai', commissionPct: 11 },
  // Bangalore
  { hotelId: 'b8', name: 'ITC Gardenia', price: 8300, city: 'bangalore', commissionPct: 15 },
  { hotelId: 'b9', name: 'Sheraton Grand', price: 9500, city: 'bangalore', commissionPct: 17 },
];
