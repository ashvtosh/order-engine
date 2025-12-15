import { Queue, QueueEvents } from 'bullmq';
export const connection = { 
    host: '127.0.0.1', 
    port: 6379 
};
export const orderQueue = new Queue('orderQueue', { connection });
export const orderQueueEvents = new QueueEvents('orderQueue', { connection });