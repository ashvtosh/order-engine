import WebSocket from 'ws';

async function testOrder() {
    console.log('1. Submitting Order...');
    const response = await fetch('http://localhost:3000/api/orders/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50 })
    });
    const data: any = await response.json(); 
    console.log('   Order Created:', data);

    if (!data.orderId) return;
    console.log(`2. Connecting to WebSocket for Order ${data.orderId}...`);
    const ws = new WebSocket(`ws://localhost:3000/ws/orders/${data.orderId}`);

    ws.on('open', () => {
        console.log('   [WS] Connected!');
    });
    ws.on('message', (message: any) => {
        const update = JSON.parse(message.toString());
        console.log(`   [Update] Step: ${update.step.toUpperCase()}`);
        if (update.message) console.log(`      -> ${update.message}`);
        if (update.price) console.log(`      -> Executed at: $${update.price.toFixed(2)} on ${update.dex}`);
        
        if (update.step === 'confirmed' || update.step === 'failed') {
            ws.close();
            process.exit(0);
        }
    });
}
testOrder();