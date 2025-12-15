import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { orderQueue, orderQueueEvents } from './queue';
const server = Fastify();
const startServer = async () => {
    await server.register(websocket);
    server.get('/', async () => {
        return { status: 'online', message: 'Order Execution Engine is Running 🚀' };
    });
    server.post('/api/orders/execute', async (req, reply) => {
        const { amount } = req.body as any || { amount: 10 };
        const job = await orderQueue.add('market-order', { amount }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });
        return { 
            orderId: job.id, 
            status: 'queued', 
            wsUrl: `ws://localhost:3000/ws/orders/${job.id}` 
        };
    });
    server.get('/ws/orders/:orderId', { websocket: true }, (connection: any, req: any) => {
        const { orderId } = req.params as any;
        console.log(`[WS] Client connected for order: ${orderId}`);
        const socket = connection.socket || connection;
        const safeSend = (data: any) => {
            if (socket.readyState === 1) {
                socket.send(JSON.stringify(data));
            }
        };
        const progressListener = async ({ jobId, data }: any) => {
            if (jobId === orderId) safeSend(data);
        };
        const completeListener = async ({ jobId, returnvalue }: any) => {
            if (jobId === orderId) safeSend({ step: 'confirmed', ...returnvalue });
        };
        const failedListener = async ({ jobId, failedReason }: any) => {
            if (jobId === orderId) safeSend({ step: 'failed', error: failedReason });
        };
        orderQueueEvents.on('progress', progressListener);
        orderQueueEvents.on('completed', completeListener);
        orderQueueEvents.on('failed', failedListener);
        socket.on('close', () => {
            orderQueueEvents.off('progress', progressListener);
            orderQueueEvents.off('completed', completeListener);
            orderQueueEvents.off('failed', failedListener);
        });
    });
    try {
        const port = Number(process.env.PORT) || 3000;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
startServer();