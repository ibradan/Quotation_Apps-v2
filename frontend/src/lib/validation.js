import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .min(1, 'Email wajib diisi');

export const phoneSchema = z
  .string()
  .min(10, 'Nomor telepon minimal 10 digit')
  .max(15, 'Nomor telepon maksimal 15 digit')
  .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid');

export const currencySchema = z
  .number()
  .min(0, 'Harga tidak boleh negatif')
  .max(999999999, 'Harga terlalu besar');

export const percentageSchema = z
  .number()
  .min(0, 'Persentase tidak boleh negatif')
  .max(100, 'Persentase tidak boleh lebih dari 100%');

// Customer validation schema
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama customer wajib diisi')
    .min(2, 'Nama customer minimal 2 karakter')
    .max(100, 'Nama customer maksimal 100 karakter'),
  
  email: emailSchema.optional().or(z.literal('')),
  
  phone: phoneSchema.optional().or(z.literal('')),
  
  address: z
    .string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional(),
  
  company: z
    .string()
    .max(100, 'Nama perusahaan maksimal 100 karakter')
    .optional(),
  
  tax_id: z
    .string()
    .max(50, 'NPWP maksimal 50 karakter')
    .optional(),
});

// Item validation schema
export const itemSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama item wajib diisi')
    .min(2, 'Nama item minimal 2 karakter')
    .max(100, 'Nama item maksimal 100 karakter'),
  
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  
  price: currencySchema,
  
  unit: z
    .string()
    .min(1, 'Satuan wajib diisi')
    .max(20, 'Satuan maksimal 20 karakter'),
  
  category: z
    .string()
    .max(50, 'Kategori maksimal 50 karakter')
    .optional(),
  
  stock: z
    .number()
    .min(0, 'Stok tidak boleh negatif')
    .optional(),
  
  sku: z
    .string()
    .max(50, 'SKU maksimal 50 karakter')
    .optional(),
  
  is_service: z.boolean().default(false),
});

// Quotation item validation schema
export const quotationItemSchema = z.object({
  item_id: z
    .number()
    .min(1, 'Item wajib dipilih'),
  
  quantity: z
    .number()
    .min(0.01, 'Kuantitas minimal 0.01')
    .max(999999, 'Kuantitas terlalu besar'),
  
  price: currencySchema,
  
  discount_percentage: percentageSchema.default(0),
  
  discount_amount: currencySchema.default(0),
  
  notes: z
    .string()
    .max(200, 'Catatan maksimal 200 karakter')
    .optional(),
});

// Quotation validation schema
export const quotationSchema = z.object({
  quotation_number: z
    .string()
    .min(1, 'Nomor quotation wajib diisi')
    .max(50, 'Nomor quotation maksimal 50 karakter'),
  
  customer_id: z
    .number()
    .min(1, 'Customer wajib dipilih'),
  
  quotation_date: z
    .string()
    .min(1, 'Tanggal quotation wajib diisi')
    .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
  
  expiry_date: z
    .string()
    .min(1, 'Tanggal expired wajib diisi')
    .refine((date) => !isNaN(Date.parse(date)), 'Format tanggal tidak valid'),
  
  subject: z
    .string()
    .min(1, 'Subject wajib diisi')
    .max(200, 'Subject maksimal 200 karakter'),
  
  terms_conditions: z
    .string()
    .max(1000, 'Terms & Conditions maksimal 1000 karakter')
    .optional(),
  
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional(),
  
  tax_percentage: percentageSchema.default(0),
  
  tax_amount: currencySchema.default(0),
  
  discount_percentage: percentageSchema.default(0),
  
  discount_amount: currencySchema.default(0),
  
  subtotal: currencySchema,
  
  total: currencySchema,
  
  status: z
    .enum(['draft', 'sent', 'accepted', 'rejected', 'expired'], {
      errorMap: () => ({ message: 'Status tidak valid' })
    })
    .default('draft'),
  
  items: z
    .array(quotationItemSchema)
    .min(1, 'Minimal harus ada 1 item')
    .max(50, 'Maksimal 50 item per quotation'),
}).refine((data) => {
  // Validate expiry date is after quotation date
  const quotationDate = new Date(data.quotation_date);
  const expiryDate = new Date(data.expiry_date);
  return expiryDate >= quotationDate;
}, {
  message: 'Tanggal expired harus setelah tanggal quotation',
  path: ['expiry_date']
}).refine((data) => {
  // Validate total calculation
  const itemsTotal = data.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    const discountAmount = item.discount_amount || (itemTotal * (item.discount_percentage || 0) / 100);
    return sum + (itemTotal - discountAmount);
  }, 0);
  
  const quotationDiscount = data.discount_amount || (itemsTotal * (data.discount_percentage || 0) / 100);
  const afterDiscount = itemsTotal - quotationDiscount;
  const tax = data.tax_amount || (afterDiscount * (data.tax_percentage || 0) / 100);
  const expectedTotal = afterDiscount + tax;
  
  // Allow small rounding differences (1 rupiah)
  return Math.abs(data.total - expectedTotal) <= 1;
}, {
  message: 'Total perhitungan tidak sesuai',
  path: ['total']
});

// Settings validation schema
export const settingsSchema = z.object({
  company_name: z
    .string()
    .min(1, 'Nama perusahaan wajib diisi')
    .max(100, 'Nama perusahaan maksimal 100 karakter'),
  
  company_address: z
    .string()
    .max(500, 'Alamat perusahaan maksimal 500 karakter')
    .optional(),
  
  company_phone: phoneSchema.optional().or(z.literal('')),
  
  company_email: emailSchema.optional().or(z.literal('')),
  
  company_website: z
    .string()
    .url('Format website tidak valid')
    .optional()
    .or(z.literal('')),
  
  tax_id: z
    .string()
    .max(50, 'NPWP maksimal 50 karakter')
    .optional(),
  
  default_currency: z
    .string()
    .min(1, 'Mata uang default wajib diisi')
    .max(3, 'Kode mata uang maksimal 3 karakter')
    .default('IDR'),
  
  default_tax_percentage: percentageSchema.default(11),
  
  quotation_validity_days: z
    .number()
    .min(1, 'Masa berlaku minimal 1 hari')
    .max(365, 'Masa berlaku maksimal 365 hari')
    .default(30),
  
  auto_increment_quotation: z.boolean().default(true),
  
  quotation_number_prefix: z
    .string()
    .max(10, 'Prefix maksimal 10 karakter')
    .default('QUO'),
  
  email_signature: z
    .string()
    .max(1000, 'Signature email maksimal 1000 karakter')
    .optional(),
});

// Login validation schema (if needed)
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter'),
});

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Pencarian maksimal 100 karakter')
    .optional(),
  
  filter_status: z
    .enum(['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'])
    .default('all'),
  
  filter_date_from: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Format tanggal tidak valid')
    .optional(),
  
  filter_date_to: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Format tanggal tidak valid')
    .optional(),
  
  sort_by: z
    .enum(['date', 'number', 'customer', 'total', 'status'])
    .default('date'),
  
  sort_order: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

// Export utility function for validation
export const validateData = (schema, data) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});
      return { success: false, data: null, errors: formattedErrors };
    }
    return { success: false, data: null, errors: { general: 'Validation error' } };
  }
};

// Export partial schemas for step-by-step validation
export const partialQuotationSchema = quotationSchema.partial();
export const partialCustomerSchema = customerSchema.partial();
export const partialItemSchema = itemSchema.partial();
export const partialSettingsSchema = settingsSchema.partial();
