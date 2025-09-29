# Hotel Offer Orchestrator

A Node.js application that aggregates overlapping hotel offers from two mock suppliers, deduplicates hotels, and selects the best offer per hotel using Temporal.io for orchestration and Redis for caching.

## Architecture

- **Node.js (TypeScript)** - Main application runtime
- **Express.js** - Web framework for REST API
- **Temporal.io** - Workflow orchestration for supplier calls and deduplication
- **Redis** - Caching and price filtering
- **Docker Compose** - Container orchestration

## Features

- **Parallel Supplier Calls**: Calls two mock suppliers simultaneously
- **Smart Deduplication**: Compares hotels by name and selects the best price
- **Redis Caching**: Caches results for improved performance
- **Price Filtering**: Filter hotels by price range
- **Health Monitoring**: Comprehensive health checks for all services
- **Error Handling**: Robust error handling and logging

##  API Endpoints

### Main Endpoints

- `GET /api/hotels?city=delhi` - Get hotels for a city
- `GET /api/hotels?city=delhi&minPrice=5000&maxPrice=10000` - Get hotels with price filtering
- `GET /health` - Health check for all services
- `DELETE /api/cache` - Clear cache (optional city parameter)

### Mock Supplier Endpoints

- `GET /supplierA/hotels?city=delhi` - Supplier A hotels
- `GET /supplierB/hotels?city=delhi` - Supplier B hotels

## Setup & Deployment

### Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   cd hotel-offer-orchestrator
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Verify the application is running:**
   ```bash
   curl http://localhost:3000/health
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Redis and Temporal (using Docker):**
   ```bash
   docker-compose up redis temporal postgresql
   ```

3. **Start the Temporal worker (in a separate terminal):**
   ```bash
   npm run dev
   ```

4. **Start the main application:**
   ```bash
   npm run dev
   ```

##  Testing

### Using Postman

1. Import the provided `Hotel_Offer_Orchestrator.postman_collection.json`
2. Set the `baseUrl` variable to `http://localhost:3000`
3. Run the collection tests

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Get hotels for Delhi
curl "http://localhost:3000/api/hotels?city=delhi"

# Get hotels with price filtering
curl "http://localhost:3000/api/hotels?city=delhi&minPrice=5000&maxPrice=10000"

# Test supplier endpoints
curl "http://localhost:3000/supplierA/hotels?city=delhi"
curl "http://localhost:3000/supplierB/hotels?city=delhi"
```

##  Response Format

```json
{
  "hotels": [
    {
      "name": "Holtin",
      "price": 5340,
      "supplier": "Supplier B",
      "commissionPct": 20
    },
    {
      "name": "Radison",
      "price": 5900,
      "supplier": "Supplier A",
      "commissionPct": 13
    }
  ],
  "metadata": {
    "fromCache": false,
    "supplierStatus": {
      "supplierA": "healthy",
      "supplierB": "healthy"
    },
    "totalCount": 2
  }
}
```

##  Configuration

Environment variables can be set in `.env` file:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
TEMPORAL_ADDRESS=localhost:7233
```

##  Health Check

The `/health` endpoint provides comprehensive health information:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "redis": {
      "status": "healthy",
      "stats": {
        "keys": 5,
        "memory": "2.5M"
      }
    },
    "temporal": {
      "status": "healthy"
    },
    "suppliers": {
      "supplierA": {
        "status": "healthy"
      },
      "supplierB": {
        "status": "healthy"
      }
    }
  }
}
```


##  Workflow Process

1. **Cache Check**: First checks Redis cache for existing results
2. **Parallel Supplier Calls**: Calls both suppliers simultaneously using Temporal
3. **Deduplication**: Compares hotels by name and selects the cheapest option
4. **Caching**: Stores results in Redis for future requests
5. **Price Filtering**: Applies price range filters if specified
6. **Response**: Returns deduplicated and filtered results

##  Docker Services

- **app**: Main Node.js application
- **redis**: Redis cache server
- **temporal**: Temporal workflow engine
- **postgresql**: Database for Temporal

##  Logging

The application includes comprehensive logging:
- Workflow execution logs
- Supplier call logs
- Error handling logs
- Cache operation logs

##  Error Handling

- Graceful degradation when suppliers are unavailable
- Comprehensive error logging
- Fallback mechanisms for cache failures
- Input validation for all endpoints

## Monitoring

- Health check endpoint for all services
- Redis cache statistics
- Supplier availability monitoring
- Workflow execution tracking
