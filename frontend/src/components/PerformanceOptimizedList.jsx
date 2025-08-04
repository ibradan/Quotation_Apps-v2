import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useInView } from 'react-intersection-observer';

// Virtualized list item component
const VirtualizedItem = React.memo(({ item, index, renderItem, itemHeight = 60 }) => {
  const [ref, inView] = useInView({
    threshold: 0,
    rootMargin: '50px 0px'
  });

  return (
    <div
      ref={ref}
      style={{
        height: itemHeight,
        position: 'relative'
      }}
    >
      {inView ? renderItem(item, index) : (
        <div style={{ height: itemHeight, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} />
        </div>
      )}
    </div>
  );
});

// Performance optimized list component
const PerformanceOptimizedList = ({
  items = [],
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  loading = false,
  error = null,
  emptyMessage = 'Tidak ada data',
  onLoadMore = null,
  hasMore = false,
  loadingMore = false,
  searchTerm = '',
  filterFunction = null,
  sortFunction = null,
  className = '',
  ...props
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  // Filter and sort items
  const processedItems = useMemo(() => {
    let processed = [...items];

    // Apply search filter
    if (searchTerm && filterFunction) {
      processed = processed.filter(item => filterFunction(item, searchTerm));
    }

    // Apply sorting
    if (sortFunction) {
      processed.sort(sortFunction);
    }

    return processed;
  }, [items, searchTerm, filterFunction, sortFunction]);

  // Calculate visible items based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      processedItems.length
    );

    setVisibleRange({ start: Math.max(0, startIndex), end: endIndex });
  }, [itemHeight, processedItems.length]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    calculateVisibleRange();

    // Check if we need to load more items
    if (onLoadMore && hasMore && !loadingMore) {
      const container = containerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const threshold = 100; // pixels from bottom

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
          onLoadMore();
        }
      }
    }
  }, [calculateVisibleRange, onLoadMore, hasMore, loadingMore]);

  // Debounced scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16); // ~60fps
    };

    container.addEventListener('scroll', debouncedScroll);
    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Initial calculation
  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange]);

  // Render visible items
  const visibleItems = useMemo(() => {
    return processedItems
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => {
        const actualIndex = visibleRange.start + index;
        return (
          <VirtualizedItem
            key={`${item.id || actualIndex}-${actualIndex}`}
            item={item}
            index={actualIndex}
            renderItem={renderItem}
            itemHeight={itemHeight}
          />
        );
      });
  }, [processedItems, visibleRange, renderItem, itemHeight]);

  // Calculate total height for scroll container
  const totalHeight = processedItems.length * itemHeight;

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={containerHeight}
        className={className}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={containerHeight}
        className={className}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (processedItems.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={containerHeight}
        className={className}
      >
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={className} {...props}>
      {/* Virtualized list container */}
      <div
        ref={containerRef}
        style={{
          height: containerHeight,
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {/* Spacer for scroll height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items positioned absolutely */}
          <div
            style={{
              position: 'absolute',
              top: visibleRange.start * itemHeight,
              left: 0,
              right: 0
            }}
          >
            {visibleItems}
          </div>
        </div>
      </div>

      {/* Load more indicator */}
      {loadingMore && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={2}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" ml={1}>
            Memuat data...
          </Typography>
        </Box>
      )}

      {/* End of list indicator */}
      {!hasMore && processedItems.length > 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={2}
        >
          <Typography variant="body2" color="text.secondary">
            Semua data telah dimuat
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// HOC for adding search functionality
export const withSearch = (Component) => {
  return React.forwardRef(({ searchProps = {}, ...props }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
      <Component
        ref={ref}
        {...props}
        searchTerm={debouncedSearchTerm}
        onSearchChange={setSearchTerm}
        searchProps={{
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          ...searchProps
        }}
      />
    );
  });
};

// HOC for adding infinite scroll
export const withInfiniteScroll = (Component) => {
  return React.forwardRef(({ onLoadMore, hasMore, ...props }, ref) => {
    const [loadingMore, setLoadingMore] = useState(false);

    const handleLoadMore = useCallback(async () => {
      if (loadingMore || !hasMore) return;

      setLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setLoadingMore(false);
      }
    }, [onLoadMore, hasMore, loadingMore]);

    return (
      <Component
        ref={ref}
        {...props}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    );
  });
};

export default React.memo(PerformanceOptimizedList); 