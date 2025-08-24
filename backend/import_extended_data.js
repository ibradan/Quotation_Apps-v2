const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Buka koneksi database
const db = new sqlite3.Database('./quotation.db');

async function importData() {
  try {
    console.log('🗃️  Memulai import data dummy extended...');
    
    // Baca file SQL
    const sqlContent = fs.readFileSync('./seed_data_extended.sql', 'utf8');
    
    // Split berdasarkan statement (;)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Jalankan setiap statement
    let executedCount = 0;
    for (const statement of statements) {
      if (statement.toUpperCase().includes('INSERT') || 
          statement.toUpperCase().includes('DELETE') || 
          statement.toUpperCase().includes('UPDATE') ||
          statement.toUpperCase().includes('VACUUM')) {
        try {
          await new Promise((resolve, reject) => {
            db.run(statement, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          executedCount++;
          console.log(`✅ Statement ${executedCount} berhasil dieksekusi`);
        } catch (error) {
          console.log(`⚠️  Statement diabaikan: ${error.message.substring(0, 50)}...`);
        }
      }
    }
    
    // Cek hasil
    const quotationCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM quotations', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const customerCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM customers', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const itemCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM items WHERE quotation_id IS NULL', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('\n📊 Hasil Import Data:');
    console.log(`📋 Total Quotations: ${quotationCount.count}`);
    console.log(`👥 Total Customers: ${customerCount.count}`);
    console.log(`📦 Total Master Items: ${itemCount.count}`);
    
    // Tampilkan beberapa data sample
    console.log('\n📅 Sample Quotations per tanggal:');
    const sampleData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT date, COUNT(*) as count 
        FROM quotations 
        GROUP BY date 
        ORDER BY date DESC 
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    sampleData.forEach(row => {
      console.log(`  ${row.date}: ${row.count} quotation(s)`);
    });
    
    console.log('\n🎉 Import data dummy berhasil!');
    
  } catch (error) {
    console.error('❌ Error saat import data:', error.message);
  } finally {
    db.close();
  }
}

importData();
