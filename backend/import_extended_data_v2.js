const sqlite3 = require('sqlite3').verbose();

// Buka koneksi database
const db = new sqlite3.Database('./quotation.db');

async function importData() {
  try {
    console.log('🗃️  Memulai import data dummy extended...');
    
    // Hapus data lama
    await runQuery('DELETE FROM quotations');
    console.log('✅ Data quotations lama dihapus');
    
    // Data quotation dengan distribusi yang lebih menarik
    const quotations = [
      // Juli 2025 - Minggu pertama
      ['PT. Teknologi Maju', '2025-07-01', 'approved', 'PENAWARAN INFRASTRUKTUR JARINGAN', 'QUO-2025-001', 5.0, 11.0, 45650000],
      ['CV. Inovasi Digital', '2025-07-01', 'sent', 'PENAWARAN SOFTWARE LICENSE', 'QUO-2025-002', 10.0, 11.0, 18500000],
      
      ['PT. Solusi Kreatif', '2025-07-02', 'approved', 'PENAWARAN WEBSITE DEVELOPMENT', 'QUO-2025-003', 0.0, 11.0, 44400000],
      ['UD. Berkah Jaya', '2025-07-02', 'draft', 'PENAWARAN MAINTENANCE BULANAN', 'QUO-2025-004', 7.5, 11.0, 16650000],
      ['PT. Global Sistem', '2025-07-02', 'sent', 'PENAWARAN TRAINING IT', 'QUO-2025-005', 5.0, 11.0, 12300000],
      
      ['CV. Tech Solutions', '2025-07-03', 'approved', 'PENAWARAN HARDWARE KOMPUTER', 'QUO-2025-006', 8.0, 11.0, 35750000],
      
      ['PT. Nusantara Digital', '2025-07-05', 'sent', 'PENAWARAN CLOUD MIGRATION', 'QUO-2025-007', 5.0, 11.0, 22200000],
      ['UD. Mandiri Abadi', '2025-07-05', 'approved', 'PENAWARAN APLIKASI MOBILE', 'QUO-2025-008', 12.0, 11.0, 28900000],
      
      ['PT. Teknologi Maju', '2025-07-08', 'sent', 'PENAWARAN SECURITY SYSTEM', 'QUO-2025-009', 3.0, 11.0, 18750000],
      ['CV. Inovasi Digital', '2025-07-08', 'draft', 'PENAWARAN DATA RECOVERY', 'QUO-2025-010', 0.0, 11.0, 8850000],
      ['PT. Solusi Kreatif', '2025-07-08', 'approved', 'PENAWARAN KONSULTASI IT', 'QUO-2025-011', 15.0, 11.0, 14200000],
      
      // Juli 2025 - Minggu kedua  
      ['UD. Berkah Jaya', '2025-07-10', 'sent', 'PENAWARAN UPGRADE NETWORK', 'QUO-2025-012', 5.0, 11.0, 32400000],
      ['PT. Global Sistem', '2025-07-10', 'approved', 'PENAWARAN SOFTWARE AKUNTANSI', 'QUO-2025-013', 10.0, 11.0, 25600000],
      
      ['CV. Tech Solutions', '2025-07-12', 'draft', 'PENAWARAN MONITORING SYSTEM', 'QUO-2025-014', 0.0, 11.0, 19800000],
      ['PT. Nusantara Digital', '2025-07-12', 'sent', 'PENAWARAN E-COMMERCE PLATFORM', 'QUO-2025-015', 8.0, 11.0, 67500000],
      ['UD. Mandiri Abadi', '2025-07-12', 'approved', 'PENAWARAN BACKUP SOLUTION', 'QUO-2025-016', 5.0, 11.0, 15750000],
      
      ['PT. Teknologi Maju', '2025-07-15', 'sent', 'PENAWARAN FIREWALL ENTERPRISE', 'QUO-2025-017', 7.0, 11.0, 41200000],
      ['CV. Inovasi Digital', '2025-07-15', 'approved', 'PENAWARAN OFFICE AUTOMATION', 'QUO-2025-018', 12.0, 11.0, 28900000],
      
      ['PT. Solusi Kreatif', '2025-07-18', 'draft', 'PENAWARAN CRM SYSTEM', 'QUO-2025-019', 0.0, 11.0, 52100000],
      ['UD. Berkah Jaya', '2025-07-18', 'sent', 'PENAWARAN VIDEO CONFERENCE', 'QUO-2025-020', 8.0, 11.0, 22400000],
      ['PT. Global Sistem', '2025-07-18', 'approved', 'PENAWARAN SERVER UPGRADE', 'QUO-2025-021', 5.0, 11.0, 38750000],
      
      // Juli 2025 - Minggu ketiga
      ['CV. Tech Solutions', '2025-07-20', 'sent', 'PENAWARAN DIGITAL MARKETING', 'QUO-2025-022', 10.0, 11.0, 24300000],
      ['PT. Nusantara Digital', '2025-07-20', 'approved', 'PENAWARAN POS SYSTEM', 'QUO-2025-023', 6.0, 11.0, 18650000],
      
      ['UD. Mandiri Abadi', '2025-07-22', 'draft', 'PENAWARAN INVENTORY SYSTEM', 'QUO-2025-024', 0.0, 11.0, 31200000],
      ['PT. Teknologi Maju', '2025-07-22', 'sent', 'PENAWARAN WIFI INFRASTRUKTUR', 'QUO-2025-025', 8.0, 11.0, 27800000],
      ['CV. Inovasi Digital', '2025-07-22', 'approved', 'PENAWARAN HELPDESK SYSTEM', 'QUO-2025-026', 12.0, 11.0, 21400000],
      
      ['PT. Solusi Kreatif', '2025-07-25', 'sent', 'PENAWARAN API DEVELOPMENT', 'QUO-2025-027', 5.0, 11.0, 33750000],
      ['UD. Berkah Jaya', '2025-07-25', 'approved', 'PENAWARAN PRINTER NETWORK', 'QUO-2025-028', 7.0, 11.0, 16850000],
      ['PT. Global Sistem', '2025-07-25', 'draft', 'PENAWARAN VPN SOLUTION', 'QUO-2025-029', 0.0, 11.0, 14900000],
      
      // Juli 2025 - Minggu keempat
      ['CV. Tech Solutions', '2025-07-28', 'approved', 'PENAWARAN DATABASE MIGRATION', 'QUO-2025-030', 8.0, 11.0, 42300000],
      ['PT. Nusantara Digital', '2025-07-28', 'sent', 'PENAWARAN IOT SOLUTION', 'QUO-2025-031', 5.0, 11.0, 29600000],
      
      ['UD. Mandiri Abadi', '2025-07-30', 'draft', 'PENAWARAN SMART OFFICE', 'QUO-2025-032', 0.0, 11.0, 48200000],
      ['PT. Teknologi Maju', '2025-07-30', 'approved', 'PENAWARAN CCTV SYSTEM', 'QUO-2025-033', 10.0, 11.0, 35400000],
      
      // Agustus 2025 - Minggu pertama  
      ['CV. Inovasi Digital', '2025-08-01', 'sent', 'PENAWARAN CLOUD STORAGE', 'QUO-2025-034', 6.0, 11.0, 19800000],
      ['PT. Solusi Kreatif', '2025-08-01', 'approved', 'PENAWARAN UI/UX DESIGN', 'QUO-2025-035', 8.0, 11.0, 22400000],
      ['UD. Berkah Jaya', '2025-08-01', 'draft', 'PENAWARAN SOCIAL MEDIA TOOLS', 'QUO-2025-036', 0.0, 11.0, 12600000],
      
      ['PT. Global Sistem', '2025-08-03', 'approved', 'PENAWARAN ERP IMPLEMENTATION', 'QUO-2025-037', 12.0, 11.0, 89700000],
      ['CV. Tech Solutions', '2025-08-03', 'sent', 'PENAWARAN DIGITAL TRANSFORMATION', 'QUO-2025-038', 7.0, 11.0, 65400000],
      
      ['PT. Nusantara Digital', '2025-08-05', 'draft', 'PENAWARAN BLOCKCHAIN SOLUTION', 'QUO-2025-039', 0.0, 11.0, 78900000],
      ['UD. Mandiri Abadi', '2025-08-05', 'approved', 'PENAWARAN AI CHATBOT', 'QUO-2025-040', 9.0, 11.0, 34200000],
      ['PT. Teknologi Maju', '2025-08-05', 'sent', 'PENAWARAN MACHINE LEARNING', 'QUO-2025-041', 5.0, 11.0, 56700000],
      
      // Agustus 2025 - Minggu kedua
      ['CV. Inovasi Digital', '2025-08-08', 'approved', 'PENAWARAN AUTOMATION TOOLS', 'QUO-2025-042', 8.0, 11.0, 41800000],
      ['PT. Solusi Kreatif', '2025-08-08', 'draft', 'PENAWARAN MICROSERVICES', 'QUO-2025-043', 0.0, 11.0, 52300000],
      ['UD. Berkah Jaya', '2025-08-08', 'sent', 'PENAWARAN DEVOPS TOOLS', 'QUO-2025-044', 6.0, 11.0, 28700000],
      
      ['PT. Global Sistem', '2025-08-10', 'approved', 'PENAWARAN KUBERNETES SETUP', 'QUO-2025-045', 10.0, 11.0, 39600000],
      ['CV. Tech Solutions', '2025-08-10', 'sent', 'PENAWARAN MONITORING DASHBOARD', 'QUO-2025-046', 7.0, 11.0, 23400000],
      
      ['PT. Nusantara Digital', '2025-08-12', 'draft', 'PENAWARAN PERFORMANCE OPTIMIZATION', 'QUO-2025-047', 0.0, 11.0, 31800000],
      ['UD. Mandiri Abadi', '2025-08-12', 'approved', 'PENAWARAN SECURITY AUDIT', 'QUO-2025-048', 8.0, 11.0, 26900000],
      ['PT. Teknologi Maju', '2025-08-12', 'sent', 'PENAWARAN DISASTER RECOVERY', 'QUO-2025-049', 5.0, 11.0, 44300000],
      
      // Agustus 2025 - Minggu ketiga
      ['CV. Inovasi Digital', '2025-08-15', 'approved', 'PENAWARAN LOAD BALANCER', 'QUO-2025-050', 9.0, 11.0, 33700000],
      ['PT. Solusi Kreatif', '2025-08-15', 'draft', 'PENAWARAN CDN SOLUTION', 'QUO-2025-051', 0.0, 11.0, 18900000],
      
      ['UD. Berkah Jaya', '2025-08-18', 'sent', 'PENAWARAN EMAIL SERVER', 'QUO-2025-052', 7.0, 11.0, 21800000],
      ['PT. Global Sistem', '2025-08-18', 'approved', 'PENAWARAN FILE SERVER', 'QUO-2025-053', 6.0, 11.0, 25600000],
      ['CV. Tech Solutions', '2025-08-18', 'draft', 'PENAWARAN WEB HOSTING', 'QUO-2025-054', 0.0, 11.0, 14700000],
      
      ['PT. Nusantara Digital', '2025-08-20', 'approved', 'PENAWARAN SSL CERTIFICATE', 'QUO-2025-055', 5.0, 11.0, 8950000],
      ['UD. Mandiri Abadi', '2025-08-20', 'sent', 'PENAWARAN DOMAIN & HOSTING', 'QUO-2025-056', 8.0, 11.0, 12400000],
      
      ['PT. Teknologi Maju', '2025-08-22', 'draft', 'PENAWARAN PENETRATION TESTING', 'QUO-2025-057', 0.0, 11.0, 38600000],
      ['CV. Inovasi Digital', '2025-08-22', 'approved', 'PENAWARAN CODE REVIEW SERVICE', 'QUO-2025-058', 10.0, 11.0, 22800000],
      ['PT. Solusi Kreatif', '2025-08-22', 'sent', 'PENAWARAN QUALITY ASSURANCE', 'QUO-2025-059', 7.0, 11.0, 29400000],
      
      // Agustus 2025 - Hari ini
      ['UD. Berkah Jaya', '2025-08-24', 'draft', 'PENAWARAN BARANG/JASA TERBARU', 'QT-2025-060', 0.0, 11.0, 15750000]
    ];
    
    // Insert quotations
    let insertedCount = 0;
    for (const quotation of quotations) {
      await runQuery(`
        INSERT INTO quotations (customer, date, status, title, quotation_number, discount, tax, total) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, quotation);
      insertedCount++;
      if (insertedCount % 10 === 0) {
        console.log(`✅ Inserted ${insertedCount} quotations...`);
      }
    }
    
    console.log(`✅ Total ${insertedCount} quotations berhasil diinsert`);
    
    // Cek hasil
    const results = await getResults();
    
    console.log('\n📊 Hasil Import Data:');
    console.log(`📋 Total Quotations: ${results.quotationCount.count}`);
    console.log(`👥 Total Customers: ${results.customerCount.count}`);
    
    // Tampilkan beberapa data sample
    console.log('\n📅 Sample Quotations per tanggal:');
    results.sampleData.forEach(row => {
      console.log(`  ${row.date}: ${row.count} quotation(s)`);
    });
    
    console.log('\n🎉 Import data dummy berhasil!');
    
  } catch (error) {
    console.error('❌ Error saat import data:', error.message);
  } finally {
    db.close();
  }
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getResults() {
  return new Promise((resolve, reject) => {
    const queries = {
      quotationCount: 'SELECT COUNT(*) as count FROM quotations',
      customerCount: 'SELECT COUNT(*) as count FROM customers',
      sampleData: `
        SELECT date, COUNT(*) as count 
        FROM quotations 
        GROUP BY date 
        ORDER BY date DESC 
        LIMIT 15
      `
    };
    
    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
      if (key === 'sampleData') {
        db.all(query, (err, rows) => {
          if (err) reject(err);
          else {
            results[key] = rows;
            completed++;
            if (completed === total) resolve(results);
          }
        });
      } else {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else {
            results[key] = row;
            completed++;
            if (completed === total) resolve(results);
          }
        });
      }
    });
  });
}

importData();
