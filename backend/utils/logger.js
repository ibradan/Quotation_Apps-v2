const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content + '\n');
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.currentLevel];
  }

  error(message, data = null) {
    if (!this.shouldLog('ERROR')) return;
    
    const logEntry = this.formatMessage('ERROR', message, data);
    console.error(`[ERROR] ${message}`, data || '');
    this.writeToFile('error.log', logEntry);
  }

  warn(message, data = null) {
    if (!this.shouldLog('WARN')) return;
    
    const logEntry = this.formatMessage('WARN', message, data);
    console.warn(`[WARN] ${message}`, data || '');
    this.writeToFile('warn.log', logEntry);
  }

  info(message, data = null) {
    if (!this.shouldLog('INFO')) return;
    
    const logEntry = this.formatMessage('INFO', message, data);
    console.info(`[INFO] ${message}`, data || '');
    this.writeToFile('info.log', logEntry);
  }

  debug(message, data = null) {
    if (!this.shouldLog('DEBUG')) return;
    
    const logEntry = this.formatMessage('DEBUG', message, data);
    console.debug(`[DEBUG] ${message}`, data || '');
    this.writeToFile('debug.log', logEntry);
  }

  // Request logging
  logRequest(req, res, duration) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: this.getTimestamp()
    };

    if (res.statusCode >= 400) {
      this.error(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    } else if (res.statusCode >= 300) {
      this.warn(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    } else {
      this.info(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    }
  }

  // Database logging
  logDatabase(operation, table, duration, success = true) {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      timestamp: this.getTimestamp()
    };

    if (success) {
      this.debug(`DB ${operation} on ${table}`, logData);
    } else {
      this.error(`DB ${operation} on ${table} failed`, logData);
    }
  }

  // Performance logging
  logPerformance(operation, duration, data = null) {
    const logData = {
      operation,
      duration: `${duration}ms`,
      timestamp: this.getTimestamp(),
      ...(data && { data })
    };

    if (duration > 1000) {
      this.warn(`Slow operation: ${operation}`, logData);
    } else {
      this.debug(`Performance: ${operation}`, logData);
    }
  }

  // Security logging
  logSecurity(event, details = null) {
    const logData = {
      event,
      timestamp: this.getTimestamp(),
      ...(details && { details })
    };

    this.warn(`Security event: ${event}`, logData);
    this.writeToFile('security.log', this.formatMessage('WARN', `Security: ${event}`, logData));
  }

  // Get log statistics
  getLogStats() {
    const stats = {};
    const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log', 'security.log'];
    
    logFiles.forEach(filename => {
      const filePath = path.join(this.logDir, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        stats[filename.replace('.log', '')] = lines.length;
      } else {
        stats[filename.replace('.log', '')] = 0;
      }
    });

    return stats;
  }

  // Clean old logs
  cleanOldLogs(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const logFiles = fs.readdirSync(this.logDir);
    logFiles.forEach(filename => {
      const filePath = path.join(this.logDir, filename);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        this.info(`Deleted old log file: ${filename}`);
      }
    });
  }

  // Export logs for analysis
  exportLogs(startDate, endDate, level = 'INFO') {
    const logs = [];
    const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log', 'security.log'];
    
    logFiles.forEach(filename => {
      const filePath = path.join(this.logDir, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            const logDate = new Date(logEntry.timestamp);
            
            if (logDate >= startDate && logDate <= endDate && 
                this.logLevels[logEntry.level] <= this.logLevels[level]) {
              logs.push(logEntry);
            }
          } catch (error) {
            // Skip invalid JSON lines
          }
        });
      }
    });

    return logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
