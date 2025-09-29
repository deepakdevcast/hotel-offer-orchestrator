import { proxyActivities, log } from '@temporalio/workflow';
import { ProcessedHotel, SupplierResponse } from '../types/hotel';

const {
  callSupplierA,
  callSupplierB,
  deduplicateAndSelectBest,
  cacheResults,
  getCachedResults,
  filterByPrice,
} = proxyActivities<typeof import('../activities/hotelActivities').HotelActivities>({
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
    const cached = await getCachedResults(city);
    if (cached && cached.length > 0) {
      log.info(`Found cached results for ${city}, filtering by price if needed`);
      
      let filteredHotels = cached;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filteredHotels = await filterByPrice(city, minPrice, maxPrice);
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
    callSupplierA(city),
    callSupplierB(city),
  ]);

  // Deduplicate and select best offers
  const deduplicatedHotels = await deduplicateAndSelectBest(supplierAResponse, supplierBResponse);

  // Cache the results
  await cacheResults(city, deduplicatedHotels);

  // Apply price filtering if needed
  let finalHotels = deduplicatedHotels;
  if (minPrice !== undefined || maxPrice !== undefined) {
    finalHotels = await filterByPrice(city, minPrice, maxPrice);
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
