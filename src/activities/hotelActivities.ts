import { ProcessedHotel, SupplierResponse } from '../types/hotel';
import { SupplierService } from '../services/supplierService';
import { RedisService } from '../services/redisService';

// Instantiate services once per worker process
const supplierService = new SupplierService();
const redisService = new RedisService();

export async function callSupplierA(city: string): Promise<SupplierResponse> {
  try {
    console.log(`Calling Supplier A for city: ${city}`);
    const hotels = await supplierService.getSupplierAHotels(city);
    return {
      hotels,
      supplier: 'Supplier A',
      status: 'healthy',
    };
  } catch (error) {
    console.error('Supplier A error:', error);
    return {
      hotels: [],
      supplier: 'Supplier A',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function callSupplierB(city: string): Promise<SupplierResponse> {
  try {
    console.log(`Calling Supplier B for city: ${city}`);
    const hotels = await supplierService.getSupplierBHotels(city);
    return {
      hotels,
      supplier: 'Supplier B',
      status: 'healthy',
    };
  } catch (error) {
    console.error('Supplier B error:', error);
    return {
      hotels: [],
      supplier: 'Supplier B',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deduplicateAndSelectBest(
  supplierAResponse: SupplierResponse,
  supplierBResponse: SupplierResponse
): Promise<ProcessedHotel[]> {
  console.log('Deduplicating and selecting best offers...');
  
  const hotelMap = new Map<string, ProcessedHotel>();

  supplierAResponse.hotels.forEach(hotel => {
    const processedHotel: ProcessedHotel = {
      name: hotel.name,
      price: hotel.price,
      supplier: 'Supplier A',
      commissionPct: hotel.commissionPct,
    };
    hotelMap.set(hotel.name, processedHotel);
  });

  supplierBResponse.hotels.forEach(hotel => {
    const existing = hotelMap.get(hotel.name);
    const newHotel: ProcessedHotel = {
      name: hotel.name,
      price: hotel.price,
      supplier: 'Supplier B',
      commissionPct: hotel.commissionPct,
    };

    if (!existing) {
      hotelMap.set(hotel.name, newHotel);
    } else if (hotel.price < existing.price) {
      hotelMap.set(hotel.name, newHotel);
    }
  });

  const result = Array.from(hotelMap.values());
  console.log(`Deduplication complete. Found ${result.length} unique hotels.`);
  return result;
}

export async function cacheResults(city: string, hotels: ProcessedHotel[]): Promise<void> {
  try {
    await redisService.cacheHotels(city, hotels);
    console.log(`Cached ${hotels.length} hotels for city: ${city}`);
  } catch (error) {
    console.error('Failed to cache results:', error);
  }
}

export async function getCachedResults(city: string): Promise<ProcessedHotel[] | null> {
  try {
    return await redisService.getCachedHotels(city);
  } catch (error) {
    console.error('Failed to get cached results:', error);
    return null;
  }
}

export async function filterByPrice(
  city: string,
  minPrice?: number,
  maxPrice?: number
): Promise<ProcessedHotel[]> {
  try {
    return await redisService.filterHotelsByPrice(city, minPrice, maxPrice);
  } catch (error) {
    console.error('Failed to filter by price:', error);
    return [];
  }
}
