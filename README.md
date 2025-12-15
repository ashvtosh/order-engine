# Order Execution Engine

A backend system that executes **Market Orders** by routing them to the best mock DEX (Raydium vs Meteora) on Solana.

## 🚀 Features
- **Smart Routing**: Compares prices between Raydium and Meteora to find the best execution.
- **Queue System**: Uses BullMQ (Redis) to handle concurrency (10 concurrent orders).
- **Real-time Updates**: Streams order status (Pending -> Routing -> Confirmed) via WebSockets.

## 🛠️ Design Decisions
- **Order Type**: I chose **Market Order** because it prioritizes speed and liquidity, which is the standard use case for a DEX aggregator.
- **Architecture**: Separated the API (Server) from the Execution Logic (Worker) to ensure the API stays responsive even under heavy load.

## ⚙️ Setup & Run
1. Install dependencies: `npm install`
2. Ensure Redis is running (Port 6379).
3. Start the engine: `npm run dev`
4. Run the test client: `npx ts-node src/test-client.ts`
