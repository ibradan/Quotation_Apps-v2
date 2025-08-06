const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const PDFDocument = require('pdfkit');
const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Inisialisasi database
const db = new sqlite3.Database('./quotation.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT,
      date TEXT,
      status TEXT,
      title TEXT DEFAULT 'PENAWARAN BARANG/JASA',
      quotation_number TEXT,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 11,
      total REAL DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER,
      name TEXT,
      type TEXT,
      qty INTEGER,
      price REAL,
      unit TEXT,
      stock INTEGER DEFAULT 0,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT DEFAULT 'QUOTATION APPS',
      company_address TEXT DEFAULT 'Jl. Contoh No. 123',
      company_city TEXT DEFAULT 'Jakarta, Indonesia 12345',
      company_phone TEXT DEFAULT '+62 21 1234 5678',
      company_email TEXT DEFAULT 'info@quotationapps.com',
      company_website TEXT DEFAULT '',
      company_logo TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT,
      date TEXT,
      status TEXT DEFAULT 'draft',
      title TEXT DEFAULT 'INVOICE BARANG/JASA',
      invoice_number TEXT,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 11,
      total REAL DEFAULT 0,
      due_date TEXT,
      payment_terms TEXT DEFAULT 'Net 30'
    )`);
  }
});

// Pastikan kolom unit ada di tabel items
const addUnitColumn = () => {
  db.all("PRAGMA table_info(items)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'unit')) {
      db.run("ALTER TABLE items ADD COLUMN unit TEXT");
    }
  });
};
addUnitColumn();

// Pastikan kolom stock ada di tabel items
const addStockColumn = () => {
  db.all("PRAGMA table_info(items)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'stock')) {
      db.run("ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT 0");
    }
  });
};
addStockColumn();

// Pastikan kolom title ada di tabel quotations
const addTitleColumn = () => {
  db.all("PRAGMA table_info(quotations)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'title')) {
      db.run("ALTER TABLE quotations ADD COLUMN title TEXT DEFAULT 'PENAWARAN BARANG/JASA'");
    }
  });
};
addTitleColumn();

// Pastikan kolom discount ada di tabel quotations
const addDiscountColumn = () => {
  db.all("PRAGMA table_info(quotations)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'discount')) {
      db.run("ALTER TABLE quotations ADD COLUMN discount REAL DEFAULT 0");
    }
  });
};
addDiscountColumn();

// Pastikan kolom tax ada di tabel quotations
const addTaxColumn = () => {
  db.all("PRAGMA table_info(quotations)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'tax')) {
      db.run("ALTER TABLE quotations ADD COLUMN tax REAL DEFAULT 11");
    }
  });
};
addTaxColumn();

// Pastikan kolom quotation_number ada di tabel quotations
const addQuotationNumberColumn = () => {
  db.all("PRAGMA table_info(quotations)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'quotation_number')) {
      db.run("ALTER TABLE quotations ADD COLUMN quotation_number TEXT");
    }
  });
};
addQuotationNumberColumn();

// Pastikan kolom total ada di tabel quotations
const addTotalColumn = () => {
  db.all("PRAGMA table_info(quotations)", (err, rows) => {
    if (rows && !rows.some(col => col.name === 'total')) {
      db.run("ALTER TABLE quotations ADD COLUMN total REAL DEFAULT 0");
    }
  });
};
addTotalColumn();

// Tambah tabel history untuk quotations dan items
const initHistoryTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS history_quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER,
    data TEXT,
    updated_at TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS history_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    data TEXT,
    updated_at TEXT
  )`);
};
initHistoryTables();

// Inisialisasi settings default
const initSettings = () => {
  db.get('SELECT * FROM settings LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error checking settings:', err);
      return;
    }
    if (!row) {
      // Insert default settings jika belum ada
      db.run(`INSERT INTO settings (
        company_name, company_address, company_city, company_phone, company_email, company_website
      ) VALUES (?, ?, ?, ?, ?, ?)`, [
        'QUOTATION APPS',
        'Jl. Contoh No. 123',
        'Jakarta, Indonesia 12345',
        '+62 21 1234 5678',
        'info@quotationapps.com',
        ''
      ], (err2) => {
        if (err2) {
          console.error('Error inserting default settings:', err2);
        }
      });
    }
  });
};
initSettings();

// Helper: simpan versi lama sebelum update/hapus
function saveQuotationHistory(id) {
  db.get('SELECT * FROM quotations WHERE id=?', [id], (err, row) => {
    if (row) {
      db.run('INSERT INTO history_quotations (quotation_id, data, updated_at) VALUES (?, ?, ?)',
        [id, JSON.stringify(row), new Date().toISOString()]);
    }
  });
}
function saveItemHistory(id) {
  db.get('SELECT * FROM items WHERE id=?', [id], (err, row) => {
    if (row) {
      db.run('INSERT INTO history_items (item_id, data, updated_at) VALUES (?, ?, ?)',
        [id, JSON.stringify(row), new Date().toISOString()]);
    }
  });
}

// Fungsi untuk menghitung total quotation
function calculateQuotationTotal(quotationId, callback) {
  db.all('SELECT * FROM items WHERE quotation_id = ?', [quotationId], (err, items) => {
    if (err) {
      console.error('Error calculating total:', err);
      callback(0);
      return;
    }
    
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.price * item.qty);
    });
    
    // Get quotation discount and tax
    db.get('SELECT discount, tax FROM quotations WHERE id = ?', [quotationId], (err2, quotation) => {
      if (err2 || !quotation) {
        callback(subtotal);
        return;
      }
      
      const discountAmount = (subtotal * quotation.discount) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * quotation.tax) / 100;
      const total = afterDiscount + taxAmount;
      
      callback(total);
    });
  });
}

// Endpoint dasar
app.get('/', (req, res) => {
  res.send('Quotation API running');
});

// TODO: CRUD endpoint untuk quotations dan items

