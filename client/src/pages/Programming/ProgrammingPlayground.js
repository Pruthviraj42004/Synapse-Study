import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import SplitPane from 'react-split-pane';

import MonacoEditor from '../../components/Programming/CodeEditor/MonacoEditor';
import ExecutionPanel from '../../components/Programming/CodeExecution/ExecutionPanel';
import FileExplorer from '../../components/Programming/CodeEditor/FileExplorer';
import FloatingChatbot from '../../components/Chat/FloatingChatbot/FloatingChatbot';

// Mock API for code execution - will be replaced with real API later
const executeCode = async (code, language) => {
  // Simulate API call with delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response based on language
  switch (language) {
    case 'javascript':
      try {
        // For demo purposes only - NEVER use eval in production
        // This will be replaced with secure server-side execution
        const output = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          output.push(args.join(' '));
        };

        // Using Function constructor instead of eval
        // Still not for production use, just for demo
        new Function(code)();

        console.log = originalConsoleLog;
        return { success: true, output: output.join('\n') };
      } catch (error) {
        return { success: false, error: error.toString() };
      }
    case 'python':
      return {
        success: true,
        output: "Python code execution would happen on the server.\n\n# Output:\nHello World!"
      };
    default:
      return {
        success: true,
        output: `Code execution for ${language} would happen on the server.\n\n# Output simulation:\nHello World!`
      };
  }
};

const ProgrammingPlayground = () => {
  const { user } = useSelector(state => state.auth);
  const editorRef = useRef(null);
  const [files, setFiles] = useState([
    { id: '1', name: 'main.js', language: 'javascript', content: '// JavaScript code\nconsole.log("Hello World!");\n' },
    { id: '2', name: 'styles.css', language: 'css', content: '/* CSS styles */\nbody {\n  font-family: Arial, sans-serif;\n}' },
  ]);
  const [currentFile, setCurrentFile] = useState(files[0]);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleFileSelect = (file) => {
    setCurrentFile(file);
  };

  const handleFileCreate = (fileName) => {
    // Determine language from file extension
    const extension = fileName.split('.').pop().toLowerCase();
    let language = 'text';
    let content = '// New file';

    switch (extension) {
      case 'js':
        language = 'javascript';
        content = '// JavaScript code\n\n';
        break;
      case 'py':
        language = 'python';
        content = '# Python code\n\n';
        break;
      case 'java':
        language = 'java';
        content = '// Java code\n\n';
        break;
      case 'html':
        language = 'html';
        content = '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Page</title>\n</head>\n<body>\n  \n</body>\n</html>';
        break;
      case 'css':
        language = 'css';
        content = '/* CSS styles */\n\n';
        break;
      // Add more language mappings as needed
    }

    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      language,
      content
    };

    setFiles([...files, newFile]);
    setCurrentFile(newFile);
    setNotification({
      open: true,
      message: `File "${fileName}" created successfully`,
      severity: 'success'
    });
  };

  const handleFileDelete = (file) => {
    const updatedFiles = files.filter(f => f.id !== file.id);
    setFiles(updatedFiles);

    // If we deleted the current file, select another one
    if (currentFile.id === file.id) {
      setCurrentFile(updatedFiles.length > 0 ? updatedFiles[0] : null);
    }

    setNotification({
      open: true,
      message: `File "${file.name}" deleted`,
      severity: 'info'
    });
  };

  const handleFileRename = (file, newName) => {
    const updatedFiles = files.map(f => {
      if (f.id === file.id) {
        return { ...f, name: newName };
      }
      return f;
    });

    setFiles(updatedFiles);

    // If we renamed the current file, update the reference
    if (currentFile.id === file.id) {
      setCurrentFile({ ...currentFile, name: newName });
    }

    setNotification({
      open: true,
      message: `File renamed to "${newName}"`,
      severity: 'success'
    });
  };

  const handleCodeChange = (newCode) => {
    // Update the current file content
    setFiles(files.map(file => {
      if (file.id === currentFile.id) {
        return { ...file, content: newCode };
      }
      return file;
    }));

    // Also update the currentFile reference
    setCurrentFile({ ...currentFile, content: newCode });
  };

  const handleRunCode = async () => {
    if (!currentFile) return;

    setIsExecuting(true);
    setError(null);
    setOutput('');

    try {
      const result = await executeCode(currentFile.content, currentFile.language);

      if (result.success) {
        setOutput(result.output);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while executing the code');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveCode = () => {
    // In a real app, this would save to the server
    setNotification({
      open: true,
      message: 'Code saved successfully',
      severity: 'success'
    });
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Helmet>
        <title>Programming Playground - StudySphere</title>
      </Helmet>

      <SplitPane
        split="vertical"
        minSize={200}
        defaultSize={250}
        style={{ position: 'relative' }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <FileExplorer
            files={files}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
          />
        </Box>

        <SplitPane
          split="horizontal"
          minSize={100}
          defaultSize="70%"
          style={{ position: 'relative' }}
        >
          <Box sx={{ height: '100%' }}>
            {currentFile ? (
              <MonacoEditor
                editorRef={editorRef}
                initialLanguage={currentFile.language}
                initialCode={currentFile.content}
                onRun={handleRunCode}
                onSave={handleSaveCode}
                onCodeChange={handleCodeChange}
              />
            ) : (
              <Paper
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 3
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No file selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a new file or select an existing one from the file explorer
                </Typography>
              </Paper>
            )}
          </Box>

          <Box sx={{ height: '100%' }}>
            <ExecutionPanel
              output={output}
              isLoading={isExecuting}
              error={error}
              onClear={() => setOutput('')}
            />
          </Box>
        </SplitPane>
      </SplitPane>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <FloatingChatbot editorRef={editorRef} />
    </Box>
  );
};

export default ProgrammingPlayground;