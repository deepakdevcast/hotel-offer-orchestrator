import { createClient, RedisClientType } from 'redis';
import { ProcessedHotel, HotelFilter } from '../types/hotel';
import { config } from '../config';

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: config.redis.url,
    });
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async cacheHotels(city: string, hotels: ProcessedHotel[]): Promise<void> {
    const key = `hotels:${city.toLowerCase()}`;
    await this.client.setEx(key, 3600, JSON.stringify(hotels)); // Cache for 1 hour
  }

  async getCachedHotels(city: string): Promise<ProcessedHotel[] | null> {
    const key = `hotels:${city.toLowerCase()}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async filterHotelsByPrice(
    city: string, 
    minPrice?: number, 
    maxPrice?: number
  ): Promise<ProcessedHotel[]> {
    const cached = await this.getCachedHotels(city);
    if (!cached) {
      return [];
    }

    let filtered = cached;

    if (minPrice !== undefined) {
      filtered = filtered.filter(hotel => hotel.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      filtered = filtered.filter(hotel => hotel.price <= maxPrice);
    }

    return filtered;
  }

  async clearCache(city?: string): Promise<void> {
    if (city) {
      const key = `hotels:${city.toLowerCase()}`;
      await this.client.del(key);
    } else {
      const keys = await this.client.keys('hotels:*');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    }
  }

  async getCacheStats(): Promise<{ keys: number; memory: string }> {
    const keys = await this.client.keys('hotels:*');
    const info = await this.client.info('memory');
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memory = memoryMatch ? memoryMatch[1] : 'unknown';
    
    return {
      keys: keys.length,
      memory,
    };
  }
}