// CRUD Items
app.get('/items', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/items', (req, res) => {
  const { name, type, qty, unit, price, stock } = req.body;
  
  // Validasi input
  if (!name || !type || !qty || !unit || !price) {
    return res.status(400).json({ error: 'Semua field harus diisi (name, type, qty, unit, price)' });
  }
  
  if (qty <= 0 || price < 0) {
    return res.status(400).json({ error: 'Qty harus > 0 dan price harus >= 0' });
  }
  
  if (stock < 0) {
    return res.status(400).json({ error: 'Stock harus >= 0' });
  }
  
  // Check for duplicate items (same name, type, and unit)
  db.get('SELECT * FROM items WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND type = ? AND LOWER(TRIM(unit)) = LOWER(TRIM(?))', 
    [name, type, unit], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (row) {
        return res.status(400).json({ 
          error: `Item dengan nama "${name}", tipe "${type}", dan satuan "${unit}" sudah ada! Silakan gunakan nama yang berbeda atau edit item yang sudah ada.` 
        });
      }
      
      db.run('INSERT INTO items (name, type, qty, unit, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [name, type, qty, unit, price, stock || 0],
        function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ id: this.lastID, name, type, qty, unit, price, stock: stock || 0 });
        }
      );
    }
  );
});

// CRUD Items (update: simpan history sebelum update/hapus)
app.put('/items/:id', (req, res) => {
  const { name, type, qty, unit, price, stock } = req.body;
  
  // Validasi input
  if (!name || !type || !qty || !unit || !price) {
    return res.status(400).json({ error: 'Semua field harus diisi (name, type, qty, unit, price)' });
  }
  
  if (qty <= 0 || price < 0) {
    return res.status(400).json({ error: 'Qty harus > 0 dan price harus >= 0' });
  }
  
  if (stock < 0) {
    return res.status(400).json({ error: 'Stock harus >= 0' });
  }
  
  // Cek apakah item exists
  db.get('SELECT * FROM items WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item tidak ditemukan' });
    
    // Check for duplicate items (same name, type, and unit) excluding current item
    db.get('SELECT * FROM items WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND type = ? AND LOWER(TRIM(unit)) = LOWER(TRIM(?)) AND id != ?', 
      [name, type, unit, req.params.id], (err2, duplicateRow) => {
        if (err2) return res.status(500).json({ error: err2.message });
        
        if (duplicateRow) {
          return res.status(400).json({ 
            error: `Item dengan nama "${name}", tipe "${type}", dan satuan "${unit}" sudah ada! Silakan gunakan nama yang berbeda atau edit item yang sudah ada.` 
          });
        }
        
        saveItemHistory(req.params.id);
        db.run('UPDATE items SET name=?, type=?, qty=?, unit=?, price=?, stock=? WHERE id=?',
          [name, type, qty, unit, price, stock || 0, req.params.id],
          function(err3) {
            if (err3) return res.status(500).json({ error: err3.message });
            res.json({ id: req.params.id, name, type, qty, unit, price, stock: stock || 0 });
          }
        );
      }
    );
  });
});

app.delete('/items/:id', (req, res) => {
  // Cek apakah item exists
  db.get('SELECT * FROM items WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item tidak ditemukan' });
    
    saveItemHistory(req.params.id);
    db.run('DELETE FROM items WHERE id=?', [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

// CRUD Customers
app.get('/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/customers', (req, res) => {
  const { name, email, phone, address, city } = req.body;
  
  // Validasi input
  if (!name) {
    return res.status(400).json({ error: 'Nama customer harus diisi' });
  }
  
  db.run('INSERT INTO customers (name, email, phone, address, city) VALUES (?, ?, ?, ?, ?)',
    [name, email || '', phone || '', address || '', city || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, email, phone, address, city });
    }
  );
});

app.put('/customers/:id', (req, res) => {
  const { name, email, phone, address, city } = req.body;
  
  // Validasi input
  if (!name) {
    return res.status(400).json({ error: 'Nama customer harus diisi' });
  }
  
  // Cek apakah customer exists
  db.get('SELECT * FROM customers WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Customer tidak ditemukan' });
    
    db.run('UPDATE customers SET name=?, email=?, phone=?, address=?, city=? WHERE id=?',
      [name, email || '', phone || '', address || '', city || '', req.params.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ id: req.params.id, name, email, phone, address, city });
      }
    );
  });
});

app.delete('/customers/:id', (req, res) => {
  // Cek apakah customer exists
  db.get('SELECT * FROM customers WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Customer tidak ditemukan' });
    
    db.run('DELETE FROM customers WHERE id=?', [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Customer berhasil dihapus' });
    });
  });
});

// CRUD Settings
app.get('/settings', (req, res) => {
  db.get('SELECT * FROM settings LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      // Return default settings jika belum ada data
      res.json({
        company_name: 'QUOTATION APPS',
        company_address: 'Jl. Contoh No. 123',
        company_city: 'Jakarta, Indonesia 12345',
        company_phone: '+62 21 1234 5678',
        company_email: 'info@quotationapps.com',
        company_website: '',
        company_logo: ''
      });
    } else {
      res.json(row);
    }
  });
});

