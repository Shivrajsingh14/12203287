import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import apiService from '../services/apiService';
import logger from '../services/evaluationLogger';

interface UrlEntry {
  id: string;
  originalUrl: string;
  validity: string;
  shortcode: string;
  result?: {
    shortLink: string;
    expiry: string;
  };
  error?: string;
  loading?: boolean;
}

const UrlShortenerPage: React.FC = () => {
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([
    { id: '1', originalUrl: '', validity: '30', shortcode: '' }
  ]);
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Component initialization logging
  useEffect(() => {
    logger.info('component', 'UrlShortenerPage component mounted');
    logger.logComponentEvent('UrlShortenerPage', 'mounted', { urlEntries: urlEntries.length });
    
    return () => {
      logger.info('component', 'UrlShortenerPage component unmounted');
    };
  }, []);

  const addUrlEntry = () => {
    if (urlEntries.length < 5) {
      logger.logUserAction('add_url_entry', { currentCount: urlEntries.length });
      
      const newEntry: UrlEntry = {
        id: Date.now().toString(),
        originalUrl: '',
        validity: '30',
        shortcode: ''
      };
      setUrlEntries([...urlEntries, newEntry]);
      
      logger.info('component', `URL entry added, total entries: ${urlEntries.length + 1}`);
    } else {
      logger.warn('component', 'Attempt to add URL entry when limit reached');
    }
  };

  const removeUrlEntry = (id: string) => {
    if (urlEntries.length > 1) {
      logger.logUserAction('remove_url_entry', { id, currentCount: urlEntries.length });
      setUrlEntries(urlEntries.filter(entry => entry.id !== id));
      logger.info('component', `URL entry removed, remaining entries: ${urlEntries.length - 1}`);
    } else {
      logger.warn('component', 'Attempt to remove last URL entry');
    }
  };

  const updateUrlEntry = (id: string, field: keyof UrlEntry, value: string) => {
    setUrlEntries(urlEntries.map(entry =>
      entry.id === id ? { ...entry, [field]: value, error: undefined } : entry
    ));
  };

  // Client-side validation
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEntry = (entry: UrlEntry): string | null => {
    if (!entry.originalUrl.trim()) {
      return 'URL is required';
    }
    
    if (!validateUrl(entry.originalUrl)) {
      return 'Please enter a valid URL';
    }
    
    const validity = parseInt(entry.validity);
    if (isNaN(validity) || validity <= 0) {
      return 'Validity must be a positive integer';
    }
    
    if (entry.shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(entry.shortcode)) {
      return 'Shortcode must be alphanumeric and between 3-20 characters';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    setGlobalError('');
    setIsSubmitting(true);
    
    logger.logUserAction('submit_urls', { urlCount: urlEntries.filter(e => e.originalUrl.trim()).length });

    // Validate all entries
    const validationErrors: { [key: string]: string } = {};
    const validEntries = urlEntries.filter(entry => entry.originalUrl.trim());

    if (validEntries.length === 0) {
      logger.warn('component', 'Validation failed: No URLs provided');
      setGlobalError('Please enter at least one URL to shorten');
      setIsSubmitting(false);
      return;
    }

    for (const entry of validEntries) {
      const error = validateEntry(entry);
      if (error) {
        validationErrors[entry.id] = error;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      logger.warn('component', `Validation failed: ${Object.keys(validationErrors).length} errors`);
      setUrlEntries(urlEntries.map(entry => ({
        ...entry,
        error: validationErrors[entry.id]
      })));
      setIsSubmitting(false);
      return;
    }

    logger.info('component', `Processing ${validEntries.length} valid URLs`);

    // Process each valid entry
    const updatedEntries = [...urlEntries];
    
    for (const entry of validEntries) {
      const entryIndex = updatedEntries.findIndex(e => e.id === entry.id);
      updatedEntries[entryIndex] = { ...entry, loading: true };
      setUrlEntries([...updatedEntries]);

      try {
        logger.debug('component', `Processing URL: ${entry.originalUrl}`);
        
        const requestData = {
          url: entry.originalUrl,
          validity: parseInt(entry.validity),
          ...(entry.shortcode.trim() && { shortcode: entry.shortcode.trim() })
        };

        const result = await apiService.createShortUrl(requestData);

        updatedEntries[entryIndex] = {
          ...entry,
          loading: false,
          result: {
            shortLink: result.shortLink,
            expiry: result.expiry
          }
        };
        
        logger.info('component', `URL shortened successfully: ${entry.originalUrl} -> ${result.shortLink}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('component', `Failed to shorten URL ${entry.originalUrl}: ${errorMessage}`);
        
        updatedEntries[entryIndex] = {
          ...entry,
          loading: false,
          error: errorMessage
        };
      }

      setUrlEntries([...updatedEntries]);
    }

    setIsSubmitting(false);
    logger.info('component', 'URL processing completed');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    logger.logUserAction('copy_url', { url: text });
    logger.debug('component', `URL copied to clipboard: ${text}`);
  };

  const formatExpiryDate = (isoString: string): string => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        URL Shortener
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
        Create up to 5 shortened URLs at once. All fields are validated before submission.
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {globalError}
        </Alert>
      )}

      <Card elevation={3}>
        <CardContent>
          {urlEntries.map((entry, index) => (
            <Accordion key={entry.id} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <LinkIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    URL {index + 1}
                  </Typography>
                  {entry.result && (
                    <Chip 
                      label="Completed" 
                      color="success" 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  )}
                  {entry.error && (
                    <Chip 
                      label="Error" 
                      color="error" 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  )}
                  {urlEntries.length > 1 && (
                    <Tooltip title="Remove this URL">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUrlEntry(entry.id);
                        }}
                        size="small"
                        sx={{ ml: 'auto' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Original URL *"
                    placeholder="https://example.com/very-long-url"
                    value={entry.originalUrl}
                    onChange={(e) => updateUrlEntry(entry.id, 'originalUrl', e.target.value)}
                    error={!!entry.error && entry.error.includes('URL')}
                    helperText={entry.error && entry.error.includes('URL') ? entry.error : ''}
                    disabled={entry.loading || !!entry.result}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      sx={{ flex: 1 }}
                      label="Validity (minutes)"
                      type="number"
                      value={entry.validity}
                      onChange={(e) => updateUrlEntry(entry.id, 'validity', e.target.value)}
                      error={!!entry.error && entry.error.includes('Validity')}
                      helperText={entry.error && entry.error.includes('Validity') ? entry.error : 'Default: 30 minutes'}
                      disabled={entry.loading || !!entry.result}
                      inputProps={{ min: 1 }}
                    />
                    
                    <TextField
                      sx={{ flex: 1 }}
                      label="Custom Shortcode (optional)"
                      placeholder="mycode123"
                      value={entry.shortcode}
                      onChange={(e) => updateUrlEntry(entry.id, 'shortcode', e.target.value)}
                      error={!!entry.error && entry.error.includes('Shortcode')}
                      helperText={entry.error && entry.error.includes('Shortcode') ? entry.error : 'Alphanumeric, 3-20 characters'}
                      disabled={entry.loading || !!entry.result}
                    />
                  </Box>
                </Stack>

                {entry.loading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Creating short URL...
                    </Typography>
                  </Box>
                )}

                {entry.result && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="success.dark" gutterBottom>
                      Short URL created successfully!
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                        <strong>Short URL:</strong> {entry.result.shortLink}
                      </Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(entry.result!.shortLink)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Expires:</strong> {formatExpiryDate(entry.result.expiry)}
                    </Typography>
                  </Box>
                )}

                {entry.error && !entry.error.includes('URL') && !entry.error.includes('Validity') && !entry.error.includes('Shortcode') && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {entry.error}
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addUrlEntry}
              disabled={urlEntries.length >= 5 || isSubmitting}
              variant="outlined"
            >
              Add Another URL ({urlEntries.length}/5)
            </Button>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting || urlEntries.every(entry => !entry.originalUrl.trim())}
              sx={{ minWidth: 150 }}
            >
              {isSubmitting ? 'Processing...' : 'Create Short URLs'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UrlShortenerPage;
