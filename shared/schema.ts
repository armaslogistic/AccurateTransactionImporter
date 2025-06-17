import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  accurateId: integer("accurate_id").unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importJobs = pgTable("import_jobs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'warehouse' | 'sales-invoice'
  fileName: text("file_name").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'completed' | 'failed'
  totalRecords: integer("total_records").default(0),
  processedRecords: integer("processed_records").default(0),
  successfulRecords: integer("successful_records").default(0),
  failedRecords: integer("failed_records").default(0),
  errors: jsonb("errors").$type<string[]>().default([]),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesInvoices = pgTable("sales_invoices", {
  id: serial("id").primaryKey(),
  accurateId: integer("accurate_id").unique(),
  invoiceNumber: text("invoice_number").notNull(),
  customerName: text("customer_name"),
  amount: integer("amount"), // stored in cents
  status: text("status"),
  date: timestamp("date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiLogs = pgTable("api_logs", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
});

export const insertImportJobSchema = createInsertSchema(importJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertSalesInvoiceSchema = createInsertSchema(salesInvoices).omit({
  id: true,
  createdAt: true,
});

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;

export type ImportJob = typeof importJobs.$inferSelect;
export type InsertImportJob = z.infer<typeof insertImportJobSchema>;

export type SalesInvoice = typeof salesInvoices.$inferSelect;
export type InsertSalesInvoice = z.infer<typeof insertSalesInvoiceSchema>;

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
