import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  IconButton, 
  Divider,
  Alert,
  Button,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

// Enhanced execution panel with multi-language support and advanced features
const ExecutionPanel = ({ 
  output = null, 
  isLoading = false, 
  error = null,
  language = 'javascript',
  executionTime = null,
  memoryUsage = null,
  onClear,
  onStop,
  onRerun,
  onSaveOutput,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [consoleOutput, setConsoleOutput] = useState(output || '');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const outputRef = useRef(null);

  // Track execution history and update output
  useEffect(() => {
    if (output !== null && output !== consoleOutput) {
      setExecutionHistory(prev => [
        ...prev.slice(-9), // Keep last 10 entries
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          language,
          output: output.slice(0, 100) + (output.length > 100 ? '...' : ''),
          status: error ? 'error' : 'success',
          executionTime,
          memoryUsage
        }
      ]);
      setConsoleOutput(output);
    }
  }, [output, error, language, executionTime, memoryUsage, consoleOutput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(consoleOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    setConsoleOutput('');
    if (onClear) onClear();
  };

  const handleSearch = () => {
    if (searchTerm && outputRef.current) {
      const text = outputRef.current.textContent || '';
      const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (index !== -1) {
        // Highlight found text (simplified implementation)
        console.log(`Found "${searchTerm}" at position ${index}`);
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([consoleOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output_${language}_${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      csharp: '#239120',
      go: '#00add8',
      rust: '#000000',
      php: '#777bb4',
      ruby: '#cc342d',
      typescript: '#3178c6'
    };
    return colors[lang] || '#666';
  };

  const tabs = ['Output', 'History', 'Performance'];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header with tabs and controls */}
      <Box sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          px: 1,
          py: 0.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={language.toUpperCase()} 
              size="small" 
              sx={{ 
                bgcolor: getLanguageColor(language),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            {executionTime && (
              <Chip 
                label={`${executionTime}ms`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
            {memoryUsage && (
              <Chip 
                label={`${memoryUsage}MB`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" onClick={() => setSearchOpen(!searchOpen)} title="Search output">
              <SearchIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDownload} title="Download output">
              <DownloadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onRerun} title="Rerun code" disabled={isLoading}>
              <PlayIcon fontSize="small" />
            </IconButton>
            {isLoading && onStop && (
              <IconButton size="small" onClick={onStop} title="Stop execution" color="error">
                <StopIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} title="More options">
              <SettingsIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onToggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ minHeight: 36 }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab} label={tab} sx={{ minHeight: 36, py: 0.5, fontSize: '0.8rem' }} />
          ))}
        </Tabs>

        {/* Search bar */}
        {searchOpen && (
          <Box sx={{ p: 1, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search in output..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleSearch}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Box>
        )}

        {/* Progress bar for loading */}
        {isLoading && (
          <LinearProgress sx={{ height: 2 }} />
        )}
      </Box>
      
      {/* Content area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Output Tab */}
        {activeTab === 0 && (
          <Box 
            ref={outputRef}
            sx={{ 
              height: '100%',
              overflow: 'auto', 
              p: 1,
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: '0.875rem',
              bgcolor: 'background.paper',
              position: 'relative',
              whiteSpace: 'pre-wrap'
            }}
          >
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                gap: 2
              }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">
                  Executing {language} code...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This may take a few seconds
                </Typography>
              </Box>
            ) : error ? (
              <Box>
                <Alert severity="error" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Execution Error</Typography>
                </Alert>
                <pre style={{ 
                  margin: 0, 
                  color: '#d32f2f',
                  backgroundColor: '#ffebee',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ffcdd2'
                }}>{error}</pre>
              </Box>
            ) : consoleOutput ? (
              <pre style={{ margin: 0, lineHeight: 1.6 }}>{consoleOutput}</pre>
            ) : (
              <Box sx={{ 
                color: 'text.secondary', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1
              }}>
                <PlayIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2">
                  Run your {language} code to see output here
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Press Ctrl+Enter or click the Run button
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* History Tab */}
        {activeTab === 1 && (
          <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
            {executionHistory.length > 0 ? (
              executionHistory.map((item, index) => (
                <Paper key={item.id} elevation={1} sx={{ p: 1, mb: 1, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={item.language} 
                        size="small" 
                        sx={{ bgcolor: getLanguageColor(item.language), color: 'white', fontSize: '0.6rem' }}
                      />
                      <Typography variant="caption">{item.timestamp}</Typography>
                    </Box>
                    <Chip 
                      label={item.status} 
                      size="small" 
                      color={item.status === 'success' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {item.output}
                  </Typography>
                  {item.executionTime && (
                    <Typography variant="caption" color="text.secondary">
                      Executed in {item.executionTime}ms
                    </Typography>
                  )}
                </Paper>
              ))
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary'
              }}>
                <Typography variant="body2">No execution history</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {executionTime && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Execution Time</Typography>
                  <Typography variant="h4" color="primary">{executionTime}ms</Typography>
                </Box>
              )}
              {memoryUsage && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Memory Usage</Typography>
                  <Typography variant="h4" color="secondary">{memoryUsage}MB</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">Output Length</Typography>
                <Typography variant="h4">{consoleOutput.length} chars</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Copy success notification */}
        {copied && (
          <Alert 
            severity="success" 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              boxShadow: 3,
              zIndex: 1000
            }}
          >
            Output copied to clipboard!
          </Alert>
        )}
      </Box>

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { handleCopy(); setMenuAnchor(null); }}>
          <CopyIcon sx={{ mr: 1, fontSize: 16 }} />
          Copy Output
        </MenuItem>
        <MenuItem onClick={() => { handleClear(); setMenuAnchor(null); }}>
          <ClearIcon sx={{ mr: 1, fontSize: 16 }} />
          Clear Console
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleDownload(); setMenuAnchor(null); }}>
          <DownloadIcon sx={{ mr: 1, fontSize: 16 }} />
          Save Output
        </MenuItem>
        <MenuItem onClick={() => { setSettingsOpen(true); setMenuAnchor(null); }}>
          <SettingsIcon sx={{ mr: 1, fontSize: 16 }} />
          Settings
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Output Panel Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure how the output panel displays execution results.
          </Typography>
          {/* Add settings options here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ExecutionPanel;