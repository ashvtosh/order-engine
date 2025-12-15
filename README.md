# Order Execution Engine

A backend system that executes **Market Orders** by routing them to the best mock DEX (Raydium vs Meteora) on Solana.

## 🌐 Live Demo
**Public URL:** https://order-engine-bvzo.onrender.com

> **Note:** The server is hosted on Render's free tier. It may spin down after inactivity. Please wait 30-60 seconds for the first request to wake it up.

## 🚀 Features
- **Smart Routing**: Compares prices between Raydium and Meteora to find the best execution.
- [cite_start]**Queue System**: Uses BullMQ (Redis) to handle concurrency (10 concurrent orders)[cite: 57].
- [cite_start]**Real-time Updates**: Streams order status (`pending` → `routing` → `confirmed`) via WebSockets[cite: 69].

## 🛠️ Design Decisions (Required)
1.  **Order Type: Market Order**
    * **Why:** I chose Market Orders because they prioritize immediate execution and liquidity. In a real-world DEX aggregator, this is the most common user action (swapping tokens instantly), making it the best candidate for demonstrating speed and routing logic.
2.  **Architecture: Producer/Consumer**
    * **Why:** I separated the API (Fastify) from the Worker (BullMQ). This ensures that heavy routing calculations do not block the HTTP server, allowing the API to handle high throughput even if the execution engine is busy.
3.  **Mock Implementation**
    * **Why:** As per the requirements, I mocked the DEX interactions with realistic network delays (200ms) and price variance to simulate real blockchain conditions without the complexity of wallet management.

## ⚙️ Tech Stack
* **Language:** TypeScript / Node.js
* **Server:** Fastify (Chosen for low overhead and native WebSocket support)
* **Queue:** BullMQ + Redis
* **Deployment:** Render (Web Service + Redis)

## 💻 Local Setup
1.  **Clone the repo:**
    ```bash
    git clone <your-repo-url>
    cd order-engine
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start Redis:**
    * Ensure Redis is running locally on port `6379`.
4.  **Run the Engine:**
    ```bash
    npm run dev
    ```
5.  **Test the System:**
    Open a new terminal and run the test client:
    ```bash
    npx ts-node src/test-client.ts
    ```

## ☁️ Deployment (Render)
This project is configured for deployment on Render.
1.  **Service:** Node.js Web Service
2.  **Build Command:** `npm install`
3.  **Start Command:** `npm start`
4.  **Environment Variables:**
    * `REDIS_URL`: Connection string for the Redis instance (Internal URL).
    * `NPM_CONFIG_PRODUCTION`: `false` (Ensures devDependencies like TypeScript are installed).

## 📡 API Endpoints

### 1. Submit Order
* **URL:** `POST /api/orders/execute`
* **Body:** `{ "amount": 100 }`
* **Response:** `{ "orderId": "1", "wsUrl": "..." }`

### 2. Track Order (WebSocket)
* **URL:** `ws://<host>/ws/orders/:orderId`
* **Events:**
    * `pending`: Order queued.
    * `routing`: Checking prices.
    * `submitted`: Transaction sent.
    * `confirmed`: Swap complete.
