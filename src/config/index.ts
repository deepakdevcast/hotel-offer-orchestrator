export const config = {
  port: process.env.PORT || 3000,
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  temporal: {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    useLocalOrchestration: process.env.USE_LOCAL_ORCHESTRATION === 'true',
  },
  suppliers: {
    supplierA: {
      name: 'Supplier A',
      url: '/supplierA/hotels',
    },
    supplierB: {
      name: 'Supplier B',
      url: '/supplierB/hotels',
    },
  },
};
