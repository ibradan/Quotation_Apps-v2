const express = require('express');
const path = require('path');
const fs = require('fs');

// Import utilities
const dbManager = require('./utils/database');
const logger = require('./utils/logger');
const cache = require('./utils/cache');
const securityMiddleware = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// Performance monitoring
const startTime = Date.now();

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(securityMiddleware.helmetConfig);
app.use(securityMiddleware.corsConfig);
app.use(securityMiddleware.requestLogger);

// Rate limiting
app.use('/api/', securityMiddleware.apiLimiter);
app.use('/api/auth', securityMiddleware.loginLimiter);
app.use('/api/upload', securityMiddleware.uploadLimiter);

// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
    logger.logPerformance(`${req.method} ${req.originalUrl}`, duration);
  });
  next();
});

// Initialize database
async function initializeDatabase() {
  try {
    const dbPath = process.env.DB_PATH || './quotation.db';
    await dbManager.connect(dbPath);
    logger.info('Database initialized successfully');
    
    // Optimize database
    await dbManager.optimize();
    logger.info('Database optimized');
    
    // Get database stats
    const stats = await dbManager.getStats();
    logger.info('Database statistics', stats);
  } catch (error) {
    logger.error('Database initialization failed', error);
    process.exit(1);
  }
}

// Health check endpoint with detailed information
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await dbManager.healthCheck();
    const cacheStats = cache.getStats();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth,
      cache: cacheStats,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes with simple caching
