import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import codeExecutionService from '../services/codeExecutionService';
import programmingService from '../services/programmingService';
import { getTemplateForLanguage } from '../config/codeTemplates';

const ProgrammingContext = createContext();

export const useProgramming = () => {
  const context = useContext(ProgrammingContext);
  if (!context) {
    throw new Error('useProgramming must be used within a ProgrammingProvider');
  }
  return context;
};

export const ProgrammingProvider = ({ children }) => {
  const { user } = useSelector(state => state.auth);

  // State for code editor
  const [currentSession, setCurrentSession] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [editorSettings, setEditorSettings] = useState({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    autoSave: false
  });

  // State for execution
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);

  // State for sessions
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // State for service health
  const [serviceHealth, setServiceHealth] = useState({
    docker: { healthy: false, message: 'Checking...' },
    vm2Fallback: false,
    supportedLanguages: []
  });

  // Check execution service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await codeExecutionService.getServiceStatus();
      setServiceHealth(health);
    } catch (error) {
      console.error('Health check error:', error);
      setServiceHealth({
        docker: { healthy: false, message: error.message || 'Service unavailable' },
        vm2Fallback: true,
        supportedLanguages: ['javascript']
      });
    }
  }, []);

  // Check execution service health on mount (only if user is logged in)
  useEffect(() => {
    if (user) {
      checkServiceHealth();
    }
  }, [user, checkServiceHealth]);

  // Load user's sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const sessionsData = await programmingService.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  // Load a session by ID
  const loadSession = useCallback(async (sessionId) => {
    try {
      const session = await programmingService.getSessionById(sessionId);
      setCurrentSession(session);
      setCode(session.code || '');
      setLanguage(session.language || 'javascript');
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (sessionData) => {
    try {
      const newSession = await programmingService.createSession({
        title: sessionData.title || 'Untitled Session',
        code: sessionData.code || getTemplateForLanguage(sessionData.language || 'javascript'),
        language: sessionData.language || 'javascript'
      });

      setCurrentSession(newSession);
      setCode(newSession.code);
      setLanguage(newSession.language);

      // Refresh sessions list
      fetchSessions();

      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, [fetchSessions]);

  // Update a session
  const updateSession = useCallback(async (sessionId, sessionData) => {
    try {
      const updatedSession = await programmingService.updateSession(sessionId, sessionData);

      if (currentSession && currentSession._id === sessionId) {
        setCurrentSession(updatedSession);
      }

      // Refresh sessions list
      fetchSessions();

      return updatedSession;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }, [currentSession, fetchSessions]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await programmingService.deleteSession(sessionId);

      if (currentSession && currentSession._id === sessionId) {
        setCurrentSession(null);
        setCode(getTemplateForLanguage('javascript'));
        setLanguage('javascript');
      }

      // Refresh sessions list
      fetchSessions();

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }, [currentSession, fetchSessions]);

  // Execute code
  const executeCode = useCallback(async (codeToExecute, languageToUse, options = {}) => {
    setIsExecuting(true);
    setOutput(null);
    setError(null);
    setExecutionTime(null);
    setMemoryUsage(null);

    try {
      const result = await codeExecutionService.executeCode(
        codeToExecute || code,
        languageToUse || language,
        options.input || '',
        currentSession?._id || null
      );

      if (result.success) {
        setOutput(result.output);
        setError(null);
      } else {
        setOutput(result.output);
        setError(result.error);
      }

      setExecutionTime(result.executionTime);
      setMemoryUsage(result.memoryUsage);

      // Add to execution history
      setExecutionHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          language: languageToUse || language,
          output: result.output,
          error: result.error,
          executionTime: result.executionTime,
          memoryUsage: result.memoryUsage
        },
        ...prev.slice(0, 9) // Keep last 10 executions
      ]);

      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      setError(error.message || 'An error occurred during execution');
      return { success: false, error: error.message };
    } finally {
      setIsExecuting(false);
    }
  }, [code, language, currentSession]);

  // Stop code execution
  const stopExecution = useCallback(async () => {
    if (!isExecuting || !currentSession) return;

    try {
      await codeExecutionService.stopExecution(currentSession._id);
      setIsExecuting(false);
      return true;
    } catch (error) {
      console.error('Error stopping execution:', error);
      return false;
    }
  }, [isExecuting, currentSession]);

  // Update editor settings
  const updateEditorSettings = useCallback((newSettings) => {
    setEditorSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Create a new session with template
  const createSessionFromTemplate = useCallback(async (templateLanguage, templateCategory) => {
    try {
      const templates = await codeExecutionService.getCodeTemplates(templateLanguage);
      const templateCode = templates && templates.templates ?
        templates.templates[templateLanguage] :
        getTemplateForLanguage(templateLanguage);

      return createSession({
        title: `${templateLanguage.charAt(0).toUpperCase() + templateLanguage.slice(1)} Session`,
        code: templateCode,
        language: templateLanguage
      });
    } catch (error) {
      console.error('Error creating session from template:', error);

      // Fallback to local template
      return createSession({
        title: `${templateLanguage.charAt(0).toUpperCase() + templateLanguage.slice(1)} Session`,
        code: getTemplateForLanguage(templateLanguage),
        language: templateLanguage
      });
    }
  }, [createSession]);

  // Share a session
  const shareSession = useCallback(async (sessionId, isPublic = true, sharedWith = []) => {
    try {
      const response = await programmingService.updateSession(sessionId, {
        isPublic,
        sharedWith
      });

      // Refresh sessions list
      fetchSessions();

      return response;
    } catch (error) {
      console.error('Error sharing session:', error);
      return null;
    }
  }, [fetchSessions]);

  // Value object with all context methods and state
  const value = {
    // Editor state
    currentSession,
    setCurrentSession,
    code,
    setCode,
    language,
    setLanguage,
    editorSettings,

    // Execution state
    isExecuting,
    output,
    error,
    executionTime,
    memoryUsage,
    executionHistory,

    // Sessions state
    sessions,
    isLoadingSessions,

    // Service health
    serviceHealth,
    checkServiceHealth,

    // Methods
    loadSession,
    createSession,
    updateSession,
    deleteSession,
    executeCode,
    stopExecution,
    updateEditorSettings,
    createSessionFromTemplate,
    shareSession,
    fetchSessions
  };

  return (
    <ProgrammingContext.Provider value={value}>
      {children}
    </ProgrammingContext.Provider>
  );
};

export default ProgrammingContext;