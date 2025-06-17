import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { accurateApi } from "./services/accurate-api";
import { excelProcessor } from "./services/excel-processor";
import { insertWarehouseSchema, insertImportJobSchema, insertSalesInvoiceSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // API Status and connection test
  app.get("/api/status", async (req, res) => {
    try {
      const result = await accurateApi.testConnection();
      await storage.createApiLog({
        endpoint: "/api/status",
        method: "GET",
        statusCode: 200,
        responseTime: result.responseTime,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        connected: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const importJobs = await storage.getImportJobs();
      const warehouses = await storage.getWarehouses();
      
      const totalImports = importJobs.length;
      const successful = importJobs.filter(job => job.status === 'completed').length;
      const failed = importJobs.filter(job => job.status === 'failed').length;
      const warehouseCount = warehouses.length;

      res.json({
        totalImports,
        successful,
        failed,
        warehouses: warehouseCount,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Warehouse operations
  app.get("/api/warehouses", async (req, res) => {
    try {
      const warehouses = await storage.getWarehouses();
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warehouses" });
    }
  });

  app.post("/api/warehouses/sync", async (req, res) => {
    try {
      const result = await accurateApi.listWarehouses();
      
      if (result.s && Array.isArray(result.r)) {
        const syncedWarehouses = [];
        
        for (const warehouseData of result.r) {
          const existing = await storage.getWarehouseByAccurateId(warehouseData.id);
          
          if (!existing) {
            const warehouse = await storage.createWarehouse({
              accurateId: warehouseData.id,
              name: warehouseData.name,
              description: warehouseData.description || null,
            });
            syncedWarehouses.push(warehouse);
          }
        }
        
        res.json({ synced: syncedWarehouses.length, warehouses: syncedWarehouses });
      } else {
        res.status(400).json({ error: "Failed to sync warehouses from Accurate API" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to sync warehouses" });
    }
  });

  // Sales invoices
  app.get("/api/sales-invoices", async (req, res) => {
    try {
      const invoices = await storage.getSalesInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales invoices" });
    }
  });

  app.post("/api/sales-invoices/sync", async (req, res) => {
    try {
      const result = await accurateApi.listSalesInvoices();
      
      if (result.s && Array.isArray(result.r)) {
        const syncedInvoices = [];
        
        for (const invoiceData of result.r) {
          const invoice = await storage.createSalesInvoice({
            accurateId: invoiceData.id,
            invoiceNumber: invoiceData.number,
            customerName: invoiceData.customerName,
            amount: Math.round((invoiceData.amount || 0) * 100), // Convert to cents
            status: invoiceData.status,
            date: invoiceData.date ? new Date(invoiceData.date) : null,
          });
          syncedInvoices.push(invoice);
        }
        
        res.json({ synced: syncedInvoices.length, invoices: syncedInvoices });
      } else {
        res.status(400).json({ error: "Failed to sync sales invoices from Accurate API" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to sync sales invoices" });
    }
  });

  // Template downloads
  app.get("/api/templates/warehouse", (req, res) => {
    try {
      const template = excelProcessor.generateWarehouseTemplate();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="warehouse_template.xlsx"',
      });
      
      res.send(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate warehouse template" });
    }
  });

  app.get("/api/templates/sales-invoice", (req, res) => {
    try {
      const template = excelProcessor.generateSalesInvoiceTemplate();
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="sales_invoice_template.xlsx"',
      });
      
      res.send(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sales invoice template" });
    }
  });

  // Import operations
  app.get("/api/imports", async (req, res) => {
    try {
      const importJobs = await storage.getImportJobs();
      res.json(importJobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch import jobs" });
    }
  });

  app.get("/api/imports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const importJob = await storage.getImportJob(id);
      
      if (!importJob) {
        return res.status(404).json({ error: "Import job not found" });
      }
      
      res.json(importJob);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch import job" });
    }
  });

  app.post("/api/imports/validate", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { type } = req.body;
      
      if (type === 'warehouse') {
        const data = excelProcessor.parseWarehouseFile(req.file.buffer);
        const validation = excelProcessor.validateWarehouseData(data);
        
        res.json({
          valid: validation.valid,
          errors: validation.errors,
          recordCount: data.length,
          preview: data.slice(0, 5), // First 5 rows for preview
        });
      } else if (type === 'sales-invoice') {
        const data = excelProcessor.parseSalesInvoiceFile(req.file.buffer);
        const validation = excelProcessor.validateSalesInvoiceData(data);
        
        res.json({
          valid: validation.valid,
          errors: validation.errors,
          recordCount: data.length,
          preview: data.slice(0, 5),
        });
      } else {
        res.status(400).json({ error: "Invalid import type" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to validate file" });
    }
  });

  app.post("/api/imports", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { type } = req.body;
      
      // Create import job
      const importJob = await storage.createImportJob({
        type,
        fileName: req.file.originalname,
        status: 'processing',
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        errors: [],
      });

      // Process file in background
      processImportAsync(importJob.id, req.file.buffer, type);
      
      res.json(importJob);
    } catch (error) {
      res.status(500).json({ error: "Failed to start import" });
    }
  });

  // API logs
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getApiLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API logs" });
    }
  });

  // Background import processing
  async function processImportAsync(jobId: number, fileBuffer: Buffer, type: string) {
    try {
      await storage.updateImportJob(jobId, { 
        status: 'processing',
        startedAt: new Date(),
      });

      if (type === 'warehouse') {
        const data = excelProcessor.parseWarehouseFile(fileBuffer);
        await storage.updateImportJob(jobId, { totalRecords: data.length });

        let processed = 0;
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const row of data) {
          try {
            // Save to Accurate API
            const result = await accurateApi.saveWarehouse(row.name, row.description);
            
            if (result.s && result.r?.id) {
              // Save to local storage
              await storage.createWarehouse({
                accurateId: result.r.id,
                name: row.name,
                description: row.description || null,
              });
              successful++;
            } else {
              failed++;
              errors.push(`Failed to save ${row.name}: ${result.e || 'Unknown error'}`);
            }
          } catch (error) {
            failed++;
            errors.push(`Error processing ${row.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          processed++;
          
          // Update progress
          await storage.updateImportJob(jobId, {
            processedRecords: processed,
            successfulRecords: successful,
            failedRecords: failed,
            errors,
          });
        }

        await storage.updateImportJob(jobId, {
          status: 'completed',
          completedAt: new Date(),
        });
      }
      // Add sales invoice processing here if needed
    } catch (error) {
      await storage.updateImportJob(jobId, {
        status: 'failed',
        completedAt: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
