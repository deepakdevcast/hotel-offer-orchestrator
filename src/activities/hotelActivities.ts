import { Hotel, ProcessedHotel, SupplierResponse } from '../types/hotel';
import { SupplierService } from '../services/supplierService';
import { RedisService } from '../services/redisService';

export class HotelActivities {
  private supplierService: SupplierService;
  private redisService: RedisService;

  constructor() {
    this.supplierService = new SupplierService();
    this.redisService = new RedisService();
  }

  async callSupplierA(city: string): Promise<SupplierResponse> {
    try {
      console.log(`Calling Supplier A for city: ${city}`);
      const hotels = await this.supplierService.getSupplierAHotels(city);
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

  async callSupplierB(city: string): Promise<SupplierResponse> {
    try {
      console.log(`Calling Supplier B for city: ${city}`);
      const hotels = await this.supplierService.getSupplierBHotels(city);
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

  async deduplicateAndSelectBest(
    supplierAResponse: SupplierResponse,
    supplierBResponse: SupplierResponse
  ): Promise<ProcessedHotel[]> {
    console.log('Deduplicating and selecting best offers...');
    
    const hotelMap = new Map<string, ProcessedHotel>();

    // Process Supplier A hotels
    supplierAResponse.hotels.forEach(hotel => {
      const processedHotel: ProcessedHotel = {
        name: hotel.name,
        price: hotel.price,
        supplier: 'Supplier A',
        commissionPct: hotel.commissionPct,
      };
      hotelMap.set(hotel.name, processedHotel);
    });

    // Process Supplier B hotels and compare
    supplierBResponse.hotels.forEach(hotel => {
      const existing = hotelMap.get(hotel.name);
      const newHotel: ProcessedHotel = {
        name: hotel.name,
        price: hotel.price,
        supplier: 'Supplier B',
        commissionPct: hotel.commissionPct,
      };

      if (!existing) {
        // Hotel only exists in Supplier B
        hotelMap.set(hotel.name, newHotel);
      } else {
        // Hotel exists in both, select the cheaper one
        if (hotel.price < existing.price) {
          hotelMap.set(hotel.name, newHotel);
        }
      }
    });

    const result = Array.from(hotelMap.values());
    console.log(`Deduplication complete. Found ${result.length} unique hotels.`);
    return result;
  }

  async cacheResults(city: string, hotels: ProcessedHotel[]): Promise<void> {
    try {
      await this.redisService.cacheHotels(city, hotels);
      console.log(`Cached ${hotels.length} hotels for city: ${city}`);
    } catch (error) {
      console.error('Failed to cache results:', error);
      // Don't throw error as caching is not critical
    }
  }

  async getCachedResults(city: string): Promise<ProcessedHotel[] | null> {
    try {
      return await this.redisService.getCachedHotels(city);
    } catch (error) {
      console.error('Failed to get cached results:', error);
      return null;
    }
  }

  async filterByPrice(
    city: string,
    minPrice?: number,
    maxPrice?: number
  ): Promise<ProcessedHotel[]> {
    try {
      return await this.redisService.filterHotelsByPrice(city, minPrice, maxPrice);
    } catch (error) {
      console.error('Failed to filter by price:', error);
      return [];
    }
  }
}
