import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Connection, Client } from '@temporalio/client';
import { config } from './config';
import { RedisService } from './services/redisService';
import { SupplierService } from './services/supplierService';
import { HotelActivities } from './activities/hotelActivities';
import { hotelWorkflow, HotelWorkflowInput } from './workflows/hotelWorkflow';
import { supplierAData, supplierBData, mumbaiData, bangaloreData } from './data/supplierData';

const app = express();
const redisService = new RedisService();
const supplierService = new SupplierService();
let temporalClient: Client;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Initialize services
async function initializeServices() {
  try {
    // Connect to Redis
    await redisService.connect();
    
    // Connect to Temporal
    const connection = await Connection.connect({
      address: config.temporal.address,
    });
    temporalClient = new Client({
      connection,
      namespace: config.temporal.namespace,
    });
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Mock supplier endpoints
app.get('/supplierA/hotels', async (req, res) => {
  try {
    const city = req.query.city as string;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const hotels = await supplierService.getSupplierAHotels(city);
    res.json(hotels);
  } catch (error) {
    console.error('Supplier A error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/supplierB/hotels', async (req, res) => {
  try {
    const city = req.query.city as string;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const hotels = await supplierService.getSupplierBHotels(city);
    res.json(hotels);
  } catch (error) {
    console.error('Supplier B error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Main API endpoints
app.get('/api/hotels', async (req, res) => {
  try {
    const city = req.query.city as string;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const useCache = req.query.useCache !== 'false';

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Validate price parameters
    if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) {
      return res.status(400).json({ error: 'Invalid minPrice parameter' });
    }
    if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
      return res.status(400).json({ error: 'Invalid maxPrice parameter' });
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
    }

    // Start Temporal workflow
    const workflowInput: HotelWorkflowInput = {
      city,
      minPrice,
      maxPrice,
      useCache,
    };

    const handle = await temporalClient.workflow.start(hotelWorkflow, {
      args: [workflowInput],
      taskQueue: 'hotel-orchestrator-queue',
      workflowId: `hotel-workflow-${city}-${Date.now()}`,
    });

    const result = await handle.result();
    
    res.json({
      hotels: result.hotels,
      metadata: {
        fromCache: result.fromCache,
        supplierStatus: result.supplierStatus,
        totalCount: result.hotels.length,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const supplierAHealth = await supplierService.checkSupplierHealth('A');
    const supplierBHealth = await supplierService.checkSupplierHealth('B');
    const redisStats = await redisService.getCacheStats();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: {
          status: 'healthy',
          stats: redisStats,
        },
        temporal: {
          status: 'healthy',
        },
        suppliers: {
          supplierA: {
            status: supplierAHealth ? 'healthy' : 'unhealthy',
          },
          supplierB: {
            status: supplierBHealth ? 'healthy' : 'unhealthy',
          },
        },
      },
    };

    // Determine overall health
    const allHealthy = supplierAHealth && supplierBHealth;
    health.status = allHealthy ? 'healthy' : 'degraded';

    res.status(allHealthy ? 200 : 503).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cache management endpoints
app.delete('/api/cache', async (req, res) => {
  try {
    const city = req.query.city as string;
    await redisService.clearCache(city);
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisService.disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(config.port, () => {
    console.log(`Hotel Offer Orchestrator running on port ${config.port}`);
    console.log(`Health check available at http://localhost:${config.port}/health`);
    console.log(`API endpoints:`);
    console.log(`  GET /api/hotels?city=delhi`);
    console.log(`  GET /api/hotels?city=delhi&minPrice=5000&maxPrice=10000`);
    console.log(`  GET /health`);
    console.log(`  DELETE /api/cache`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
