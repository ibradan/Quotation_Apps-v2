import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiUtils';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      console.log('Fetching customers...');
      const data = await apiClient.get('/customers');
      console.log('Customers received:', data);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal fetch customers:', err);
      alert('Gagal memuat data customer: ' + (err?.response?.data?.error || err.message));
      setCustomers([]);
    }
    setLoading(false);
  };

    // Add/Update customer
  const saveCustomer = async (data) => {
    try {
      if (editCustomer) {
        await apiClient.put(`/customers/${editCustomer.id}`, data);
      } else {
        await apiClient.post('/customers', data);
      }
      await fetchCustomers(); // Refresh data
    } catch (err) {
      console.error('Gagal simpan customer:', err);
      alert('Gagal menyimpan customer: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    if (!confirm('Yakin ingin menghapus customer ini?')) return;
    
    try {
      await apiClient.delete(`/customers/${id}`);
      await fetchCustomers(); // Refresh data
    } catch (err) {
      console.error('Gagal hapus customer:', err);
      alert('Gagal menghapus customer: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(filter.toLowerCase()) ||
    customer.email?.toLowerCase().includes(filter.toLowerCase()) ||
    customer.phone?.includes(filter)
  );

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers: filteredCustomers,
    loading,
    filter,
    setFilter,
    formOpen,
    setFormOpen,
    editCustomer,
    setEditCustomer,
    fetchCustomers,
    saveCustomer,
    deleteCustomer
  };
}; 