-- Script untuk menambahkan data dummy ke database
-- Run dengan: sqlite3 quotation.db < seed_data.sql

-- Hapus data lama dan tambah data dummy yang lebih lengkap

-- Tambah customers
DELETE FROM customers;
INSERT INTO customers (name, email, phone, address, city) VALUES 
('PT. Teknologi Maju', 'teknologi@maju.com', '021-1234567', 'Jl. Sudirman No. 123', 'Jakarta'),
('CV. Inovasi Digital', 'info@inovasi.digital', '021-9876543', 'Jl. Gatot Subroto No. 456', 'Jakarta'),
('PT. Solusi Kreatif', 'contact@solusik.com', '031-1122334', 'Jl. Pemuda No. 789', 'Surabaya'),
('UD. Berkah Jaya', 'berkah@jaya.id', '0274-556677', 'Jl. Malioboro No. 321', 'Yogyakarta'),
('PT. Global Sistem', 'admin@globalsistem.co.id', '024-7788990', 'Jl. Pahlawan No. 654', 'Semarang'),
('CV. Tech Solutions', 'hello@techsol.net', '022-3344556', 'Jl. Asia Afrika No. 987', 'Bandung'),
('PT. Nusantara Digital', 'contact@nusadigital.com', '0361-6677889', 'Jl. Sunset Road No. 159', 'Denpasar'),
('UD. Mandiri Abadi', 'mandiri@abadi.com', '0751-4455667', 'Jl. Imam Bonjol No. 753', 'Padang');

-- Tambah items master (tanpa quotation_id untuk master data)
DELETE FROM items WHERE quotation_id IS NULL;
INSERT INTO items (name, type, price, unit, stock) VALUES 
-- Hardware & Equipment
('Laptop Dell Inspiron 15', 'Barang', 8500000, 'Unit', 25),
('Monitor LED 24 inch', 'Barang', 2500000, 'Unit', 40),
('Keyboard Mechanical RGB', 'Barang', 750000, 'Unit', 30),
('Mouse Wireless', 'Barang', 350000, 'Unit', 50),
('Router WiFi 6', 'Barang', 1200000, 'Unit', 15),
('Switch 24 Port', 'Barang', 3500000, 'Unit', 8),
('Kabel UTP Cat6', 'Barang', 15000, 'Meter', 500),
('Access Point Indoor', 'Barang', 850000, 'Unit', 20),

-- Software & Licenses
('Windows 11 Pro License', 'Barang', 3200000, 'License', 10),
('Microsoft Office 365', 'Barang', 1800000, 'License/Tahun', 5),
('Antivirus Enterprise', 'Barang', 650000, 'License/Tahun', 20),

-- Services
('Instalasi Jaringan', 'Jasa', 5000000, 'Paket', 0),
('Maintenance IT Monthly', 'Jasa', 2500000, 'Bulan', 0),
('Website Development', 'Jasa', 15000000, 'Project', 0),
('Mobile App Development', 'Jasa', 25000000, 'Project', 0),
('IT Consultation', 'Jasa', 1500000, 'Hari', 0),
('Data Recovery Service', 'Jasa', 3000000, 'Kasus', 0),
('Cloud Setup & Migration', 'Jasa', 8000000, 'Project', 0),
('Cybersecurity Assessment', 'Jasa', 12000000, 'Project', 0),

-- Training & Education  
('Training Microsoft Office', 'Jasa', 3500000, 'Batch', 0),
('Workshop Cybersecurity', 'Jasa', 7500000, 'Batch', 0);

-- Tambah quotations dummy (menggunakan customer sebagai string, bukan customer_id)
DELETE FROM quotations;
INSERT INTO quotations (customer, date, status, title, quotation_number, discount, tax, total) VALUES 
('PT. Teknologi Maju', '2025-07-15', 'sent', 'PENAWARAN INFRASTRUKTUR IT', 'QUO-2025-001', 5.0, 11.0, 45650000),
('CV. Inovasi Digital', '2025-07-20', 'approved', 'PENAWARAN SOFTWARE & HARDWARE', 'QUO-2025-002', 10.0, 11.0, 28575000),
('PT. Solusi Kreatif', '2025-07-25', 'draft', 'PENAWARAN JASA DEVELOPMENT', 'QUO-2025-003', 0.0, 11.0, 44400000),
('UD. Berkah Jaya', '2025-07-28', 'sent', 'PENAWARAN MAINTENANCE IT', 'QUO-2025-004', 7.5, 11.0, 16650000),
('PT. Global Sistem', '2025-08-01', 'approved', 'PENAWARAN CLOUD MIGRATION', 'QUO-2025-005', 5.0, 11.0, 22200000);

-- Update quotation items untuk quotation
DELETE FROM items WHERE quotation_id IS NOT NULL;
INSERT INTO items (quotation_id, name, type, qty, price) VALUES 
-- Quotation 1: Infrastruktur IT
(1, 'Laptop Dell Inspiron 15', 'Barang', 5, 8500000),
(1, 'Monitor LED 24 inch', 'Barang', 5, 2500000),
(1, 'Router WiFi 6', 'Barang', 2, 1200000),
(1, 'Switch 24 Port', 'Barang', 1, 3500000),
(1, 'Instalasi Jaringan', 'Jasa', 1, 5000000),

-- Quotation 2: Software & Hardware
(2, 'Laptop Dell Inspiron 15', 'Barang', 3, 8500000),
(2, 'Windows 11 Pro License', 'Barang', 3, 3200000),
(2, 'Microsoft Office 365', 'Barang', 3, 1800000),

-- Quotation 3: Development Services
(3, 'Website Development', 'Jasa', 1, 15000000),
(3, 'Mobile App Development', 'Jasa', 1, 25000000),
(3, 'IT Consultation', 'Jasa', 3, 1500000),

-- Quotation 4: Maintenance
(4, 'Maintenance IT Monthly', 'Jasa', 6, 2500000),
(4, 'Antivirus Enterprise', 'Barang', 10, 650000),

-- Quotation 5: Cloud Migration
(5, 'Cloud Setup & Migration', 'Jasa', 1, 8000000),
(5, 'Cybersecurity Assessment', 'Jasa', 1, 12000000);

-- Update settings
UPDATE settings SET 
company_name = 'PT. Solusi Teknologi Indonesia',
company_address = 'Jl. Jenderal Sudirman No. 123',
company_city = 'Jakarta Pusat 10220, Indonesia',
company_phone = '021-5555-7777',
company_email = 'info@soluteknologi.co.id',
company_website = 'www.soluteknologi.co.id'
WHERE id = 1;

-- Insert settings jika belum ada
INSERT INTO settings (company_name, company_address, company_city, company_phone, company_email, company_website) 
SELECT 'PT. Solusi Teknologi Indonesia', 'Jl. Jenderal Sudirman No. 123', 'Jakarta Pusat 10220, Indonesia', '021-5555-7777', 'info@soluteknologi.co.id', 'www.soluteknologi.co.id'
WHERE NOT EXISTS (SELECT 1 FROM settings);
