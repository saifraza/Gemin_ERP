import Redis from 'ioredis';

console.log('Testing Redis connection...');
console.log('Redis URL:', process.env.REDIS_URL?.substring(0, 50) + '...');

const redis = new Redis(process.env.REDIS_URL || '', {
  retryStrategy: (times) => {
    console.log(`Retry attempt ${times}`);
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  },
  enableOfflineQueue: false,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

redis.on('connect', () => {
  console.log('Redis connected!');
});

redis.on('ready', () => {
  console.log('Redis ready!');
  redis.ping().then(result => {
    console.log('Ping result:', result);
    process.exit(0);
  });
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
  console.error('Error code:', err.code);
  console.error('Error details:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('Timeout - exiting');
  process.exit(1);
}, 30000);