// Export SQLite database to Excel
const { db } = require('./config/db');
const ExcelJS = require('exceljs');
const path = require('path');

// Helper function to convert database promise
function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

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

// Helper function to format date only (no time) in Cambodia timezone
function formatCambodiaDate(dateString) {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Phnom_Penh'
  });

  const parts = formatter.formatToParts(date);
  const formatted = {};
  parts.forEach(part => {
    formatted[part.type] = part.value;
  });

  return `${formatted.month}/${formatted.day}/${formatted.year}`;
}

async function exportToExcel() {
  try {
    console.log('\n📊 Starting export to Excel...\n');

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // ===== INVOICES SHEET =====
    const invoicesSheet = workbook.addWorksheet('Invoices');
    const invoices = await dbAll(`
      SELECT id, invoice_number, customer_name, total_amount, created_at 
      FROM invoices 
      ORDER BY created_at DESC
    `);

    // Add headers
    invoicesSheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Invoice #', key: 'invoice_number', width: 20 },
      { header: 'Customer', key: 'customer_name', width: 20 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Date', key: 'created_at', width: 20 }
    ];

    // Add data
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

    // Format total amount as currency
    invoicesSheet.getColumn('total_amount').numFmt = '$#,##0.00';

    // ===== INVOICE ITEMS SHEET =====
    const itemsSheet = workbook.addWorksheet('Invoice Items');
    const items = await dbAll(`
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
    `);

    // Add headers
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

    // Add data
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

    // Style header row
    itemsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    itemsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Format price columns as currency
    itemsSheet.getColumn('price').numFmt = '$#,##0.00';
    itemsSheet.getColumn('subtotal').numFmt = '$#,##0.00';

    // ===== PRODUCTS SHEET =====
    const productsSheet = workbook.addWorksheet('Products');
    const products = await dbAll(`
      SELECT id, sku, product_name, description, unit_price, box_price, ctn_price, created_at
      FROM products
      ORDER BY sku ASC
    `);

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
        created_at: formatCambodiaDate(product.created_at)
      });
    });

    // Style header row
    productsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    productsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Format price columns as currency
    productsSheet.getColumn('unit_price').numFmt = '$#,##0.00';
    productsSheet.getColumn('box_price').numFmt = '$#,##0.00';
    productsSheet.getColumn('ctn_price').numFmt = '$#,##0.00';

    // Save file
    const exportPath = path.join(__dirname, 'Invoice_Export.xlsx');
    await workbook.xlsx.writeFile(exportPath);

    console.log(`✅ Export completed successfully!`);
    console.log(`📁 File saved: ${exportPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Invoices: ${invoices.length}`);
    console.log(`   - Items: ${items.length}`);
    console.log(`   - Products: ${products.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    process.exit(1);
  }
}

// Run export
exportToExcel();
