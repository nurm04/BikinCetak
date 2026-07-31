// lib/redis.js
import Redis from 'ioredis';

// Secara otomatis akan terhubung ke 127.0.0.1:6379
const redis = new Redis();

export default redis;