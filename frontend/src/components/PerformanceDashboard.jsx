import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const PerformanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, healthResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/health')
      ]);

      if (statsResponse.ok && healthResponse.ok) {
        const statsData = await statsResponse.json();
        const healthData = await healthResponse.json();
        
        setStats(statsData);
        setHealth(healthData);
        setError(null);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'OK':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'OK':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
      case 'unhealthy':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchStats}>
          <RefreshIcon />
        </IconButton>
      }>
        Error loading performance data: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Performance Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Last update: {lastUpdate?.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchStats} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">System Status</Typography>
              </Box>
              <Chip
                label={health?.status || 'Unknown'}
                color={getStatusColor(health?.status)}
                icon={getStatusIcon(health?.status)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Uptime: {health?.uptime || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <StorageIcon color="primary" />
                <Typography variant="h6">Database</Typography>
              </Box>
              <Chip
                label={health?.database?.status || 'Unknown'}
                color={getStatusColor(health?.database?.status)}
                icon={getStatusIcon(health?.database?.status)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Size: {stats?.database?.databaseSize?.toFixed(2) || 'N/A'} MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <SpeedIcon color="secondary" />
                <Typography variant="h6">Cache</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {stats?.cache?.hitRate ? `${(stats.cache.hitRate * 100).toFixed(1)}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hit Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <MemoryIcon color="info" />
                <Typography variant="h6">Memory</Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {health?.memory?.heapUsed || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Heap Used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Database Statistics
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Table</TableCell>
                      <TableCell align="right">Records</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.database && Object.entries(stats.database).map(([table, count]) => (
                      <TableRow key={table}>
                        <TableCell>{table}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Cache Statistics
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Cache Size</Typography>
                  <Typography variant="body2">
                    {stats?.cache?.size || 0} / {stats?.cache?.maxSize || 1000}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((stats?.cache?.size || 0) / (stats?.cache?.maxSize || 1000)) * 100}
                  color="primary"
                />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Memory Usage</Typography>
                  <Typography variant="body2">
                    {formatBytes(stats?.cache?.memoryUsage || 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((stats?.cache?.memoryUsage || 0) / 1024 / 1024, 100)}
                  color="secondary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                System Information
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>{health?.system?.platform}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Node Version</TableCell>
                      <TableCell>{health?.system?.nodeVersion}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Environment</TableCell>
                      <TableCell>{health?.environment}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Process ID</TableCell>
                      <TableCell>{health?.system?.pid}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Response Time</TableCell>
                      <TableCell>{stats?.responseTime}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Log Statistics
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Log Type</TableCell>
                      <TableCell align="right">Entries</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.logs && Object.entries(stats.logs).map(([type, count]) => (
                      <TableRow key={type}>
                        <TableCell>{type}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceDashboard;
