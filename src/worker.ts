// src/worker.ts
import { Worker } from 'bullmq';
import { MockDexRouter } from './mockRouter';
import { connection } from './queue'; // <--- IMPORT FROM SHARED FILE

const router = new MockDexRouter();

console.log('[Worker] Starting up...');

export const worker = new Worker('orderQueue', async (job) => {
    console.log(`[Job ${job.id}] Processing started...`);

    // 1. Pending
    await job.updateProgress({ step: 'pending', message: 'Order received and queued' });

    // 2. Routing
    await job.updateProgress({ step: 'routing', message: 'Comparing DEX prices...' });
    const [raydium, meteora] = await Promise.all([
        router.getRaydiumQuote(job.data.amount),
        router.getMeteoraQuote(job.data.amount)
    ]);

    const bestDex = raydium.price < meteora.price ? raydium : meteora;
    console.log(`[Job ${job.id}] Best Price: ${bestDex.dex} @ ${bestDex.price.toFixed(2)}`);

    // 3. Building
    await job.updateProgress({ step: 'building', message: `Building transaction for ${bestDex.dex}` });
    await new Promise(r => setTimeout(r, 500)); 

    // 4. Submitted
    await job.updateProgress({ step: 'submitted', message: 'Transaction sent to Solana network' });

    // 5. Execution
    const result = await router.executeSwap(bestDex.dex);

    return { ...result, price: bestDex.price, dex: bestDex.dex };

}, {
    connection, // Use the shared connection
    concurrency: 10,
    limiter: { max: 100, duration: 60000 }
});