import { users, warehouses, importJobs, salesInvoices, apiLogs, type User, type InsertUser, type Warehouse, type InsertWarehouse, type ImportJob, type InsertImportJob, type SalesInvoice, type InsertSalesInvoice, type ApiLog, type InsertApiLog } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Warehouses
  getWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  getWarehouseByAccurateId(accurateId: number): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: number): Promise<boolean>;

  // Import Jobs
  getImportJobs(): Promise<ImportJob[]>;
  getImportJob(id: number): Promise<ImportJob | undefined>;
  createImportJob(job: InsertImportJob): Promise<ImportJob>;
  updateImportJob(id: number, job: Partial<InsertImportJob>): Promise<ImportJob | undefined>;
  getImportJobsByStatus(status: string): Promise<ImportJob[]>;

  // Sales Invoices
  getSalesInvoices(): Promise<SalesInvoice[]>;
  getSalesInvoice(id: number): Promise<SalesInvoice | undefined>;
  createSalesInvoice(invoice: InsertSalesInvoice): Promise<SalesInvoice>;

  // API Logs
  getApiLogs(limit?: number): Promise<ApiLog[]>;
  createApiLog(log: InsertApiLog): Promise<ApiLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private warehouses: Map<number, Warehouse>;
  private importJobs: Map<number, ImportJob>;
  private salesInvoices: Map<number, SalesInvoice>;
  private apiLogs: Map<number, ApiLog>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.warehouses = new Map();
    this.importJobs = new Map();
    this.salesInvoices = new Map();
    this.apiLogs = new Map();
    this.currentId = {
      users: 1,
      warehouses: 1,
      importJobs: 1,
      salesInvoices: 1,
      apiLogs: 1,
    };
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values());
  }

  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    return this.warehouses.get(id);
  }

  async getWarehouseByAccurateId(accurateId: number): Promise<Warehouse | undefined> {
    return Array.from(this.warehouses.values()).find(w => w.accurateId === accurateId);
  }

  async createWarehouse(insertWarehouse: InsertWarehouse): Promise<Warehouse> {
    const id = this.currentId.warehouses++;
    const warehouse: Warehouse = {
      ...insertWarehouse,
      id,
      createdAt: new Date(),
    };
    this.warehouses.set(id, warehouse);
    return warehouse;
  }

  async updateWarehouse(id: number, update: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) return undefined;
    
    const updated = { ...warehouse, ...update };
    this.warehouses.set(id, updated);
    return updated;
  }

  async deleteWarehouse(id: number): Promise<boolean> {
    return this.warehouses.delete(id);
  }

  // Import Jobs
  async getImportJobs(): Promise<ImportJob[]> {
    return Array.from(this.importJobs.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getImportJob(id: number): Promise<ImportJob | undefined> {
    return this.importJobs.get(id);
  }

  async createImportJob(insertJob: InsertImportJob): Promise<ImportJob> {
    const id = this.currentId.importJobs++;
    const job: ImportJob = {
      ...insertJob,
      id,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
    this.importJobs.set(id, job);
    return job;
  }

  async updateImportJob(id: number, update: Partial<InsertImportJob>): Promise<ImportJob | undefined> {
    const job = this.importJobs.get(id);
    if (!job) return undefined;
    
    const updated = { ...job, ...update };
    this.importJobs.set(id, updated);
    return updated;
  }

  async getImportJobsByStatus(status: string): Promise<ImportJob[]> {
    return Array.from(this.importJobs.values()).filter(job => job.status === status);
  }

  // Sales Invoices
  async getSalesInvoices(): Promise<SalesInvoice[]> {
    return Array.from(this.salesInvoices.values());
  }

  async getSalesInvoice(id: number): Promise<SalesInvoice | undefined> {
    return this.salesInvoices.get(id);
  }

  async createSalesInvoice(insertInvoice: InsertSalesInvoice): Promise<SalesInvoice> {
    const id = this.currentId.salesInvoices++;
    const invoice: SalesInvoice = {
      ...insertInvoice,
      id,
      createdAt: new Date(),
    };
    this.salesInvoices.set(id, invoice);
    return invoice;
  }

  // API Logs
  async getApiLogs(limit: number = 50): Promise<ApiLog[]> {
    const logs = Array.from(this.apiLogs.values())
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
    return logs.slice(0, limit);
  }

  async createApiLog(insertLog: InsertApiLog): Promise<ApiLog> {
    const id = this.currentId.apiLogs++;
    const log: ApiLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    this.apiLogs.set(id, log);
    return log;
  }
}

export const storage = new MemStorage();
