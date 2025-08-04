import { describe, it, expect } from 'vitest'
import { validateData, quotationSchema, customerSchema, itemSchema } from '../validation'

describe('Validation Schemas', () => {
  describe('Customer Validation', () => {
    it('validates correct customer data', () => {
      const validCustomer = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '08123456789',
        address: 'Test Address',
        company: 'Test Company',
      }

      const result = validateData(customerSchema, validCustomer)
      expect(result.success).toBe(true)
      expect(result.errors).toBeNull()
    })

    it('rejects invalid customer data', () => {
      const invalidCustomer = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email
        phone: '123', // Too short phone
      }

      const result = validateData(customerSchema, invalidCustomer)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveProperty('name')
      expect(result.errors).toHaveProperty('email')
      expect(result.errors).toHaveProperty('phone')
    })
  })

  describe('Item Validation', () => {
    it('validates correct item data', () => {
      const validItem = {
        name: 'Test Item',
        description: 'Test Description',
        price: 100000,
        unit: 'pcs',
        category: 'Electronics',
        stock: 50,
      }

      const result = validateData(itemSchema, validItem)
      expect(result.success).toBe(true)
      expect(result.errors).toBeNull()
    })

    it('rejects invalid item data', () => {
      const invalidItem = {
        name: 'A', // Too short
        price: -100, // Negative price
        unit: '', // Empty unit
      }

      const result = validateData(itemSchema, invalidItem)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveProperty('name')
      expect(result.errors).toHaveProperty('price')
      expect(result.errors).toHaveProperty('unit')
    })
  })

  describe('Quotation Validation', () => {
    it('validates correct quotation data', () => {
      const validQuotation = {
        quotation_number: 'QUO-001',
        customer_id: 1,
        quotation_date: '2024-01-01',
        expiry_date: '2024-01-31',
        subject: 'Test Quotation',
        terms_conditions: 'Standard terms',
        tax_percentage: 11,
        tax_amount: 11000,
        discount_percentage: 0,
        discount_amount: 0,
        subtotal: 100000,
        total: 111000,
        status: 'draft',
        items: [
          {
            item_id: 1,
            quantity: 1,
            price: 100000,
            discount_percentage: 0,
            discount_amount: 0,
          },
        ],
      }

      const result = validateData(quotationSchema, validQuotation)
      expect(result.success).toBe(true)
      expect(result.errors).toBeNull()
    })

    it('rejects quotation with invalid dates', () => {
      const invalidQuotation = {
        quotation_number: 'QUO-001',
        customer_id: 1,
        quotation_date: '2024-01-31',
        expiry_date: '2024-01-01', // Before quotation date
        subject: 'Test Quotation',
        subtotal: 100000,
        total: 111000,
        status: 'draft',
        items: [
          {
            item_id: 1,
            quantity: 1,
            price: 100000,
            discount_percentage: 0,
            discount_amount: 0,
          },
        ],
      }

      const result = validateData(quotationSchema, invalidQuotation)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveProperty('expiry_date')
    })

    it('rejects quotation without items', () => {
      const invalidQuotation = {
        quotation_number: 'QUO-001',
        customer_id: 1,
        quotation_date: '2024-01-01',
        expiry_date: '2024-01-31',
        subject: 'Test Quotation',
        subtotal: 100000,
        total: 111000,
        status: 'draft',
        items: [], // Empty items
      }

      const result = validateData(quotationSchema, invalidQuotation)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveProperty('items')
    })
  })
})
