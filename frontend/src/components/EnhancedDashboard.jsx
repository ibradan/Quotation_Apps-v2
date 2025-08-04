import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Receipt,
  Inventory,
  AttachMoney,
  Refresh,
  Visibility,
  Download,
  Print
} from '@mui/icons-material';
import { useQuotations } from '../hooks/useQuotations';
import { useItems } from '../hooks/useItems';
import { useCustomers } from '../hooks/useCustomers';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

// Stat Card Component
const StatCard = React.memo(({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = 'primary',
  loading = false,
  onClick = null 
}) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      '&:hover': onClick ? {
        transform: 'translateY(-2px)',
        boxShadow: 3
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <LinearProgress sx={{ mt: 1 }} />
          ) : (
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
          )}
          {change !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              {changeType === 'increase' ? (
                <TrendingUp color="success" fontSize="small" />
              ) : (
                <TrendingDown color="error" fontSize="small" />
              )}
              <Typography 
                variant="body2" 
                color={changeType === 'increase' ? 'success.main' : 'error.main'}
                ml={0.5}
              >
                {change}%
              </Typography>
            </Box>
          )}
        </Box>
        <Icon color={color} sx={{ fontSize: 40, opacity: 0.7 }} />
      </Box>
    </CardContent>
  </Card>
));

// Recent Activity Component
const RecentActivity = React.memo(({ activities = [], loading = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Aktivitas Terbaru
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : activities.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          Belum ada aktivitas
        </Typography>
      ) : (
        <Box>
          {activities.slice(0, 5).map((activity, index) => (
            <Box 
              key={index} 
              display="flex" 
              alignItems="center" 
              py={1}
              borderBottom={index < activities.length - 1 ? 1 : 0}
              borderColor="divider"
            >
              <Box
                width={8}
                height={8}
                borderRadius="50%"
                bgcolor={activity.type === 'quotation' ? 'primary.main' : 'success.main'}
                mr={2}
              />
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  {activity.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
              <Chip 
                label={activity.status} 
                size="small" 
                color={activity.status === 'completed' ? 'success' : 'warning'}
              />
            </Box>
          ))}
        </Box>
      )}
    </CardContent>
  </Card>
));

// Quick Actions Component
const QuickActions = React.memo(({ onAction }) => {
  const actions = [
    { label: 'Buat Penawaran', icon: Receipt, color: 'primary' },
    { label: 'Tambah Customer', icon: People, color: 'secondary' },
    { label: 'Kelola Barang', icon: Inventory, color: 'success' },
    { label: 'Export Data', icon: Download, color: 'info' }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Aksi Cepat
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action) => (
            <Grid item xs={6} key={action.label}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<action.icon />}
                color={action.color}
                onClick={() => onAction(action.label.toLowerCase())}
                sx={{ height: 48 }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
});

// Enhanced Dashboard Component
const EnhancedDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Data hooks
  const { data: quotations, isLoading: quotationsLoading, refetch: refetchQuotations } = useQuotations();
  const { data: items, isLoading: itemsLoading, refetch: refetchItems } = useItems();
  const { data: customers, isLoading: customersLoading, refetch: refetchCustomers } = useCustomers();
  const { data: settings, isLoading: settingsLoading } = useSettings();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!quotations || !items || !customers) return null;

    const totalQuotations = quotations.length;
    const totalItems = items.length;
    const totalCustomers = customers.length;
    
    // Calculate total value
    const totalValue = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
    
    // Calculate monthly change (mock data for now)
    const monthlyChange = 12.5; // This would come from actual data comparison
    
    // Calculate conversion rate (quotations to completed)
    const completedQuotations = quotations.filter(q => q.status === 'completed').length;
    const conversionRate = totalQuotations > 0 ? (completedQuotations / totalQuotations) * 100 : 0;

    return {
      totalQuotations,
      totalValue,
      totalItems,
      totalCustomers,
      conversionRate,
      monthlyChange
    };
  }, [quotations, items, customers]);

  // Recent activities
  const recentActivities = useMemo(() => {
    if (!quotations) return [];

    return quotations
      .slice(0, 5)
      .map(q => ({
        title: `Penawaran ${q.quotation_number} untuk ${q.customer}`,
        time: formatDate(q.date),
        type: 'quotation',
        status: q.status === 'completed' ? 'completed' : 'pending'
      }));
  }, [quotations]);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchQuotations();
      refetchItems();
      refetchCustomers();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchQuotations, refetchItems, refetchCustomers]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refetchQuotations();
    refetchItems();
    refetchCustomers();
  }, [refetchQuotations, refetchItems, refetchCustomers]);

  // Handle quick actions
  const handleQuickAction = useCallback((action) => {
    // This would navigate to the appropriate page
    console.log('Quick action:', action);
  }, []);

  // Loading state
  if (quotationsLoading || itemsLoading || customersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Auto refresh">
            <Chip 
              label="Auto refresh" 
              color={autoRefresh ? 'success' : 'default'}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
            />
          </Tooltip>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Penawaran"
            value={stats?.totalQuotations || 0}
            change={stats?.monthlyChange}
            changeType="increase"
            icon={Receipt}
            color="primary"
            loading={quotationsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Nilai"
            value={formatCurrency(stats?.totalValue || 0)}
            change={8.2}
            changeType="increase"
            icon={AttachMoney}
            color="success"
            loading={quotationsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customer"
            value={stats?.totalCustomers || 0}
            change={5.1}
            changeType="increase"
            icon={People}
            color="info"
            loading={customersLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${formatNumber(stats?.conversionRate || 0)}%`}
            change={-2.3}
            changeType="decrease"
            icon={TrendingUp}
            color="warning"
            loading={quotationsLoading}
          />
        </Grid>
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <RecentActivity 
            activities={recentActivities}
            loading={quotationsLoading}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <QuickActions onAction={handleQuickAction} />
        </Grid>
      </Grid>

      {/* Performance Indicators */}
      {stats && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Indikator Performa
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Rata-rata Nilai Penawaran
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(stats.totalQuotations > 0 ? stats.totalValue / stats.totalQuotations : 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Penawaran Bulan Ini
                  </Typography>
                  <Typography variant="h6">
                    {quotations?.filter(q => {
                      const qDate = new Date(q.date);
                      const now = new Date();
                      return qDate.getMonth() === now.getMonth() && qDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Customer Aktif
                  </Typography>
                  <Typography variant="h6">
                    {customers?.filter(c => {
                      // Mock logic for active customers
                      return Math.random() > 0.3;
                    }).length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(EnhancedDashboard); 