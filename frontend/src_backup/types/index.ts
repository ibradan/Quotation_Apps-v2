/**
 * Type definitions untuk aplikasi Quotation Management
 */

// Customer types
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

// Item types  
export interface Item {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

// Quotation Item types
export interface QuotationItem {
  id?: number;
  quotation_id?: number;
  item_id: number;
  item_name?: string;
  qty: number;
  price: number;
  total?: number;
}

// Quotation types
export interface Quotation {
  id?: number;
  quotation_number?: string;
  customer_id: number;
  customer_name?: string;
  date: string;
  title?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  items?: QuotationItem[];
  created_at?: string;
  updated_at?: string;
}

// Settings types
export interface Settings {
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  tax_rate?: number;
  quotation_validity_days?: number;
  quotation_prefix?: string;
  currency?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Hook states
export interface UseQuotationsState {
  quotations: Quotation[];
  quotationItems: Record<number, QuotationItem[]>;
  history: any[];
  loading: boolean;
  historyLoading: boolean;
  filter: string;
  error: string | null;
}

export interface UseItemsState {
  items: Item[];
  loading: boolean;
  filter: string;
  formOpen: boolean;
  editItem: Item | null;
  error: string | null;
}

export interface UseCustomersState {
  customers: Customer[];
  loading: boolean;
  filter: string;
  formOpen: boolean;
  editCustomer: Customer | null;
  error: string | null;
}

export interface UseSettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
}

// Validation result types
export interface ValidationError {
  [key: string]: string;
}

// Component prop types
export interface DashboardProps {
  quotations: UseQuotationsState;
  items: UseItemsState;
  customers: UseCustomersState;
}

export interface QuotationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Quotation>) => Promise<void>;
  quotation?: Quotation;
  customers: Customer[];
  availableItems: Item[];
}

// Form data types
export interface QuotationFormData {
  customer_id: number;
  date: string;
  title?: string;
  discount: number;
  tax: number;
  items: QuotationItem[];
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ItemFormData {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  stock?: number;
}
