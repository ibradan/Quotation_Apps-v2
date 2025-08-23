import { useState, useEffect, useCallback } from 'react';
import { apiClient, safeApiCall } from '../utils/apiUtils';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [error, setError] = useState(null);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch customers dengan error handling robust
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const customersData = await safeApiCall(
        () => apiClient.get('/customers'),
        2,
        'fetch customers'
      );
      
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add/Update customer
  const saveCustomer = useCallback(async (data) => {
    if (!data || !data.name) {
      throw new Error('Nama customer wajib diisi');
    }

    try {
      // Check for duplicates
      const isDuplicate = customers.some(customer => {
        if (editCustomer && customer.id === editCustomer.id) return false;
        
        return customer.name && data.name &&
               customer.name.toLowerCase().trim() === data.name.toLowerCase().trim();
      });

      if (isDuplicate) {
        throw new Error('Customer dengan nama yang sama sudah ada!');
      }

      let result;
      if (editCustomer) {
        result = await safeApiCall(
          () => apiClient.put(`/customers/${editCustomer.id}`, data),
          1,
          'update customer'
        );
      } else {
        result = await safeApiCall(
          () => apiClient.post('/customers', data),
          1,
          'add customer'
        );
      }

      await fetchCustomers(); // Refresh data
      
      // Close form
      setFormOpen(false);
      setEditCustomer(null);
      
      return result;
    } catch (err) {
      setError(err.message || 'Gagal menyimpan customer');
      throw err;
    }
  }, [customers, editCustomer, fetchCustomers]);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    if (!id) {
      throw new Error('ID customer tidak valid');
    }

    try {
      await safeApiCall(
        () => apiClient.delete(`/customers/${id}`),
        1,
        'delete customer'
      );
      
      await fetchCustomers(); // Refresh data
    } catch (err) {
      setError(err.message || 'Gagal menghapus customer');
      throw err;
    }
  }, [fetchCustomers]);

  // Form handlers
  const openAddForm = useCallback(() => {
    setEditCustomer(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((customer) => {
    setEditCustomer(customer);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditCustomer(null);
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;

    if (filter) {
      const searchText = filter.toLowerCase();
      return (
        (customer.name && customer.name.toLowerCase().includes(searchText)) ||
        (customer.email && customer.email.toLowerCase().includes(searchText)) ||
        (customer.phone && customer.phone.includes(filter)) ||
        (customer.company && customer.company.toLowerCase().includes(searchText)) ||
        (customer.city && customer.city.toLowerCase().includes(searchText))
      );
    }

    return true;
  });

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    // Data
    customers: filteredCustomers,
    allCustomers: customers, // Unfiltered customers
    
    // States
    loading,
    error,
    filter,
    formOpen,
    editCustomer,
    
    // Actions
    setFilter,
    fetchCustomers,
    saveCustomer,
    deleteCustomer,
    openAddForm,
    openEditForm,
    closeForm,
    
    // Clear error manually
    clearError: () => setError(null)
  };
};
