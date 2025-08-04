import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Retry on network errors, but not on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error, variables, context) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query keys factory for better organization
export const queryKeys = {
  all: ['quotations'],
  lists: () => [...queryKeys.all, 'list'],
  list: (filters) => [...queryKeys.lists(), { filters }],
  details: () => [...queryKeys.all, 'detail'],
  detail: (id) => [...queryKeys.details(), id],
  
  items: {
    all: ['items'],
    lists: () => [...queryKeys.items.all, 'list'],
    list: (filters) => [...queryKeys.items.lists(), { filters }],
    details: () => [...queryKeys.items.all, 'detail'],
    detail: (id) => [...queryKeys.items.details(), id],
  },
  
  customers: {
    all: ['customers'],
    lists: () => [...queryKeys.customers.all, 'list'],
    list: (filters) => [...queryKeys.customers.lists(), { filters }],
    details: () => [...queryKeys.customers.all, 'detail'],
    detail: (id) => [...queryKeys.customers.details(), id],
  },
  
  settings: {
    all: ['settings'],
    company: () => [...queryKeys.settings.all, 'company'],
  },
};