app.put('/settings', (req, res) => {
  const { company_name, company_address, company_city, company_phone, company_email, company_website, company_logo } = req.body;
  
  // Validasi input
  if (!company_name) {
    return res.status(400).json({ error: 'Nama perusahaan harus diisi' });
  }
  
  db.get('SELECT * FROM settings LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row) {
      // Update existing settings
      db.run(`UPDATE settings SET 
        company_name=?, company_address=?, company_city=?, company_phone=?, 
        company_email=?, company_website=?, company_logo=?, updated_at=CURRENT_TIMESTAMP 
        WHERE id=?`, 
        [company_name, company_address || '', company_city || '', company_phone || '', 
         company_email || '', company_website || '', company_logo || '', row.id],
        function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ 
            id: row.id, company_name, company_address, company_city, company_phone, 
            company_email, company_website, company_logo 
          });
        }
      );
    } else {
      // Insert new settings
      db.run(`INSERT INTO settings (
        company_name, company_address, company_city, company_phone, company_email, company_website, company_logo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company_name, company_address || '', company_city || '', company_phone || '', 
         company_email || '', company_website || '', company_logo || ''],
        function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ 
            id: this.lastID, company_name, company_address, company_city, company_phone, 
            company_email, company_website, company_logo 
          });
        }
      );
    }
  });
});

// CRUD Quotations
app.get('/quotations', (req, res) => {
  db.all('SELECT * FROM quotations', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/quotations', (req, res) => {
  const { customer, customer_name, date, status, title, quotation_number, discount, tax, items } = req.body;
  
  // Handle both customer and customer_name fields
  const customerValue = customer || customer_name;
  
  // Simple validation
  if (!customerValue || customerValue.trim() === '') {
    return res.status(400).json({ error: 'Customer harus diisi' });
  }
  
  if (!date || date.trim() === '') {
    return res.status(400).json({ error: 'Date harus diisi' });
  }
  
  if (!status || status.trim() === '') {
    return res.status(400).json({ error: 'Status harus diisi' });
  }
  
  db.run('INSERT INTO quotations (customer, date, status, title, quotation_number, discount, tax) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [customerValue, date, status, title || 'PENAWARAN BARANG/JASA', quotation_number, discount || 0, tax || 11],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const quotationId = this.lastID;
      
      // Jika ada items, insert items
      if (items && items.length > 0) {
        let completed = 0;
        let hasError = false;
        
        items.forEach((item, index) => {
          db.run('INSERT INTO items (quotation_id, name, type, qty, unit, price) VALUES (?, ?, ?, ?, ?, ?)',
            [quotationId, item.name, item.type, item.qty, item.unit, item.price],
            function(err2) {
              if (err2 && !hasError) {
                hasError = true;
                return res.status(500).json({ error: `Gagal insert item ${index + 1}: ${err2.message}` });
              }
              
              completed++;
              if (completed === items.length && !hasError) {
                // Calculate and update total
                calculateQuotationTotal(quotationId, (total) => {
                  db.run('UPDATE quotations SET total = ? WHERE id = ?', [total, quotationId], (err3) => {
                    if (err3) console.error('Error updating total:', err3);
                    
                    res.json({ 
                      id: quotationId, 
                      customer: customerValue, 
                      date, 
                      status, 
                      title: title || 'PENAWARAN BARANG/JASA',
                      quotation_number,
                      discount: discount || 0,
                      tax: tax || 11,
                      total: total,
                      items
                    });
                  });
                });
              }
            }
          );
        });
      } else {
        res.json({ 
          id: quotationId, 
          customer: customerValue, 
          date, 
          status,
          title: title || 'PENAWARAN BARANG/JASA',
          quotation_number,
          discount: discount || 0,
          tax: tax || 11,
          total: 0
        });
      }
    }
  );
});

app.put('/quotations/:id', (req, res) => {
  const { customer, date, status, title, quotation_number, discount, tax, items } = req.body;
  
  // Validasi input yang lebih ketat
  if (!customer || customer.trim() === '') {
    return res.status(400).json({ error: 'Customer harus diisi' });
  }
  
  if (!date || date.trim() === '') {
    return res.status(400).json({ error: 'Date harus diisi' });
  }
  
  if (!status || status.trim() === '') {
    return res.status(400).json({ error: 'Status harus diisi' });
  }
  
  // Cek apakah quotation exists
  db.get('SELECT * FROM quotations WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Quotation tidak ditemukan' });
    
    saveQuotationHistory(req.params.id);
    
    // Update quotation
    db.run('UPDATE quotations SET customer=?, date=?, status=?, title=?, quotation_number=?, discount=?, tax=? WHERE id=?',
      [customer, date, status, title || 'PENAWARAN BARANG/JASA', quotation_number, discount || 0, tax || 11, req.params.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        
        // Jika ada items, update items
        if (items && items.length >= 0) {
          // Hapus items lama
          db.run('DELETE FROM items WHERE quotation_id=?', [req.params.id], function(err3) {
            if (err3) return res.status(500).json({ error: err3.message });
            
            // Insert items baru
            if (items.length > 0) {
              let completed = 0;
              let hasError = false;
              
              items.forEach((item, index) => {
                db.run('INSERT INTO items (quotation_id, name, type, qty, unit, price) VALUES (?, ?, ?, ?, ?, ?)',
                  [req.params.id, item.name, item.type, item.qty, item.unit, item.price],
                  function(err4) {
                    if (err4 && !hasError) {
                      hasError = true;
                      return res.status(500).json({ error: `Gagal insert item ${index + 1}: ${err4.message}` });
                    }
                    
                    completed++;
                    if (completed === items.length && !hasError) {
                      // Calculate and update total
                      calculateQuotationTotal(req.params.id, (total) => {
                        db.run('UPDATE quotations SET total = ? WHERE id = ?', [total, req.params.id], (err5) => {
                          if (err5) console.error('Error updating total:', err5);
                          
                          res.json({ 
                            id: req.params.id, 
                            customer, 
                            date, 
                            status, 
                            title: title || 'PENAWARAN BARANG/JASA', 
                            quotation_number, 
                            discount: discount || 0, 
                            tax: tax || 11, 
                            total: total,
                            items 
                          });
                        });
                      });
                    }
                  }
                );
              });
            } else {
              // Calculate and update total for empty items
              calculateQuotationTotal(req.params.id, (total) => {
                db.run('UPDATE quotations SET total = ? WHERE id = ?', [total, req.params.id], (err5) => {
                  if (err5) console.error('Error updating total:', err5);
                  
                  res.json({ 
                    id: req.params.id, 
                    customer, 
                    date, 
                    status, 
                    title: title || 'PENAWARAN BARANG/JASA', 
                    quotation_number, 
                    discount: discount || 0, 
                    tax: tax || 11, 
                    total: total
                  });
                });
              });
            }
          });
        } else {
          res.json({ id: req.params.id, customer, date, status });
        }
      }
    );
  });
});
app.delete('/quotations/:id', (req, res) => {
  // Cek apakah quotation exists
  db.get('SELECT * FROM quotations WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Quotation tidak ditemukan' });
    
    saveQuotationHistory(req.params.id);
    
    // Hapus items terkait dulu
    db.run('DELETE FROM items WHERE quotation_id=?', [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      
      // Kemudian hapus quotation
      db.run('DELETE FROM quotations WHERE id=?', [req.params.id], function(err3) {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ success: true });
      });
    });
  });
});

// Relasi: GET semua items untuk quotation tertentu
app.get('/quotation-items/:quotation_id', (req, res) => {
  db.all('SELECT * FROM items WHERE quotation_id=?', [req.params.quotation_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// CRUD Quotations (contoh minimal, tambahkan revisi)
app.put('/quotations/:id', (req, res) => {
  const { customer, date, status, title, quotation_number, discount, tax } = req.body;
  
  // Validasi input
  if (!customer || !date || !status) {
    return res.status(400).json({ error: 'Customer, date, dan status harus diisi' });
  }
  
  // Cek apakah quotation exists
  db.get('SELECT * FROM quotations WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Quotation tidak ditemukan' });
    
    saveQuotationHistory(req.params.id);
    db.run('UPDATE quotations SET customer=?, date=?, status=?, title=?, quotation_number=?, discount=?, tax=? WHERE id=?',
      [customer, date, status, title || 'PENAWARAN BARANG/JASA', quotation_number, discount || 0, tax || 11, req.params.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ id: req.params.id, customer, date, status, title: title || 'PENAWARAN BARANG/JASA', quotation_number, discount: discount || 0, tax: tax || 11 });
      }
    );
  });
});
app.delete('/quotations/:id', (req, res) => {
  // Cek apakah quotation exists
  db.get('SELECT * FROM quotations WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Quotation tidak ditemukan' });
    
    saveQuotationHistory(req.params.id);
    db.run('DELETE FROM quotations WHERE id=?', [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

// Endpoint untuk update total semua quotation yang ada
app.post('/update-all-totals', (req, res) => {
  db.all('SELECT id FROM quotations', (err, quotations) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let completed = 0;
    let updated = 0;
    
    if (quotations.length === 0) {
      return res.json({ message: 'Tidak ada quotation untuk diupdate', updated: 0 });
    }
    
    quotations.forEach(quotation => {
      calculateQuotationTotal(quotation.id, (total) => {
        db.run('UPDATE quotations SET total = ? WHERE id = ?', [total, quotation.id], (err2) => {
          if (!err2) updated++;
          
          completed++;
          if (completed === quotations.length) {
            res.json({ 
              message: `Berhasil update total ${updated} dari ${quotations.length} quotation`, 
              updated: updated,
              total: quotations.length
            });
          }
        });
      });
    });
  });
});

// Endpoint untuk fix quotation_id pada items yang null
app.post('/fix-quotation-items', (req, res) => {
  db.all('SELECT * FROM quotations ORDER BY id', (err, quotations) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all('SELECT * FROM items WHERE quotation_id IS NULL ORDER BY id', (err2, items) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      if (quotations.length === 0 || items.length === 0) {
        return res.json({ 
          message: 'Tidak ada quotation atau items untuk diupdate', 
          quotations: quotations.length,
          items: items.length
        });
      }
      
      let completed = 0;
      let updated = 0;
      
      // Assign items to quotations secara berurutan
      items.forEach((item, index) => {
        const quotationIndex = index % quotations.length;
        const quotationId = quotations[quotationIndex].id;
        
        db.run('UPDATE items SET quotation_id = ? WHERE id = ?', [quotationId, item.id], (err3) => {
          if (!err3) updated++;
          
          completed++;
          if (completed === items.length) {
            res.json({ 
              message: `Berhasil assign ${updated} items ke ${quotations.length} quotation`, 
              updated: updated,
              items: items.length,
              quotations: quotations.length
            });
          }
        });
      });
    });
  });
});

// Endpoint history
app.get('/history/quotations', (req, res) => {
  db.all('SELECT * FROM history_quotations', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get('/history/items', (req, res) => {
  db.all('SELECT * FROM history_items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// CRUD Invoices
app.get('/invoices', (req, res) => {
  db.all('SELECT * FROM invoices', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/invoices', (req, res) => {
  const { customer, date, status, title, invoice_number, discount, tax, total, due_date, payment_terms } = req.body;
  
  // Simple validation
  if (!customer || customer.trim() === '') {
    return res.status(400).json({ error: 'Customer harus diisi' });
  }
  
  if (!date || date.trim() === '') {
    return res.status(400).json({ error: 'Date harus diisi' });
  }
  
  if (!status || status.trim() === '') {
    return res.status(400).json({ error: 'Status harus diisi' });
  }
  
  db.run('INSERT INTO invoices (customer, date, status, title, invoice_number, discount, tax, total, due_date, payment_terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [customer, date, status, title || 'INVOICE BARANG/JASA', invoice_number, discount || 0, tax || 11, total || 0, due_date, payment_terms || 'Net 30'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({ 
        id: this.lastID, 
        customer, 
        date, 
        status,
        title: title || 'INVOICE BARANG/JASA',
        invoice_number,
        discount: discount || 0,
        tax: tax || 11,
        total: total || 0,
        due_date,
        payment_terms: payment_terms || 'Net 30'
      });
    }
  );
});

app.put('/invoices/:id', (req, res) => {
  const { customer, date, status, title, invoice_number, discount, tax, total, due_date, payment_terms } = req.body;
  
  // Validasi input
  if (!customer || customer.trim() === '') {
    return res.status(400).json({ error: 'Customer harus diisi' });
  }
  
  if (!date || date.trim() === '') {
    return res.status(400).json({ error: 'Date harus diisi' });
  }
  
  if (!status || status.trim() === '') {
    return res.status(400).json({ error: 'Status harus diisi' });
  }
  
  // Cek apakah invoice exists
  db.get('SELECT * FROM invoices WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
    
    // Update invoice
    db.run('UPDATE invoices SET customer=?, date=?, status=?, title=?, invoice_number=?, discount=?, tax=?, total=?, due_date=?, payment_terms=? WHERE id=?',
      [customer, date, status, title || 'INVOICE BARANG/JASA', invoice_number, discount || 0, tax || 11, total || 0, due_date, payment_terms || 'Net 30', req.params.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        
        res.json({ 
          id: req.params.id, 
          customer, 
          date, 
          status, 
          title: title || 'INVOICE BARANG/JASA', 
          invoice_number, 
          discount: discount || 0, 
          tax: tax || 11, 
          total: total || 0,
          due_date,
          payment_terms: payment_terms || 'Net 30'
        });
      }
    );
  });
});

app.delete('/invoices/:id', (req, res) => {
  // Cek apakah invoice exists
  db.get('SELECT * FROM invoices WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
    
    db.run('DELETE FROM invoices WHERE id=?', [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});
// Restore versi lama quotation
app.post('/history/restore/quotation/:id', (req, res) => {
  db.get('SELECT * FROM history_quotations WHERE id=?', [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: 'History not found' });
    const data = JSON.parse(row.data);
    db.run('UPDATE quotations SET customer=?, date=?, status=? WHERE id=?',
      [data.customer, data.date, data.status, data.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      }
    );
  });
});
// Restore versi lama item
app.post('/history/restore/item/:id', (req, res) => {
  db.get('SELECT * FROM history_items WHERE id=?', [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: 'History not found' });
    const data = JSON.parse(row.data);
    db.run('UPDATE items SET name=?, type=?, qty=?, unit=?, price=? WHERE id=?',
      [data.name, data.type, data.qty, data.unit, data.price, data.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      }
    );
  });
});


// Export PDF Quotation endpoint
app.get('/export/quotation/:id', (req, res) => {
  db.get('SELECT * FROM quotations WHERE id=?', [req.params.id], (err, quotation) => {
    if (err || !quotation) return res.status(404).json({ error: 'Quotation not found' });
    
    // Get customer details from customers table
    db.get('SELECT * FROM customers WHERE name=?', [quotation.customer], (err3, customer) => {
      if (err3) {
        console.error('Error fetching customer:', err3);
        return res.status(500).json({ error: err3.message });
      }
      
      // Get company settings
      db.get('SELECT * FROM settings LIMIT 1', (err4, settings) => {
        if (err4) {
          console.error('Error fetching settings:', err4);
          return res.status(500).json({ error: err4.message });
        }
        
        // Use default settings if not found
        const companySettings = settings || {
          company_name: 'QUOTATION APPS',
          company_address: 'Jl. Contoh No. 123',
          company_city: 'Jakarta, Indonesia 12345',
          company_phone: '+62 21 1234 5678',
          company_email: 'info@quotationapps.com'
        };
        
        db.all('SELECT * FROM items WHERE quotation_id=?', [req.params.id], (err2, items) => {
          if (err2) return res.status(500).json({ error: err2.message });
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=quotation_${quotation.id}.pdf`);
          
          const doc = new PDFDocument({ margin: 40 });
          doc.pipe(res);
        
          // Helper function untuk format currency
          const formatCurrency = (amount) => {
            return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
          };
          
          // Helper function untuk format number to words
          const numberToWords = (num) => {
            const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
            const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];
            const teens = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
            
            if (num === 0) return 'Nol';
            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' Ratus' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
            if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
            return numberToWords(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');
          };
          
          // Header dengan desain yang tepat - EDISI BIRU
          doc.fontSize(28)
             .fillColor('#1976D2')  // Warna biru untuk edisi biru
             .text('PENAWARAN', { align: 'center' })
             .moveDown(1.5);
        
        // Judul Penawaran (Kiri) - dengan spacing yang konsisten
        doc.fontSize(14)
           .fillColor('#333')
           .text(quotation.title || 'PENAWARAN BARANG/JASA', 40, 130);
        
        // Detail Penawaran (Kanan) - dengan alignment yang tepat
        doc.fontSize(9)
           .fillColor('#666')
           .text('Nomor:', 450, 130)
           .text('Tanggal:', 450, 150)
           .text('Status:', 450, 170)
           .fontSize(10)
           .fillColor('#333')
           .text(quotation.id.toString().padStart(3, '0'), 520, 130)
           .text(new Date(quotation.date).toLocaleDateString('id-ID', { 
             year: 'numeric', 
             month: 'long', 
             day: 'numeric' 
           }), 520, 150)
           .text(quotation.status, 520, 170);
        
        // Bagian Kepada (Info Klien) - dengan spacing yang lebih baik
        doc.rect(40, 210, 260, 80)
           .fillAndStroke('#E3F2FD', '#1976D2')  // Background biru muda, border biru
           .fillColor('#1976D2')  // Teks biru untuk judul
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('KEPADA', 50, 220)
           .fillColor('#333')
           .fontSize(10)
           .font('Helvetica')
           .text(quotation.customer, 50, 235)
           .fontSize(8)
           .fillColor('#666')
           .text(customer?.address || 'Alamat tidak tersedia', 50, 250)
           .text(customer?.city || 'Kota tidak tersedia', 50, 260)
           .text(customer?.phone ? `Telp: ${customer.phone}` : '', 50, 270)
           .text(customer?.email ? `Email: ${customer.email}` : '', 50, 280);
        
        // Bagian Dari (Info Perusahaan) - dengan spacing yang lebih baik
        doc.rect(320, 210, 260, 80)
           .fillAndStroke('#E3F2FD', '#1976D2')  // Background biru muda, border biru
           .fillColor('#1976D2')  // Teks biru untuk judul
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('DARI', 330, 220)
           .fillColor('#333')
           .fontSize(10)
           .font('Helvetica')
           .text(companySettings.company_name, 330, 235)
           .fontSize(8)
           .fillColor('#666')
           .text(companySettings.company_address, 330, 250)
           .text(companySettings.company_city, 330, 260)
           .text(`Telepon: ${companySettings.company_phone}`, 330, 270)
           .text(`Email: ${companySettings.company_email}`, 330, 280);
        
        // Header Tabel Barang - dengan spacing yang lebih baik
        doc.rect(40, 310, 540, 25)
           .fillAndStroke('#1976D2', '#1976D2')  // Background biru untuk edisi biru
           .fillColor('white')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('No', 50, 318)
           .text('Deskripsi', 80, 318)
           .text('Jumlah', 200, 318)
           .text('Satuan', 250, 318)
           .text('Harga', 320, 318)
           .text('Total', 420, 318);
        
        // Tabel Barang - dengan spacing yang lebih baik
        let yPosition = 335;
        let totalAmount = 0;
        
        items.forEach((item, index) => {
          const itemTotal = item.price * item.qty;
          totalAmount += itemTotal;
          
          // Background putih untuk semua baris dengan spacing yang lebih baik
          doc.rect(40, yPosition, 540, 20)
             .fillAndStroke('white', '#e0e0e0');
          
          doc.fillColor('#333')
             .fontSize(9)
             .font('Helvetica')
             .text((index + 1).toString(), 50, yPosition + 6)
             .text(item.name, 80, yPosition + 6, { width: 110 })
             .text(item.qty.toString(), 200, yPosition + 6)
             .text(item.unit || 'Lot', 250, yPosition + 6)
             .text(formatCurrency(item.price), 320, yPosition + 6)
             .text(formatCurrency(itemTotal), 420, yPosition + 6);
          
          yPosition += 20;
        });
        
        // Border bawah tabel
        doc.rect(40, yPosition, 540, 1)
           .fillAndStroke('#1976D2', '#1976D2');
        
        // Ringkasan Keuangan (Kiri) - dengan spacing yang lebih baik
        const totalsY = yPosition + 30;
        const summaryX = 40;
        
        const subtotal = totalAmount;
        const discountAmount = subtotal * (quotation.discount || 0) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (quotation.tax || 11) / 100;
        const grandTotal = afterDiscount + taxAmount;
        
        doc.fillColor('#666')
           .fontSize(10)
           .text('Sub Total:', summaryX, totalsY)
           .text(`Diskon (${quotation.discount || 0}%):`, summaryX, totalsY + 18)
           .text(`PPN (${quotation.tax || 11}%):`, summaryX, totalsY + 36)
           .fontSize(12)
           .fillColor('#1976D2')
           .text('TOTAL:', summaryX, totalsY + 54);
        
        doc.fillColor('#333')
           .fontSize(10)
           .text(formatCurrency(subtotal), summaryX + 80, totalsY)
           .text(formatCurrency(discountAmount), summaryX + 80, totalsY + 18)
           .text(formatCurrency(taxAmount), summaryX + 80, totalsY + 36)
           .fillColor('#1976D2')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(formatCurrency(grandTotal), summaryX + 80, totalsY + 54);
        
        // Jumlah dalam kata-kata
        doc.fontSize(8)
           .fillColor('#666')
           .text(`(${numberToWords(grandTotal)} Rupiah)`, summaryX, totalsY + 78, { width: 200 });
        
        // Syarat dan Ketentuan (Kanan) - dengan spacing yang lebih baik
        doc.fillColor('#1976D2')  // Warna biru untuk edisi biru
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('SYARAT DAN KETENTUAN', 300, totalsY)
           .fillColor('#333')
           .fontSize(9)
           .font('Helvetica')
           .text('1. Pembayaran: Net 30 hari dari tanggal penawaran', 300, totalsY + 18, { width: 250 })
           .text('2. Penawaran ini berlaku selama 30 hari', 300, totalsY + 32, { width: 250 })
           .text('3. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan', 300, totalsY + 46, { width: 250 })
           .text('4. Waktu pengiriman akan dikonfirmasi setelah order diterima', 300, totalsY + 60, { width: 250 });
        
        // Catatan Tambahan
        doc.fillColor('#1976D2')  // Warna biru untuk edisi biru
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('CATATAN TAMBAHAN', 300, totalsY + 85)
           .fillColor('#333')
           .fontSize(9)
           .font('Helvetica')
           .text('Terima kasih atas minat Anda terhadap produk/layanan kami.', 300, totalsY + 100, { width: 250 })
           .text('Silakan hubungi kami untuk pertanyaan atau klarifikasi.', 300, totalsY + 115, { width: 250 })
           .text(`Untuk pertanyaan, email kami di ${companySettings.company_email} atau telepon ${companySettings.company_phone}`, 300, totalsY + 130, { width: 250 });
        
        // Tanda Tangan
        doc.moveTo(40, totalsY + 160)
           .lineTo(200, totalsY + 160)
           .stroke()
           .fillColor('#666')
           .fontSize(9)
           .text('Tanda Tangan Berwenang', 40, totalsY + 170);
        
        doc.end();
        });
      });
    });
  });

