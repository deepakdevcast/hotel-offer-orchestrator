import { proxyActivities, log } from '@temporalio/workflow';
import { ProcessedHotel } from '../types/hotel';

const activities = proxyActivities<typeof import('../activities/hotelActivities')>({
  startToCloseTimeout: '1 minute',
});

export interface HotelWorkflowInput {
  city: string;
  minPrice?: number;
  maxPrice?: number;
  useCache?: boolean;
}

export interface HotelWorkflowResult {
  hotels: ProcessedHotel[];
  fromCache: boolean;
  supplierStatus: {
    supplierA: 'healthy' | 'unhealthy';
    supplierB: 'healthy' | 'unhealthy';
  };
}

export async function hotelWorkflow(input: HotelWorkflowInput): Promise<HotelWorkflowResult> {
  const { city, minPrice, maxPrice, useCache = true } = input;

  log.info(`Starting hotel workflow for city: ${city}`);

  // Check cache first if requested
  if (useCache) {
    const cached = await activities.getCachedResults(city);
    if (cached && cached.length > 0) {
      log.info(`Found cached results for ${city}, filtering by price if needed`);
      
      let filteredHotels = cached;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filteredHotels = await activities.filterByPrice(city, minPrice, maxPrice);
      }
      
      return {
        hotels: filteredHotels,
        fromCache: true,
        supplierStatus: {
          supplierA: 'healthy',
          supplierB: 'healthy',
        },
      };
    }
  }

  // Call both suppliers in parallel
  log.info(`Calling suppliers for city: ${city}`);
  const [supplierAResponse, supplierBResponse] = await Promise.all([
    activities.callSupplierA(city),
    activities.callSupplierB(city),
  ]);

  // Deduplicate and select best offers
  const deduplicatedHotels = await activities.deduplicateAndSelectBest(supplierAResponse, supplierBResponse);

  // Cache the results
  await activities.cacheResults(city, deduplicatedHotels);

  // Apply price filtering if needed
  let finalHotels = deduplicatedHotels;
  if (minPrice !== undefined || maxPrice !== undefined) {
    finalHotels = await activities.filterByPrice(city, minPrice, maxPrice);
  }

  log.info(`Workflow completed. Found ${finalHotels.length} hotels for ${city}`);

  return {
    hotels: finalHotels,
    fromCache: false,
    supplierStatus: {
      supplierA: supplierAResponse.status,
      supplierB: supplierBResponse.status,
    },
  };
}
