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
}

export const excelProcessor = new ExcelProcessorService();
