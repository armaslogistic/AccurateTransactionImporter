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

  async saveSalesInvoice(data: any) {
    return this.makeRequest('POST', '/accurate/api/sales-invoice/save.do', data);
  }

  async deleteSalesInvoice(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/sales-invoice/delete.do?id=${id}`);
  }

  // Customer operations
  async listCustomers(id?: number) {
    const endpoint = id 
      ? `/accurate/api/customer/list.do?id=${id}`
      : '/accurate/api/customer/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveCustomer(data: any) {
    return this.makeRequest('POST', '/accurate/api/customer/save.do', data);
  }

  async deleteCustomer(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/customer/delete.do?id=${id}`);
  }

  // Vendor operations
  async listVendors(id?: number) {
    const endpoint = id 
      ? `/accurate/api/vendor/list.do?id=${id}`
      : '/accurate/api/vendor/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveVendor(data: any) {
    return this.makeRequest('POST', '/accurate/api/vendor/save.do', data);
  }

  async deleteVendor(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/vendor/delete.do?id=${id}`);
  }

  // Item operations
  async listItems(id?: number) {
    const endpoint = id 
      ? `/accurate/api/item/list.do?id=${id}`
      : '/accurate/api/item/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveItem(data: any) {
    return this.makeRequest('POST', '/accurate/api/item/save.do', data);
  }

  async deleteItem(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/item/delete.do?id=${id}`);
  }

  // Sales Order operations
  async listSalesOrders(id?: number) {
    const endpoint = id 
      ? `/accurate/api/sales-order/list.do?id=${id}`
      : '/accurate/api/sales-order/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveSalesOrder(data: any) {
    return this.makeRequest('POST', '/accurate/api/sales-order/save.do', data);
  }

  async deleteSalesOrder(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/sales-order/delete.do?id=${id}`);
  }

  // Purchase Order operations
  async listPurchaseOrders(id?: number) {
    const endpoint = id 
      ? `/accurate/api/purchase-order/list.do?id=${id}`
      : '/accurate/api/purchase-order/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async savePurchaseOrder(data: any) {
    return this.makeRequest('POST', '/accurate/api/purchase-order/save.do', data);
  }

  async deletePurchaseOrder(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/purchase-order/delete.do?id=${id}`);
  }

  // Purchase Invoice operations
  async listPurchaseInvoices(id?: number) {
    const endpoint = id 
      ? `/accurate/api/purchase-invoice/list.do?id=${id}`
      : '/accurate/api/purchase-invoice/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async savePurchaseInvoice(data: any) {
    return this.makeRequest('POST', '/accurate/api/purchase-invoice/save.do', data);
  }

  async deletePurchaseInvoice(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/purchase-invoice/delete.do?id=${id}`);
  }

  // Account operations
  async listAccounts(id?: number) {
    const endpoint = id 
      ? `/accurate/api/account/list.do?id=${id}`
      : '/accurate/api/account/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveAccount(data: any) {
    return this.makeRequest('POST', '/accurate/api/account/save.do', data);
  }

  async deleteAccount(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/account/delete.do?id=${id}`);
  }

  // Department operations
  async listDepartments(id?: number) {
    const endpoint = id 
      ? `/accurate/api/department/list.do?id=${id}`
      : '/accurate/api/department/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveDepartment(data: any) {
    return this.makeRequest('POST', '/accurate/api/department/save.do', data);
  }

  async deleteDepartment(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/department/delete.do?id=${id}`);
  }

  // Project operations
  async listProjects(id?: number) {
    const endpoint = id 
      ? `/accurate/api/project/list.do?id=${id}`
      : '/accurate/api/project/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveProject(data: any) {
    return this.makeRequest('POST', '/accurate/api/project/save.do', data);
  }

  async deleteProject(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/project/delete.do?id=${id}`);
  }

  // Location operations
  async listLocations(id?: number) {
    const endpoint = id 
      ? `/accurate/api/location/list.do?id=${id}`
      : '/accurate/api/location/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveLocation(data: any) {
    return this.makeRequest('POST', '/accurate/api/location/save.do', data);
  }

  async deleteLocation(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/location/delete.do?id=${id}`);
  }

  // Employee operations
  async listEmployees(id?: number) {
    const endpoint = id 
      ? `/accurate/api/employee/list.do?id=${id}`
      : '/accurate/api/employee/list.do';
    return this.makeRequest('GET', endpoint);
  }

  async saveEmployee(data: any) {
    return this.makeRequest('POST', '/accurate/api/employee/save.do', data);
  }

  async deleteEmployee(id: number) {
    return this.makeRequest('DELETE', `/accurate/api/employee/delete.do?id=${id}`);
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
