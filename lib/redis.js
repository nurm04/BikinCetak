import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3, 
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 50, 2000);
  }
});
redis.on('error', (err) => {
  console.error('[Redis Error] Gagal konek ke Redis:', err.message);
});

export default redis;