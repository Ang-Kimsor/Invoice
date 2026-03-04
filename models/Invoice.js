// Invoice model - handles all database operations for invoices (SQLite)
const { db } = require('../config/db');

class Invoice {
  // Generate unique invoice number (format: INV-20260225-001)
  static generateInvoiceNumber() {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

      // Query to get the count of invoices created today
      db.get(
        `SELECT COUNT(*) as count FROM invoices 
         WHERE DATE(created_at) = ?`,
        [new Date().toISOString().slice(0, 10)],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          const count = (row?.count || 0) + 1;
          const sequenceNumber = String(count).padStart(3, '0');
          resolve(`INV-${today}-${sequenceNumber}`);
        }
      );
    });
  }

  // Save invoice and its items to database
  static create(invoiceData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Generate invoice number
        const invoiceNumber = await this.generateInvoiceNumber();

        // Start transaction
        db.serialize(() => {
          db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Insert invoice
            db.run(
              `INSERT INTO invoices 
               (invoice_number, customer_name, total_amount, created_at) 
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
              [invoiceNumber, invoiceData.customerName, invoiceData.totalAmount],
              function (err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                } else {
                  db.run(`UPDATE invoices 
                  SET 
                  created_at = datetime(created_at, '+7 hours'), 
                  updated_at = datetime(updated_at, '+7 hours') 
                  WHERE invoice_number = ?`,
                    [invoiceNumber]
                  );
                }


                const invoiceId = this.lastID;
                let itemsInserted = 0;
                const totalItems = invoiceData.items.length;

                // Insert invoice items with all available columns
                invoiceData.items.forEach((item) => {
                  db.run(
                    `INSERT INTO invoice_items 
                     (invoice_id, product_id, sku, description, item_name, quantity, unit_type, original_unit, price, subtotal) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [invoiceId, item.productId || null, item.sku || '', item.description || '', item.name, item.quantity, item.unitType || '', item.originalUnit || '', item.price, item.subtotal],
                    (err) => {
                      if (err) {
                        console.error('Insert error:', err.message);
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      } else {
                        db.run(`UPDATE invoice_items 
                          SET 
                          created_at = datetime(created_at, '+7 hours')
                          WHERE invoice_id = ? AND product_id = ?`,
                          [invoiceId, item.productId]
                        );
                      }

                      itemsInserted++;

                      // If all items inserted, commit transaction
                      if (itemsInserted === totalItems) {
                        db.run('COMMIT', (err) => {
                          if (err) {
                            reject(err);
                          } else {
                            resolve({
                              success: true,
                              invoiceId: invoiceId,
                              invoiceNumber: invoiceNumber,
                              message: 'Invoice saved successfully'
                            });
                          }
                        });
                      }
                    }
                  );
                });
              }
            );
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get all invoices (for list view)
  static getAllInvoices() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, invoice_number, customer_name, total_amount, created_at 
         FROM invoices 
         ORDER BY created_at DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // Get single invoice with all its items
  static getInvoiceById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, invoice_number, customer_name, total_amount, created_at 
         FROM invoices 
         WHERE id = ?`,
        [id],
        (err, invoice) => {
          if (err) {
            reject(err);
            return;
          }

          if (!invoice) {
            resolve(null);
            return;
          }

          // Get invoice items
          db.all(
            `SELECT sku, description, item_name, quantity, price, subtotal, unit_type, original_unit 
             FROM invoice_items 
             WHERE invoice_id = ? ORDER BY product_id`,
            [id],
            (err, items) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  ...invoice,
                  items: items || []
                });
              }
            }
          );
        }
      );
    });
  }

  // Add new product
  static addProduct(productData) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO products 
         (sku, product_name, description, unit_price, box_price, ctn_price, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
         `,
        [productData.sku, productData.productName, productData.description,
        productData.unitPrice, productData.boxPrice, productData.ctnPrice],
        function (err) {
          if (err) {
            reject(err);
          } else {
            db.run(`UPDATE products SET created_at = datetime(created_at, '+7 hours'), updated_at = datetime(updated_at, '+7 hours') WHERE sku = ?;`, [productData.sku])
            resolve({
              success: true,
              productId: this.lastID,
              message: 'Product added successfully'
            });
          }
        }
      );
    });
  }

  // Get all products
  static getAllProducts() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, sku, product_name, description, unit_price, box_price, ctn_price, created_at 
         FROM products 
         ORDER BY id ASC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // Get product by SKU
  static getProductBySku(sku) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, sku, product_name, description, unit_price, box_price, ctn_price 
         FROM products 
         WHERE sku = ?`,
        [sku],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Get product by ID
  static getProductById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, sku, product_name, description, unit_price, box_price, ctn_price 
         FROM products 
         WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Update product
  static updateProduct(id, productData) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE products 
         SET product_name = ?, description = ?, unit_price = ?, box_price = ?, ctn_price = ?, updated_at = datetime('now', '+7 hours') 
         WHERE id = ?`,
        [productData.productName, productData.description, productData.unitPrice,
        productData.boxPrice, productData.ctnPrice, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              success: true,
              message: 'Product updated successfully',
              affectedRows: this.changes
            });
          }
        }
      );
    });
  }

  // Delete product
  // static deleteProduct(id) {
  //   return new Promise((resolve, reject) => {
  //     db.run(
  //       'DELETE FROM products WHERE id = ?',
  //       [id],
  //       function (err) {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve({
  //             success: true,
  //             message: 'Product deleted successfully',
  //             affectedRows: this.changes
  //           });
  //         }
  //       }
  //     );
  //   });
  // }

  // Delete invoice
  // static deleteInvoice(id) {
  //   return new Promise((resolve, reject) => {
  //     db.run(
  //       'DELETE FROM invoices WHERE id = ?',
  //       [id],
  //       function (err) {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve({
  //             success: true,
  //             message: 'Invoice deleted successfully',
  //             affectedRows: this.changes
  //           });
  //         }
  //       }
  //     );
  //   });
  // }
}

module.exports = Invoice;