app.get('/api/quotations', async (req, res) => {
  try {
    const cacheKey = 'quotations';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const start = Date.now();
    const quotations = await dbManager.all('SELECT * FROM quotations ORDER BY created_at DESC');
    const duration = Date.now() - start;
    
    logger.logDatabase('SELECT', 'quotations', duration, true);
    
    // Cache for 5 minutes
    cache.set(cacheKey, quotations, 300000);
    res.json(quotations);
  } catch (error) {
    logger.error('Failed to fetch quotations', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const { customer, date, status, title, quotation_number, discount, tax, total, items } = req.body;
    
    const start = Date.now();
    
    // Use transaction for data consistency
    await dbManager.transaction([
      {
        sql: `INSERT INTO quotations (customer, date, status, title, quotation_number, discount, tax, total) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [customer, date, status, title, quotation_number, discount, tax, total]
      }
    ]);
    
    const quotationId = await dbManager.get('SELECT last_insert_rowid() as id');
    
    // Insert items
    if (items && items.length > 0) {
      const itemQueries = items.map(item => ({
        sql: `INSERT INTO items (quotation_id, name, type, qty, price, unit, stock) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [quotationId.id, item.name, item.type, item.qty, item.price, item.unit, item.stock || 0]
      }));
      
      await dbManager.transaction(itemQueries);
    }
    
    const duration = Date.now() - start;
    logger.logDatabase('INSERT', 'quotations', duration, true);
    
    // Clear cache
    cache.delete('quotations');
    
    res.status(201).json({ 
      message: 'Quotation created successfully',
      id: quotationId.id 
    });
  } catch (error) {
    logger.error('Failed to create quotation', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
});

app.get('/api/quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `quotation_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const start = Date.now();
    
    const quotation = await dbManager.get('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    const items = await dbManager.all('SELECT * FROM items WHERE quotation_id = ?', [id]);
    const duration = Date.now() - start;
    
    logger.logDatabase('SELECT', 'quotations', duration, true);
    
    const result = { ...quotation, items };
    cache.set(cacheKey, result, 300000);
    res.json(result);
  } catch (error) {
    logger.error('Failed to fetch quotation', error);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
});

app.put('/api/quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, date, status, title, quotation_number, discount, tax, total, items } = req.body;
    
    const start = Date.now();
    
    await dbManager.transaction([
      {
        sql: `UPDATE quotations SET customer = ?, date = ?, status = ?, title = ?, 
              quotation_number = ?, discount = ?, tax = ?, total = ?, updated_at = CURRENT_TIMESTAMP 
              WHERE id = ?`,
        params: [customer, date, status, title, quotation_number, discount, tax, total, id]
      }
    ]);
    
    // Update items
    if (items && items.length > 0) {
      // Delete existing items
      await dbManager.run('DELETE FROM items WHERE quotation_id = ?', [id]);
      
      // Insert new items
      const itemQueries = items.map(item => ({
        sql: `INSERT INTO items (quotation_id, name, type, qty, price, unit, stock) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [id, item.name, item.type, item.qty, item.price, item.unit, item.stock || 0]
      }));
      
      await dbManager.transaction(itemQueries);
    }
    
    const duration = Date.now() - start;
    logger.logDatabase('UPDATE', 'quotations', duration, true);
    
    // Clear cache
    cache.delete('quotations');
    cache.delete(`quotation_${id}`);
    
    res.json({ message: 'Quotation updated successfully' });
  } catch (error) {
    logger.error('Failed to update quotation', error);
    res.status(500).json({ error: 'Failed to update quotation' });
  }
});

app.delete('/api/quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const start = Date.now();
    
    await dbManager.transaction([
      { sql: 'DELETE FROM items WHERE quotation_id = ?', params: [id] },
      { sql: 'DELETE FROM quotations WHERE id = ?', params: [id] }
    ]);
    
    const duration = Date.now() - start;
    logger.logDatabase('DELETE', 'quotations', duration, true);
    
    // Clear cache
    cache.delete('quotations');
    cache.delete(`quotation_${id}`);
    
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete quotation', error);
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
});

// Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const cacheKey = 'customers';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const start = Date.now();
    const customers = await dbManager.all('SELECT * FROM customers ORDER BY name');
    const duration = Date.now() - start;
    
    logger.logDatabase('SELECT', 'customers', duration, true);
    
    cache.set(cacheKey, customers, 300000);
    res.json(customers);
  } catch (error) {
    logger.error('Failed to fetch customers', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, address, city } = req.body;
    const start = Date.now();
    
    const result = await dbManager.run(
      'INSERT INTO customers (name, email, phone, address, city) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address, city]
    );
    
    const duration = Date.now() - start;
    logger.logDatabase('INSERT', 'customers', duration, true);
    
    // Clear cache
    cache.delete('customers');
    
    res.status(201).json({ 
      message: 'Customer created successfully',
      id: result.id 
    });
  } catch (error) {
    logger.error('Failed to create customer', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Items API
app.get('/api/items', async (req, res) => {
  try {
    const cacheKey = 'items';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const start = Date.now();
    const items = await dbManager.all('SELECT * FROM items ORDER BY name');
    const duration = Date.now() - start;
    
    logger.logDatabase('SELECT', 'items', duration, true);
    
    cache.set(cacheKey, items, 300000);
    res.json(items);
  } catch (error) {
    logger.error('Failed to fetch items', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const cacheKey = 'settings';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const start = Date.now();
    const settings = await dbManager.get('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
    const duration = Date.now() - start;
    
    logger.logDatabase('SELECT', 'settings', duration, true);
    
    cache.set(cacheKey, settings, 600000);
    res.json(settings);
  } catch (error) {
    logger.error('Failed to fetch settings', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { company_name, company_address, company_city, company_phone, company_email, company_website, company_logo } = req.body;
    const start = Date.now();
    
    await dbManager.run(
      `UPDATE settings SET company_name = ?, company_address = ?, company_city = ?, 
       company_phone = ?, company_email = ?, company_website = ?, company_logo = ?, 
       updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT MAX(id) FROM settings)`,
      [company_name, company_address, company_city, company_phone, company_email, company_website, company_logo]
    );
    
    const duration = Date.now() - start;
    logger.logDatabase('UPDATE', 'settings', duration, true);
    
    // Clear cache
    cache.delete('settings');
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    logger.error('Failed to update settings', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Statistics API
app.get('/api/stats', async (req, res) => {
  try {
    const start = Date.now();
    
    const stats = await dbManager.getStats();
    const cacheStats = cache.getStats();
    const logStats = logger.getLogStats();
    
    const duration = Date.now() - start;
    
    res.json({
      database: stats,
      cache: cacheStats,
      logs: logStats,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      responseTime: `${duration}ms`
    });
  } catch (error) {
    logger.error('Failed to fetch statistics', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Error handling middleware
app.use(securityMiddleware.errorHandler);

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await dbManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await dbManager.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      const startupTime = Date.now() - startTime;
      logger.info(`Server started successfully`, {
        port: PORT,
        startupTime: `${startupTime}ms`,
        environment: process.env.NODE_ENV || 'development'
      });
      
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Statistics: http://localhost:${PORT}/api/stats`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();