export class MockDexRouter {
  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async getRaydiumQuote(amount: number) {
    await this.sleep(200);
    const basePrice = 100;
    return {
      dex: 'Raydium',
      price: basePrice * (0.98 + Math.random() * 0.04),
      fee: 0.003
    };
  }
  async getMeteoraQuote(amount: number) {
    await this.sleep(200);
    const basePrice = 100;
    return {
      dex: 'Meteora',
      price: basePrice * (0.97 + Math.random() * 0.05),
      fee: 0.002
    };
  }
  async executeSwap(dex: string) {
    await this.sleep(2000 + Math.random() * 1000);
    return {
      txHash: 'tx_' + Math.random().toString(36).substring(7),
      status: 'confirmed'
    };
  }
}