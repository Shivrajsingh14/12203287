import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  Schedule as ScheduleIcon,
  Mouse as MouseIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import apiService from '../services/apiService';
import logger from '../services/evaluationLogger';

interface ClickDetail {
  timestamp: string;
  referrer: string;
  location: string;
}

interface UrlStats {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clickLogs: ClickDetail[];
}

const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<UrlStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    logger.info('component', 'StatisticsPage component mounted');
    logger.logComponentEvent('StatisticsPage', 'mounted');
    fetchUrls();
    
    return () => {
      logger.info('component', 'StatisticsPage component unmounted');
    };
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    setError('');
    
    logger.info('component', 'Fetching URL statistics');
    logger.logUserAction('fetch_statistics');
    
    try {
      // First, get all URLs from the legacy endpoint
      const allUrls = await apiService.getAllUrls();
      logger.info('component', `Retrieved ${allUrls.length} URLs from API`);
      
      // Then fetch detailed statistics for each URL
      const urlsWithStats = await Promise.all(
        allUrls.map(async (url: any) => {
          try {
            logger.debug('component', `Fetching stats for shortcode: ${url.shortcode}`);
            const stats = await apiService.getUrlStats(url.shortcode);
            return stats;
          } catch (error) {
            logger.warn('component', `Failed to fetch stats for ${url.shortcode}, using fallback data`);
            // Fallback to basic data if stats endpoint fails
            return {
              shortcode: url.shortcode || url.shortUrl.split('/').pop(),
              originalUrl: url.originalUrl,
              createdAt: url.createdAt,
              expiresAt: url.expiryDate,
              totalClicks: url.clicks || 0,
              clickLogs: url.clickDetails || []
            };
          }
        })
      );
      
      setUrls(urlsWithStats);
      logger.info('component', `Successfully loaded statistics for ${urlsWithStats.length} URLs`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load URLs';
      logger.error('component', `Failed to fetch URLs: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    logger.logUserAction('copy_url', { url: text });
    logger.debug('component', `URL copied to clipboard: ${text}`);
  };

  const getStatusChip = (url: UrlStats) => {
    const isExpired = new Date() > new Date(url.expiresAt);
    if (isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading URL statistics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={fetchUrls}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (urls.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No URLs found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create some short URLs first to see their statistics here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          URL Statistics
        </Typography>
        <Tooltip title="Refresh statistics">
          <IconButton onClick={fetchUrls} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        View detailed analytics for all your shortened URLs including click statistics and user interaction data.
      </Typography>

      <Stack spacing={3}>
        {urls.map((url) => (
          <Card key={url.shortcode} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" component="div">
                      /{url.shortcode}
                    </Typography>
                    {getStatusChip(url)}
                    <Tooltip title="Copy shortcode">
                      <IconButton size="small" onClick={() => copyToClipboard(url.shortcode)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: 'break-all' }}>
                    <strong>Original URL:</strong> {url.originalUrl}
                    <Tooltip title="Open original URL">
                      <IconButton size="small" onClick={() => window.open(url.originalUrl, '_blank')}>
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Created: {formatDate(url.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Expires: {formatDate(url.expiresAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MouseIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Total Clicks: <strong>{url.totalClicks}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {url.clickLogs.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Click Details ({url.clickLogs.length} clicks)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Timestamp</strong></TableCell>
                            <TableCell><strong>Source</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>User Agent</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {url.clickLogs.map((click: ClickDetail, index: number) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(click.timestamp)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {click.referrer || 'Direct'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {click.location}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    maxWidth: 300, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.75rem'
                                  }}
                                  title={click.referrer || 'Direct'}
                                >
                                  {click.referrer || 'Direct'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              )}

              {url.clickLogs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No clicks recorded yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default StatisticsPage;
