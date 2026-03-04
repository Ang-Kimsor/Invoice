// API routes for invoice operations (SQLite)
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const ExcelJS = require('exceljs');

// Helper function to format date in Cambodia timezone
function formatCambodiaDateTime(dateString) {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Phnom_Penh'
  });

  const parts = formatter.formatToParts(date);
  const formatted = {};
  parts.forEach(part => {
    formatted[part.type] = part.value;
  });

  return `${formatted.month}/${formatted.day}/${formatted.year}, ${formatted.hour}:${formatted.minute}:${formatted.second}`;
}

// POST /api/invoices - Save new invoice
router.post('/', async (req, res) => {
  try {
    const invoiceData = req.body;

    // Validation
    if (!invoiceData.customerName || !invoiceData.items || invoiceData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and items are required'
      });
    }

    // Save invoice to database
    const result = await Invoice.create(invoiceData);
    res.json(result);
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving invoice',
      error: error.message
    });
  }
});

// GET /api/invoices - Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.getAllInvoices();
    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
});

// GET /api/invoices/export-all - Export all invoices to Excel
router.get('/export-all', async (req, res) => {
  try {
    // Get all invoices
    const invoices = await Invoice.getAllInvoices();

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // ===== INVOICES SHEET =====
    const invoicesSheet = workbook.addWorksheet('Invoices');
    invoicesSheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Invoice #', key: 'invoice_number', width: 20 },
      { header: 'Customer', key: 'customer_name', width: 20 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Date', key: "created_at", width: 25 }
    ];

    invoices.forEach(invoice => {
      invoicesSheet.addRow({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer_name,
        total_amount: invoice.total_amount,
        created_at: formatCambodiaDateTime(invoice.created_at)
      });
    });

    // Style header row
    invoicesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    invoicesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    invoicesSheet.getColumn('total_amount').numFmt = '$#,##0.00';

    // ===== ITEMS SHEET =====
    const itemsSheet = workbook.addWorksheet('Items');
    const db = require('../config/db').db;

    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          ii.invoice_id,
          ii.sku,
          ii.item_name,
          ii.description,
          ii.quantity,
          ii.unit_type,
          ii.original_unit,
          ii.price,
          ii.subtotal,
          i.invoice_number
        FROM invoice_items ii
        LEFT JOIN invoices i ON ii.invoice_id = i.id
        ORDER BY ii.invoice_id DESC, ii.id
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    itemsSheet.columns = [
      { header: 'Invoice #', key: 'invoice_number', width: 20 },
      { header: 'SKU', key: 'sku', width: 12 },
      { header: 'Item Name', key: 'item_name', width: 20 },
      { header: 'Description', key: 'description', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Type', key: 'unit_type', width: 12 },
      { header: 'Unit', key: 'original_unit', width: 10 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 12 }
    ];

    items.forEach(item => {
      itemsSheet.addRow({
        invoice_number: item.invoice_number,
        sku: item.sku,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_type: item.unit_type,
        original_unit: item.original_unit,
        price: item.price,
        subtotal: item.subtotal
      });
    });

    itemsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    itemsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    itemsSheet.getColumn('price').numFmt = '$#,##0.00';
    itemsSheet.getColumn('subtotal').numFmt = '$#,##0.00';

    // ===== PRODUCTS SHEET =====
    const productsSheet = workbook.addWorksheet('Products');
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, sku, product_name, description, unit_price, box_price, ctn_price, created_at
        FROM products
        ORDER BY sku ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Add headers
    productsSheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'SKU', key: 'sku', width: 12 },
      { header: 'Product Name', key: 'product_name', width: 25 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Unit Price', key: 'unit_price', width: 12 },
      { header: 'Box Price', key: 'box_price', width: 12 },
      { header: 'CTN Price', key: 'ctn_price', width: 12 },
      { header: 'Created', key: 'created_at', width: 20 }
    ];

    // Add data
    products.forEach(product => {
      productsSheet.addRow({
        id: product.id,
        sku: product.sku,
        product_name: product.product_name,
        description: product.description,
        unit_price: product.unit_price,
        box_price: product.box_price,
        ctn_price: product.ctn_price,
        created_at: formatCambodiaDateTime(product.created_at)
      });
    });

    // Style header row
    productsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    productsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Format price columns as currency
    productsSheet.getColumn('unit_price').numFmt = '$#,##0.00';
    productsSheet.getColumn('box_price').numFmt = '$#,##0.00';
    productsSheet.getColumn('ctn_price').numFmt = '$#,##0.00';


    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Send as download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_Export_${new Date().toISOString().slice(0, 10)}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting invoices',
      error: error.message
    });
  }
});

// GET /api/invoices/:id - Get single invoice with items
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.getInvoiceById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
});

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const result = await Invoice.deleteInvoice(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
});

module.exports = router;