// Export PDF Invoice endpoint - Format persis seperti quotation
app.get('/export/invoice/:id', (req, res) => {
  db.get('SELECT * FROM invoices WHERE id=?', [req.params.id], (err, invoice) => {
    if (err || !invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    // Get customer details from customers table
    db.get('SELECT * FROM customers WHERE name=?', [invoice.customer], (err3, customer) => {
      if (err3) {
        console.error('Error fetching customer:', err3);
        return res.status(500).json({ error: err3.message });
      }
      
      // Get company settings
      db.get('SELECT * FROM settings LIMIT 1', (err4, settings) => {
        if (err4) {
          console.error('Error fetching settings:', err4);
          return res.status(500).json({ error: err4.message });
        }
        
        // Use default settings if not found
        const companySettings = settings || {
          company_name: 'QUOTATION APPS',
          company_address: 'Jl. Contoh No. 123',
          company_city: 'Jakarta, Indonesia 12345',
          company_phone: '+62 21 1234 5678',
          company_email: 'info@quotationapps.com'
        };
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.id}.pdf`);
        
        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);
      
        // Helper function untuk format currency
        const formatCurrency = (amount) => {
          return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
        };
        
        // Helper function untuk format number to words
        const numberToWords = (num) => {
          const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
          const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];
          const teens = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
          
          if (num === 0) return 'Nol';
          if (num < 10) return ones[num];
          if (num < 20) return teens[num - 10];
          if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
          if (num < 1000) return ones[Math.floor(num / 100)] + ' Ratus' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
          if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
          return numberToWords(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');
        };
        
        // Header dengan desain yang tepat - EDISI BIRU
        doc.fontSize(28)
           .fillColor('#1976D2')  // Warna biru untuk edisi biru
           .text('INVOICE', { align: 'center' })
           .moveDown(1.5);
        
        // Judul Invoice (Kiri) - dengan spacing yang konsisten
        doc.fontSize(14)
           .fillColor('#333')
           .text(invoice.title || 'INVOICE BARANG/JASA', 40, 130);
        
        // Detail Invoice (Kanan) - dengan alignment yang tepat
        doc.fontSize(9)
           .fillColor('#666')
           .text('Nomor:', 450, 130)
           .text('Tanggal:', 450, 150)
           .text('Status:', 450, 170)
           .text('Jatuh Tempo:', 450, 190)
           .fontSize(10)
           .fillColor('#333')
           .text(invoice.invoice_number || `INV-${invoice.id.toString().padStart(3, '0')}`, 520, 130)
           .text(new Date(invoice.date).toLocaleDateString('id-ID', { 
             year: 'numeric', 
             month: 'long', 
             day: 'numeric' 
           }), 520, 150)
           .text(invoice.status, 520, 170)
           .text(invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID', { 
             year: 'numeric', 
             month: 'long', 
             day: 'numeric' 
           }) : '-', 520, 190);
        
        // Bagian Kepada (Info Klien) - dengan spacing yang lebih baik
        doc.rect(40, 210, 260, 80)
           .fillAndStroke('#E3F2FD', '#1976D2')  // Background biru muda, border biru
           .fillColor('#1976D2')  // Teks biru untuk judul
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('KEPADA', 50, 220)
           .fillColor('#333')
           .fontSize(10)
           .font('Helvetica')
           .text(invoice.customer, 50, 235)
           .fontSize(8)
           .fillColor('#666')
           .text(customer?.address || 'Alamat tidak tersedia', 50, 250)
           .text(customer?.city || 'Kota tidak tersedia', 50, 260)
           .text(customer?.phone ? `Telp: ${customer.phone}` : '', 50, 270)
           .text(customer?.email ? `Email: ${customer.email}` : '', 50, 280);
        
        // Bagian Dari (Info Perusahaan) - dengan spacing yang lebih baik
        doc.rect(320, 210, 260, 80)
           .fillAndStroke('#E3F2FD', '#1976D2')  // Background biru muda, border biru
           .fillColor('#1976D2')  // Teks biru untuk judul
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('DARI', 330, 220)
           .fillColor('#333')
           .fontSize(10)
           .font('Helvetica')
           .text(companySettings.company_name, 330, 235)
           .fontSize(8)
           .fillColor('#666')
           .text(companySettings.company_address, 330, 250)
           .text(companySettings.company_city, 330, 260)
           .text(`Telepon: ${companySettings.company_phone}`, 330, 270)
           .text(`Email: ${companySettings.company_email}`, 330, 280);
        
        // Header Tabel Barang - dengan spacing yang lebih baik
        doc.rect(40, 310, 540, 25)
           .fillAndStroke('#1976D2', '#1976D2')  // Background biru untuk edisi biru
           .fillColor('white')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('No', 50, 318)
           .text('Deskripsi', 80, 318)
           .text('Jumlah', 200, 318)
           .text('Satuan', 250, 318)
           .text('Harga', 320, 318)
           .text('Total', 420, 318);
        
        // Tabel Barang - dengan spacing yang lebih baik
        let yPosition = 335;
        let totalAmount = invoice.total || 0;
        
        // Untuk invoice, kita akan menampilkan satu baris dengan total
        doc.rect(40, yPosition, 540, 20)
           .fillAndStroke('white', '#e0e0e0');
        
        doc.fillColor('#333')
           .fontSize(9)
           .font('Helvetica')
           .text('1', 50, yPosition + 6)
           .text(invoice.title || 'INVOICE BARANG/JASA', 80, yPosition + 6, { width: 110 })
           .text('1', 200, yPosition + 6)
           .text('Lot', 250, yPosition + 6)
           .text(formatCurrency(totalAmount), 320, yPosition + 6)
           .text(formatCurrency(totalAmount), 420, yPosition + 6);
        
        yPosition += 20;
        
        // Border bawah tabel
        doc.rect(40, yPosition, 540, 1)
           .fillAndStroke('#1976D2', '#1976D2');
        
        // Ringkasan Keuangan (Kiri) - dengan spacing yang lebih baik
        const totalsY = yPosition + 30;
        const summaryX = 40;
        
        const subtotal = totalAmount;
        const discountAmount = subtotal * (invoice.discount || 0) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (invoice.tax || 11) / 100;
        const grandTotal = afterDiscount + taxAmount;
        
        doc.fillColor('#666')
           .fontSize(10)
           .text('Sub Total:', summaryX, totalsY)
           .text(`Diskon (${invoice.discount || 0}%):`, summaryX, totalsY + 18)
           .text(`PPN (${invoice.tax || 11}%):`, summaryX, totalsY + 36)
           .fontSize(12)
           .fillColor('#1976D2')
           .text('TOTAL:', summaryX, totalsY + 54);
        
        doc.fillColor('#333')
           .fontSize(10)
           .text(formatCurrency(subtotal), summaryX + 80, totalsY)
           .text(formatCurrency(discountAmount), summaryX + 80, totalsY + 18)
           .text(formatCurrency(taxAmount), summaryX + 80, totalsY + 36)
           .fillColor('#1976D2')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(formatCurrency(grandTotal), summaryX + 80, totalsY + 54);
        
        // Jumlah dalam kata-kata
        doc.fontSize(8)
           .fillColor('#666')
           .text(`(${numberToWords(grandTotal)} Rupiah)`, summaryX, totalsY + 78, { width: 200 });
        
        // Syarat dan Ketentuan (Kanan) - dengan spacing yang lebih baik
        doc.fillColor('#1976D2')  // Warna biru untuk edisi biru
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('SYARAT DAN KETENTUAN', 300, totalsY)
           .fillColor('#333')
           .fontSize(9)
           .font('Helvetica')
           .text(`1. Pembayaran: ${invoice.payment_terms || 'Net 30 hari'}`, 300, totalsY + 18, { width: 250 })
           .text('2. Invoice ini berlaku selama 30 hari', 300, totalsY + 32, { width: 250 })
           .text('3. Pembayaran dapat dilakukan melalui transfer bank', 300, totalsY + 46, { width: 250 })
           .text('4. Mohon segera lakukan pembayaran sesuai jatuh tempo', 300, totalsY + 60, { width: 250 });
        
        // Catatan Tambahan
        doc.fillColor('#1976D2')  // Warna biru untuk edisi biru
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('CATATAN TAMBAHAN', 300, totalsY + 85)
           .fillColor('#333')
           .fontSize(9)
           .font('Helvetica')
           .text('Terima kasih atas kepercayaan Anda menggunakan layanan kami.', 300, totalsY + 100, { width: 250 })
           .text('Silakan hubungi kami untuk pertanyaan atau klarifikasi.', 300, totalsY + 115, { width: 250 })
           .text(`Untuk pertanyaan, email kami di ${companySettings.company_email} atau telepon ${companySettings.company_phone}`, 300, totalsY + 130, { width: 250 });
        
        // Tanda Tangan
        doc.moveTo(40, totalsY + 160)
           .lineTo(200, totalsY + 160)
           .stroke()
           .fillColor('#666')
           .fontSize(9)
           .text('Tanda Tangan Berwenang', 40, totalsY + 170);
        
        doc.end();
      });
    });
  });
});
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error occurred:', error);
  
  // Don't leak sensitive information in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// ===== DATABASE MANAGEMENT ENDPOINTS =====
// Export all database data
app.get('/database/export', (req, res) => {
  try {
    const exportData = {
      customers: [],
      items: [],
      quotations: [],
      invoices: [],
      settings: {}
    };

    let completedQueries = 0;
    const totalQueries = 5;

    const checkComplete = () => {
      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json({
          success: true,
          data: exportData
        });
      }
    };

    // Get customers
    db.all('SELECT * FROM customers', [], (err, rows) => {
      if (err) {
        console.error('Error fetching customers for export:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      exportData.customers = rows;
      checkComplete();
    });

    // Get items (master items only, not quotation items)
    db.all('SELECT * FROM items WHERE quotation_id IS NULL OR quotation_id = 0', [], (err, rows) => {
      if (err) {
        console.error('Error fetching items for export:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      exportData.items = rows;
      checkComplete();
    });

    // Get quotations
    db.all('SELECT * FROM quotations', [], (err, rows) => {
      if (err) {
        console.error('Error fetching quotations for export:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      exportData.quotations = rows;
      checkComplete();
    });

    // Get invoices
    db.all('SELECT * FROM invoices', [], (err, rows) => {
      if (err) {
        console.error('Error fetching invoices for export:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      exportData.invoices = rows;
      checkComplete();
    });

    // Get settings
    db.get('SELECT * FROM settings LIMIT 1', [], (err, row) => {
      if (err) {
        console.error('Error fetching settings for export:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      exportData.settings = row || {};
      checkComplete();
    });

  } catch (error) {
    console.error('Error in database export:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import database data
app.post('/database/import', (req, res) => {
  const { customers, items, quotations, invoices, settings } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // Clear existing data
      db.run('DELETE FROM items WHERE quotation_id IN (SELECT id FROM quotations)');
      db.run('DELETE FROM quotations');
      db.run('DELETE FROM invoices');
      db.run('DELETE FROM items WHERE quotation_id IS NULL OR quotation_id = 0');
      db.run('DELETE FROM customers');
      db.run('DELETE FROM settings');

      // Import customers
      if (customers && customers.length > 0) {
        const stmt = db.prepare('INSERT INTO customers (name, address, phone, email, city) VALUES (?, ?, ?, ?, ?)');
        customers.forEach(customer => {
          // Gabungkan address dan city jika ada
          const fullAddress = customer.address || '';
          const city = customer.city || '';
          const combinedAddress = city ? `${fullAddress}, ${city}` : fullAddress;
          
          stmt.run([customer.name, combinedAddress, customer.phone, customer.email, city]);
        });
        stmt.finalize();
      }

      // Import master items
      if (items && items.length > 0) {
        const stmt = db.prepare('INSERT INTO items (name, type, unit, price, stock) VALUES (?, ?, ?, ?, ?)');
        items.forEach(item => {
          stmt.run([item.name, item.type, item.unit, item.price, item.stock || 0]);
        });
        stmt.finalize();
      }

      // Import quotations
      if (quotations && quotations.length > 0) {
        const stmt = db.prepare('INSERT INTO quotations (customer, date, status, title, quotation_number, discount, tax, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        quotations.forEach(quotation => {
          stmt.run([
            quotation.customer,
            quotation.date,
            quotation.status,
            quotation.title,
            quotation.quotation_number,
            quotation.discount || 0,
            quotation.tax || 11,
            quotation.total || 0
          ]);
        });
        stmt.finalize();
      }

      // Import invoices
      if (invoices && invoices.length > 0) {
        const stmt = db.prepare('INSERT INTO invoices (customer, date, status, title, invoice_number, discount, tax, total, due_date, payment_terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        invoices.forEach(invoice => {
          stmt.run([
            invoice.customer,
            invoice.date,
            invoice.status,
            invoice.title,
            invoice.invoice_number,
            invoice.discount || 0,
            invoice.tax || 11,
            invoice.total || 0,
            invoice.due_date,
            invoice.payment_terms || 'Net 30'
          ]);
        });
        stmt.finalize();
      }

      // Import settings
      if (settings) {
        const stmt = db.prepare(`INSERT INTO settings 
          (company_name, company_address, company_city, company_phone, company_email, company_website, company_logo) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`);
        stmt.run([
          settings.company_name || 'QUOTATION APPS',
          settings.company_address || 'Jl. Contoh No. 123',
          settings.company_city || 'Jakarta, Indonesia 12345',
          settings.company_phone || '+62 21 1234 5678',
          settings.company_email || 'info@quotationapps.com',
          settings.company_website || '',
          settings.company_logo || ''
        ]);
        stmt.finalize();
      }

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing import transaction:', err);
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Database imported successfully' });
      });

    } catch (error) {
      db.run('ROLLBACK');
      console.error('Error importing database:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// Reset database
app.post('/database/reset', (req, res) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // Clear all data
      db.run('DELETE FROM items');
      db.run('DELETE FROM quotations');
      db.run('DELETE FROM invoices');
      db.run('DELETE FROM customers');
      db.run('DELETE FROM settings');

      // Reset autoincrement
      db.run('DELETE FROM sqlite_sequence WHERE name IN ("customers", "items", "quotations")');

      // Insert default settings
      db.run(`INSERT INTO settings 
        (company_name, company_address, company_city, company_phone, company_email, company_website, company_logo) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        'QUOTATION APPS',
        'Jl. Contoh No. 123',
        'Jakarta, Indonesia 12345',
        '+62 21 1234 5678',
        'info@quotationapps.com',
        '',
        ''
      ]);

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing reset transaction:', err);
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Database reset successfully' });
      });

    } catch (error) {
      db.run('ROLLBACK');
      console.error('Error resetting database:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// 404 handler - harus di paling akhir
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});