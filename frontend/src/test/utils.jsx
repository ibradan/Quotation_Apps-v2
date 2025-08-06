import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { describe, it, expect, beforeEach } from 'vitest'

// Test utilities
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

export const TestWrapper = ({ children }) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export const renderWithProviders = (ui, options = {}) => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  })
}

// Mock data
export const mockQuotation = {
  id: 1,
  quotation_number: 'QUO-001',
  customer_name: 'Test Customer',
  customer_id: 1,
  quotation_date: '2024-01-01',
  expiry_date: '2024-01-31',
  subject: 'Test Quotation',
  status: 'draft',
  subtotal: 1000000,
  tax: 110000,
  total: 1110000,
  items: [
    {
      id: 1,
      name: 'Test Item',
      quantity: 2,
      price: 500000,
      subtotal: 1000000,
    }
  ],
}

export const mockCustomer = {
  id: 1,
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '081234567890',
  address: 'Test Address',
  company: 'Test Company',
}

export const mockItem = {
  id: 1,
  name: 'Test Item',
  description: 'Test Description',
  price: 500000,
  unit: 'pcs',
  stock: 100,
}

export const mockSettings = {
  company_name: 'Test Company',
  company_address: 'Test Address',
  company_phone: '081234567890',
  company_email: 'test@company.com',
  default_tax_percentage: 11,
}

// Common test helpers
export const waitForLoadingToFinish = () => screen.findByText(/test/i)

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
