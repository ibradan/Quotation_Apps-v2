import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationService } from '../services/quotationService';
import { queryKeys } from '../lib/queryClient';
import { useNotification } from '../contexts/NotificationContext';

// Get all quotations with enhanced caching
export const useQuotations = (filters = '') => {
  return useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: () => quotationService.getQuotations(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
    select: (data) => {
      // Transform data if needed
      return data?.map(quotation => ({
        ...quotation,
        // Add computed fields
        formattedTotal: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(quotation.total || 0),
        isExpired: quotation.expiry_date && new Date(quotation.expiry_date) < new Date(),
        daysUntilExpiry: quotation.expiry_date 
          ? Math.ceil((new Date(quotation.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
          : null,
      })) || [];
    },
  });
};

// Get single quotation with items
export const useQuotation = (id) => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => quotationService.getQuotationById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 1, // 1 minute for detailed data
    select: (data) => {
      if (!data) return null;
      
      return {
        ...data,
        formattedTotal: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(data.total || 0),
        items: data.items?.map(item => ({
          ...item,
          formattedSubtotal: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(item.subtotal || 0),
          formattedPrice: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(item.price || 0),
        })) || [],
      };
    },
  });
};

// Create quotation mutation with optimistic updates
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: quotationService.createQuotation,
    onMutate: async (newQuotation) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.lists() });

      // Snapshot the previous value
      const previousQuotations = queryClient.getQueryData(queryKeys.list(''));

      // Optimistically update to the new value
      if (previousQuotations) {
        const optimisticQuotation = {
          id: Date.now(), // Temporary ID
          ...newQuotation,
          status: 'draft',
          created_at: new Date().toISOString(),
          formattedTotal: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(newQuotation.total || 0),
        };

        queryClient.setQueryData(
          queryKeys.list(''),
          [optimisticQuotation, ...previousQuotations]
        );
      }

      return { previousQuotations };
    },
    onError: (err, newQuotation, context) => {
      // Rollback on error
      if (context?.previousQuotations) {
        queryClient.setQueryData(queryKeys.list(''), context.previousQuotations);
      }
      showNotification('Gagal membuat quotation: ' + err.message, 'error');
    },
    onSuccess: (data) => {
      showNotification('Quotation berhasil dibuat', 'success');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};

// Update quotation mutation
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, ...data }) => quotationService.updateQuotation(id, data),
    onMutate: async ({ id, ...updatedData }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.lists() });

      // Snapshot previous values
      const previousQuotation = queryClient.getQueryData(queryKeys.detail(id));
      const previousQuotations = queryClient.getQueryData(queryKeys.list(''));

      // Optimistically update detail
      if (previousQuotation) {
        queryClient.setQueryData(queryKeys.detail(id), {
          ...previousQuotation,
          ...updatedData,
          formattedTotal: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(updatedData.total || previousQuotation.total || 0),
        });
      }

      // Optimistically update list
      if (previousQuotations) {
        queryClient.setQueryData(
          queryKeys.list(''),
          previousQuotations.map(q => 
            q.id === id 
              ? {
                  ...q,
                  ...updatedData,
                  formattedTotal: new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(updatedData.total || q.total || 0),
                }
              : q
          )
        );
      }

      return { previousQuotation, previousQuotations };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousQuotation) {
        queryClient.setQueryData(queryKeys.detail(id), context.previousQuotation);
      }
      if (context?.previousQuotations) {
        queryClient.setQueryData(queryKeys.list(''), context.previousQuotations);
      }
      showNotification('Gagal mengupdate quotation: ' + err.message, 'error');
    },
    onSuccess: () => {
      showNotification('Quotation berhasil diupdate', 'success');
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};

// Delete quotation mutation
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: quotationService.deleteQuotation,
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.lists() });

      // Snapshot previous value
      const previousQuotations = queryClient.getQueryData(queryKeys.list(''));

      // Optimistically remove from list
      if (previousQuotations) {
        queryClient.setQueryData(
          queryKeys.list(''),
          previousQuotations.filter(q => q.id !== id)
        );
      }

      return { previousQuotations };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousQuotations) {
        queryClient.setQueryData(queryKeys.list(''), context.previousQuotations);
      }
      showNotification('Gagal menghapus quotation: ' + err.message, 'error');
    },
    onSuccess: () => {
      showNotification('Quotation berhasil dihapus', 'success');
    },
    onSettled: (data, error, id) => {
      // Clean up and refetch
      queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};

// Update quotation status
export const useUpdateQuotationStatus = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, status }) => quotationService.updateQuotationStatus(id, status),
    onSuccess: (data, { id, status }) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      
      const statusMessages = {
        'sent': 'Quotation berhasil dikirim',
        'accepted': 'Quotation diterima',
        'rejected': 'Quotation ditolak',
        'expired': 'Quotation expired',
      };
      
      showNotification(statusMessages[status] || 'Status quotation berhasil diupdate', 'success');
    },
    onError: (err) => {
      showNotification('Gagal mengupdate status: ' + err.message, 'error');
    },
  });
};

// Prefetch quotation (for hover previews, etc.)
export const usePrefetchQuotation = () => {
  const queryClient = useQueryClient();

  return (id) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => quotationService.getQuotationById(id),
      staleTime: 1000 * 60 * 1, // 1 minute
    });
  };
};
