import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null 
});
export const orderQueue = new Queue('orderQueue', { connection });
export const orderQueueEvents = new QueueEvents('orderQueue', { connection });
export { connection };