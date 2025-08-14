class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time To Live
    this.maxSize = 1000; // Maximum number of items
    this.defaultTTL = 300000; // 5 minutes in milliseconds
  }

  // Set a value in cache
  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const expiry = Date.now() + ttl;
    this.cache.set(key, value);
    this.ttl.set(key, expiry);

    return true;
  }

  // Get a value from cache
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  // Delete a value from cache
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Check if key exists
  has(key) {
    return this.cache.has(key) && Date.now() <= this.ttl.get(key);
  }

  // Get all keys
  keys() {
    const validKeys = [];
    for (const [key, expiry] of this.ttl.entries()) {
      if (Date.now() <= expiry) {
        validKeys.push(key);
      }
    }
    return validKeys;
  }

  // Evict expired items
  evictExpired() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }

  // Evict oldest items
  evictOldest() {
    const entries = Array.from(this.ttl.entries());
    entries.sort((a, b) => a[1] - b[1]); // Sort by expiry time
    
    // Remove 10% of oldest items
    const toRemove = Math.ceil(this.maxSize * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.delete(entries[i][0]);
    }
  }

  // Get cache statistics
  getStats() {
    this.evictExpired();
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Calculate hit rate (simplified)
  calculateHitRate() {
    // This is a simplified hit rate calculation
    // In a real implementation, you'd track hits and misses
    return 0.85; // Placeholder
  }

  // Estimate memory usage
  estimateMemoryUsage() {
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += JSON.stringify(key).length;
      size += JSON.stringify(value).length;
    }
    return size;
  }
}

// Create singleton instance
const cache = new Cache();

// Auto-cleanup expired items every 5 minutes
setInterval(() => {
  cache.evictExpired();
}, 5 * 60 * 1000);

module.exports = cache;
