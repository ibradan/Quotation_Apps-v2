const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.connectionPool = [];
    this.maxConnections = 10;
  }

  // Initialize database connection
  async connect(dbPath = './quotation.db') {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          this.isConnected = false;
          reject(err);
        } else {
          console.log('Database connected successfully');
          this.isConnected = true;
          this.setupDatabase();
          resolve(this.db);
        }
      });
    });
  }

  // Setup database tables and indexes
  async setupDatabase() {
    const queries = [
      // Create tables
      `CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer TEXT,
        date TEXT,
        status TEXT,
        title TEXT DEFAULT 'PENAWARAN BARANG/JASA',
        quotation_number TEXT,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 11,
        total REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quotation_id INTEGER,
        name TEXT,
        type TEXT,
        qty INTEGER,
        price REAL,
        unit TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quotation_id) REFERENCES quotations(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT DEFAULT 'QUOTATION APPS',
        company_address TEXT DEFAULT 'Jl. Contoh No. 123',
        company_city TEXT DEFAULT 'Jakarta, Indonesia 12345',
        company_phone TEXT DEFAULT '+62 21 1234 5678',
        company_email TEXT DEFAULT 'info@quotationapps.com',
        company_website TEXT DEFAULT '',
        company_logo TEXT DEFAULT '',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS invoices (
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
        payment_terms TEXT DEFAULT 'Net 30',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer)`,
      `CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(date)`,
      `CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status)`,
      `CREATE INDEX IF NOT EXISTS idx_items_quotation_id ON items(quotation_id)`,
      `CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)`,
      `CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer)`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date)`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`
    ];

    for (const query of queries) {
      await this.run(query);
    }

    // Insert default settings if not exists
    await this.insertDefaultSettings();
  }

  // Insert default settings
  async insertDefaultSettings() {
    const count = await this.get('SELECT COUNT(*) as count FROM settings');
    if (count.count === 0) {
      await this.run(`INSERT INTO settings 
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
    }
  }

  // Execute a query with parameters
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database run error:', err);
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  // Get a single row
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get multiple rows
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Execute multiple queries in a transaction
  async transaction(queries) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        let completed = 0;
        const total = queries.length;
        
        queries.forEach(({ sql, params = [] }) => {
          this.db.run(sql, params, function(err) {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            completed++;
            if (completed === total) {
              this.db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          });
        });
      });
    });
  }

  // Backup database
  async backup(backupPath) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.backup(backupPath, (err) => {
        if (err) {
          console.error('Backup error:', err);
          reject(err);
        } else {
          console.log('Database backed up successfully');
          resolve();
        }
      });
    });
  }

  // Optimize database
  async optimize() {
    const queries = [
      'VACUUM',
      'ANALYZE',
      'REINDEX'
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  // Get database statistics
  async getStats() {
    const stats = {};
    
    // Get table counts
    const tables = ['quotations', 'items', 'customers', 'invoices'];
    for (const table of tables) {
      const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = result.count;
    }
    
    // Get database size
    const dbInfo = await this.get("PRAGMA page_count");
    const pageSize = await this.get("PRAGMA page_size");
    stats.databaseSize = (dbInfo.page_count * pageSize.page_size) / 1024 / 1024; // MB
    
    return stats;
  }

  // Close database connection
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            console.log('Database connection closed');
            this.isConnected = false;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Health check
  async healthCheck() {
    try {
      await this.get('SELECT 1 as health');
      return { status: 'healthy', connected: this.isConnected };
    } catch (error) {
      return { status: 'unhealthy', connected: this.isConnected, error: error.message };
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;
