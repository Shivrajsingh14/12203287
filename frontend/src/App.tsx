import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import UrlShortenerPage from './components/UrlShortenerPage';
import StatisticsPage from './components/StatisticsPage';
import logger from './services/evaluationLogger';
import EvaluationSetup from './utils/evaluationSetup';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await EvaluationSetup.initialize();
        await EvaluationSetup.logApplicationStart();
        logger.info('app', 'Application started');
        logger.logComponentEvent('App', 'mounted');
      } catch (error) {
        console.error('Failed to initialize evaluation setup:', error);
        logger.error('app', 'Failed to initialize evaluation setup');
      }
    };

    initializeApp();
    
    return () => {
      EvaluationSetup.logApplicationEnd();
      logger.info('app', 'Application unmounted');
    };
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    logger.logUserAction('tab_change', { from: tabValue, to: newValue });
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <LinkIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              URL Shortener
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="URL shortener tabs">
              <Tab 
                icon={<LinkIcon />} 
                label="URL Shortener" 
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab 
                icon={<AnalyticsIcon />} 
                label="Statistics" 
                id="tab-1"
                aria-controls="tabpanel-1"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <UrlShortenerPage />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <StatisticsPage />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
