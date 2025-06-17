import * as XLSX from 'xlsx';

export interface WarehouseTemplate {
  name: string;
  description: string;
}

export interface SalesInvoiceTemplate {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  date: string;
  status: string;
}

export interface CustomerTemplate {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface VendorTemplate {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ItemTemplate {
  name: string;
  code: string;
  unitPrice: number;
  category: string;
  description: string;
}

export interface SalesOrderTemplate {
  orderNumber: string;
  customerName: string;
  amount: number;
  date: string;
  status: string;
}

export interface PurchaseOrderTemplate {
  orderNumber: string;
  vendorName: string;
  amount: number;
  date: string;
  status: string;
}

export interface PurchaseInvoiceTemplate {
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  date: string;
  status: string;
}

export interface AccountTemplate {
  code: string;
  name: string;
  type: string;
  balance: number;
}

export interface DepartmentTemplate {
  name: string;
  description: string;
}

export interface ProjectTemplate {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface LocationTemplate {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmployeeTemplate {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
}

export class ExcelProcessorService {
  generateWarehouseTemplate(): Buffer {
    const templateData: WarehouseTemplate[] = [
      {
        name: 'Example Warehouse 1',
        description: 'Main warehouse for electronics',
      },
      {
        name: 'Example Warehouse 2', 
        description: 'Secondary warehouse for accessories',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 30 }, // name
      { width: 50 }, // description
    ];

    // Add headers styling
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E3F2FD' } },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Warehouses');
    
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  generateSalesInvoiceTemplate(): Buffer {
    const templateData: SalesInvoiceTemplate[] = [
      {
        invoiceNumber: 'INV-2024-001',
        customerName: 'Customer ABC',
        amount: 1500000,
        date: '2024-01-15',
        status: 'paid',
      },
      {
        invoiceNumber: 'INV-2024-002',
        customerName: 'Customer XYZ',
        amount: 2750000,
        date: '2024-01-16',
        status: 'pending',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // invoiceNumber
      { width: 25 }, // customerName
      { width: 15 }, // amount
      { width: 12 }, // date
      { width: 12 }, // status
    ];

    // Add headers styling
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E8F5E8' } },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Invoices');
    
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  parseWarehouseFile(buffer: Buffer): WarehouseTemplate[] {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<WarehouseTemplate>(worksheet);
    
    return data.filter(row => row.name && row.name.trim() !== '');
  }

  parseSalesInvoiceFile(buffer: Buffer): SalesInvoiceTemplate[] {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<SalesInvoiceTemplate>(worksheet);
    
    return data.filter(row => row.invoiceNumber && row.invoiceNumber.trim() !== '');
  }

  validateWarehouseData(data: WarehouseTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      if (!row.name || row.name.trim() === '') {
        errors.push(`Row ${index + 2}: Name is required`);
      }
      if (row.name && row.name.length > 100) {
        errors.push(`Row ${index + 2}: Name must be less than 100 characters`);
      }
      if (row.description && row.description.length > 500) {
        errors.push(`Row ${index + 2}: Description must be less than 500 characters`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  validateSalesInvoiceData(data: SalesInvoiceTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      if (!row.invoiceNumber || row.invoiceNumber.trim() === '') {
        errors.push(`Row ${index + 2}: Invoice number is required`);
      }
      if (!row.customerName || row.customerName.trim() === '') {
        errors.push(`Row ${index + 2}: Customer name is required`);
      }
      if (!row.amount || isNaN(Number(row.amount))) {
        errors.push(`Row ${index + 2}: Amount must be a valid number`);
      }
      if (!row.date) {
        errors.push(`Row ${index + 2}: Date is required`);
      } else {
        const date = new Date(row.date);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${index + 2}: Date must be in valid format (YYYY-MM-DD)`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // Customer methods
  generateCustomerTemplate(): Buffer {
    const templateData: CustomerTemplate[] = [
      { name: 'PT. Contoh Perusahaan', email: 'contact@contoh.com', phone: '021-12345678', address: 'Jl. Sudirman No. 123, Jakarta' },
      { name: 'CV. Mitra Bisnis', email: 'info@mitra.com', phone: '021-87654321', address: 'Jl. Thamrin No. 456, Jakarta' },
    ];
    return this.generateExcelTemplate(templateData, 'Customers');
  }

  parseCustomerFile(buffer: Buffer): CustomerTemplate[] {
    return this.parseExcelFile<CustomerTemplate>(buffer);
  }

  validateCustomerData(data: CustomerTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Vendor methods
  generateVendorTemplate(): Buffer {
    const templateData: VendorTemplate[] = [
      { name: 'PT. Supplier Utama', email: 'sales@supplier.com', phone: '021-11111111', address: 'Jl. Gatot Subroto No. 789, Jakarta' },
      { name: 'CV. Distributor Prima', email: 'contact@distributor.com', phone: '021-22222222', address: 'Jl. Kuningan No. 101, Jakarta' },
    ];
    return this.generateExcelTemplate(templateData, 'Vendors');
  }

  parseVendorFile(buffer: Buffer): VendorTemplate[] {
    return this.parseExcelFile<VendorTemplate>(buffer);
  }

  validateVendorData(data: VendorTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Item methods
  generateItemTemplate(): Buffer {
    const templateData: ItemTemplate[] = [
      { name: 'Laptop Dell Inspiron', code: 'LPT001', unitPrice: 8500000, category: 'Electronics', description: 'Gaming laptop with 16GB RAM' },
      { name: 'Mouse Wireless Logitech', code: 'MSE001', unitPrice: 250000, category: 'Accessories', description: 'Wireless optical mouse' },
    ];
    return this.generateExcelTemplate(templateData, 'Items');
  }

  parseItemFile(buffer: Buffer): ItemTemplate[] {
    return this.parseExcelFile<ItemTemplate>(buffer);
  }

  validateItemData(data: ItemTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
      if (!item.code?.trim()) errors.push(`Row ${index + 2}: Code is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Sales Order methods
  generateSalesOrderTemplate(): Buffer {
    const templateData: SalesOrderTemplate[] = [
      { orderNumber: 'SO-2024-001', customerName: 'PT. Klien Setia', amount: 5000000, date: '2024-01-15', status: 'confirmed' },
      { orderNumber: 'SO-2024-002', customerName: 'CV. Mitra Jaya', amount: 3250000, date: '2024-01-16', status: 'pending' },
    ];
    return this.generateExcelTemplate(templateData, 'Sales Orders');
  }

  parseSalesOrderFile(buffer: Buffer): SalesOrderTemplate[] {
    return this.parseExcelFile<SalesOrderTemplate>(buffer);
  }

  validateSalesOrderData(data: SalesOrderTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.orderNumber?.trim()) errors.push(`Row ${index + 2}: Order number is required`);
      if (!item.customerName?.trim()) errors.push(`Row ${index + 2}: Customer name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Purchase Order methods
  generatePurchaseOrderTemplate(): Buffer {
    const templateData: PurchaseOrderTemplate[] = [
      { orderNumber: 'PO-2024-001', vendorName: 'PT. Supplier Terpercaya', amount: 7500000, date: '2024-01-15', status: 'approved' },
      { orderNumber: 'PO-2024-002', vendorName: 'CV. Distributor Utama', amount: 4200000, date: '2024-01-16', status: 'pending' },
    ];
    return this.generateExcelTemplate(templateData, 'Purchase Orders');
  }

  parsePurchaseOrderFile(buffer: Buffer): PurchaseOrderTemplate[] {
    return this.parseExcelFile<PurchaseOrderTemplate>(buffer);
  }

  validatePurchaseOrderData(data: PurchaseOrderTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.orderNumber?.trim()) errors.push(`Row ${index + 2}: Order number is required`);
      if (!item.vendorName?.trim()) errors.push(`Row ${index + 2}: Vendor name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Purchase Invoice methods
  generatePurchaseInvoiceTemplate(): Buffer {
    const templateData: PurchaseInvoiceTemplate[] = [
      { invoiceNumber: 'PI-2024-001', vendorName: 'PT. Supplier Elektronik', amount: 6800000, date: '2024-01-15', status: 'paid' },
      { invoiceNumber: 'PI-2024-002', vendorName: 'CV. Distributor Komputer', amount: 3900000, date: '2024-01-16', status: 'pending' },
    ];
    return this.generateExcelTemplate(templateData, 'Purchase Invoices');
  }

  parsePurchaseInvoiceFile(buffer: Buffer): PurchaseInvoiceTemplate[] {
    return this.parseExcelFile<PurchaseInvoiceTemplate>(buffer);
  }

  validatePurchaseInvoiceData(data: PurchaseInvoiceTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.invoiceNumber?.trim()) errors.push(`Row ${index + 2}: Invoice number is required`);
      if (!item.vendorName?.trim()) errors.push(`Row ${index + 2}: Vendor name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Account methods
  generateAccountTemplate(): Buffer {
    const templateData: AccountTemplate[] = [
      { code: '1001', name: 'Kas', type: 'Asset', balance: 10000000 },
      { code: '1002', name: 'Bank BCA', type: 'Asset', balance: 25000000 },
      { code: '4001', name: 'Pendapatan Penjualan', type: 'Revenue', balance: 0 },
    ];
    return this.generateExcelTemplate(templateData, 'Accounts');
  }

  parseAccountFile(buffer: Buffer): AccountTemplate[] {
    return this.parseExcelFile<AccountTemplate>(buffer);
  }

  validateAccountData(data: AccountTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.code?.trim()) errors.push(`Row ${index + 2}: Code is required`);
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Department methods
  generateDepartmentTemplate(): Buffer {
    const templateData: DepartmentTemplate[] = [
      { name: 'Sales & Marketing', description: 'Departemen penjualan dan pemasaran' },
      { name: 'Finance & Accounting', description: 'Departemen keuangan dan akuntansi' },
      { name: 'Operations', description: 'Departemen operasional dan produksi' },
    ];
    return this.generateExcelTemplate(templateData, 'Departments');
  }

  parseDepartmentFile(buffer: Buffer): DepartmentTemplate[] {
    return this.parseExcelFile<DepartmentTemplate>(buffer);
  }

  validateDepartmentData(data: DepartmentTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Project methods
  generateProjectTemplate(): Buffer {
    const templateData: ProjectTemplate[] = [
      { name: 'Website Redesign', description: 'Redesign corporate website', status: 'active', startDate: '2024-01-01', endDate: '2024-06-30' },
      { name: 'ERP Implementation', description: 'Implement new ERP system', status: 'planning', startDate: '2024-03-01', endDate: '2024-12-31' },
    ];
    return this.generateExcelTemplate(templateData, 'Projects');
  }

  parseProjectFile(buffer: Buffer): ProjectTemplate[] {
    return this.parseExcelFile<ProjectTemplate>(buffer);
  }

  validateProjectData(data: ProjectTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Location methods
  generateLocationTemplate(): Buffer {
    const templateData: LocationTemplate[] = [
      { name: 'Head Office', address: 'Jl. Sudirman No. 123', city: 'Jakarta', state: 'DKI Jakarta', zipCode: '10110', country: 'Indonesia' },
      { name: 'Branch Office Surabaya', address: 'Jl. Pemuda No. 456', city: 'Surabaya', state: 'Jawa Timur', zipCode: '60271', country: 'Indonesia' },
    ];
    return this.generateExcelTemplate(templateData, 'Locations');
  }

  parseLocationFile(buffer: Buffer): LocationTemplate[] {
    return this.parseExcelFile<LocationTemplate>(buffer);
  }

  validateLocationData(data: LocationTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Employee methods
  generateEmployeeTemplate(): Buffer {
    const templateData: EmployeeTemplate[] = [
      { name: 'John Doe', email: 'john.doe@company.com', phone: '081234567890', position: 'Sales Manager', department: 'Sales', hireDate: '2023-01-15' },
      { name: 'Jane Smith', email: 'jane.smith@company.com', phone: '081987654321', position: 'Accountant', department: 'Finance', hireDate: '2023-03-20' },
    ];
    return this.generateExcelTemplate(templateData, 'Employees');
  }

  parseEmployeeFile(buffer: Buffer): EmployeeTemplate[] {
    return this.parseExcelFile<EmployeeTemplate>(buffer);
  }

  validateEmployeeData(data: EmployeeTemplate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    data.forEach((item, index) => {
      if (!item.name?.trim()) errors.push(`Row ${index + 2}: Name is required`);
    });
    return { valid: errors.length === 0, errors };
  }

  // Helper methods
  private generateExcelTemplate<T>(data: T[], sheetName: string): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const keys = Object.keys(data[0] || {});
    worksheet['!cols'] = keys.map(() => ({ width: 25 }));

    // Add headers styling
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E3F2FD' } },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  private parseExcelFile<T>(buffer: Buffer): T[] {
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<T>(worksheet);
  }
}

export const excelProcessor = new ExcelProcessorService();
