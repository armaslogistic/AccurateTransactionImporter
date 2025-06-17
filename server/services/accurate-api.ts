import crypto from 'crypto';

interface AccurateConfig {
  apiHost: string;
  apiToken: string;
  signatureSecret: string;
}

interface AccurateResponse<T = any> {
  s: boolean;
  r: T;
  e?: string;
}

export class AccurateApiService {
  private config: AccurateConfig;

  constructor() {
    this.config = {
      apiHost: process.env.ACCURATE_API_HOST || 'https://zeus.accurate.id',
      apiToken: process.env.ACCURATE_API_TOKEN || '',
      signatureSecret: process.env.ACCURATE_SIGNATURE_SECRET || '',
    };
  }

  private generateSignature(): { timestamp: string; signature: string } {
    // Generate current Jakarta time (UTC+7)
    const now = new Date();
    // Convert to Jakarta timezone by adding 7 hours
    const jakartaOffset = 7 * 60; // Jakarta is UTC+7
    const jakartaTime = new Date(now.getTime() + (jakartaOffset + now.getTimezoneOffset()) * 60 * 1000);
    const pad = (num: number) => num.toString().padStart(2, '0');
    
    const timestamp = `${pad(jakartaTime.getDate())}/${pad(jakartaTime.getMonth() + 1)}/${jakartaTime.getFullYear()} ${pad(jakartaTime.getHours())}:${pad(jakartaTime.getMinutes())}:${pad(jakartaTime.getSeconds())}`;
    
    const signature = crypto
      .createHmac('sha256', this.config.signatureSecret)
      .update(timestamp)
      .digest('base64');

    return { timestamp, signature };
  }

  private getHeaders() {
    const { timestamp, signature } = this.generateSignature();
    
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'X-Api-Timestamp': timestamp,
      'X-Api-Signature': signature,
      'Content-Type': 'application/json',
    };
  }

  async makeRequest<T>(method: string, endpoint: string, data?: any): Promise<AccurateResponse<T>> {
    const url = `${this.config.apiHost}${endpoint}`;
    const headers = this.getHeaders();

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      if (method === 'POST' && endpoint.includes('.do')) {
        // For .do endpoints, use URL parameters
        const params = new URLSearchParams(data);
        const fullUrl = `${url}?${params}`;
        const response = await fetch(fullUrl, { ...options, method });
        return await response.json();
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Warehouse operations
  async saveWarehouse(name: string, description?: string) {
    return this.makeRequest('POST', '/accurate/api/warehouse/save.do', {
      name,
      description: description || '',
    });
  }

  async listWarehouses(id?: number) {
    const endpoint = id 
      ? `/accurate/api/warehouse/list.do?id=${id}`
      : '/accurate/api/warehouse/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async deleteWarehouse(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/warehouse/delete.do?id=${id}`);
  }

  // Sales Invoice operations
  async listSalesInvoices() {
    return this.makeRequest('GET', '/accurate/api/sales-invoice/list.do');
  }

  // Test connection
  async testConnection(): Promise<{ connected: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      await this.listWarehouses();
      const responseTime = Date.now() - startTime;
      return { connected: true, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { 
        connected: false, 
        responseTime, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const accurateApi = new AccurateApiService();
