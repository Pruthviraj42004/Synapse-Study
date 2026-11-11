import axios from 'axios';

// Define API base URL directly since we can't import from outside src
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// If env already includes '/api', strip it so we don't get '/api/api/...'
if (API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.slice(0, -4);
}

/**
 * Service for code execution using the Docker-based execution API
 */
class CodeExecutionService {
  /**
   * Execute code using Docker-based API
   * @param {string} code - The source code to execute
   * @param {string} language - Programming language
   * @param {string} input - Optional user input
   * @param {string} sessionId - Optional session ID for history tracking
   */
  static async executeCode(code, language, input = '', sessionId = null) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/programming/execute`,
        {
          code,
          language,
          input,
          sessionId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Code execution error:', error);
      return {
        success: false,
        output: null,
        error: error.response?.data?.message || error.message || 'Execution failed',
        executionTime: null,
        memoryUsage: null,
        language
      };
    }
  }

  /**
   * Stop a running code execution
   * @param {string} sessionId - The session ID of the running code
   */
  static async stopExecution(sessionId) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/programming/stop`,
        { sessionId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Stop execution error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to stop execution'
      };
    }
  }

  /**
   * Get execution service health status
   */
  static async getServiceStatus() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/programming/health`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Service health check error:', error);
      return {
        docker: { healthy: false, message: error.message },
        vm2Fallback: true,
        supportedLanguages: ['javascript'],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available languages and their configurations
   */
  static async getLanguages() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/programming/languages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Get languages error:', error);
      // Return a minimal set of languages as fallback
      return {
        languages: [
          { name: 'javascript', displayName: 'JavaScript', extension: 'js' },
          { name: 'python', displayName: 'Python', extension: 'py' },
          { name: 'java', displayName: 'Java', extension: 'java' }
        ],
        defaultLanguage: 'javascript'
      };
    }
  }

  /**
   * Get code templates for various languages
   * @param {string} language - Optional language filter
   */
  static async getCodeTemplates(language = null) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const url = language
        ? `${API_BASE_URL}/api/programming/templates?language=${language}`
        : `${API_BASE_URL}/api/programming/templates`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get templates error:', error);
      return {
        availableLanguages: ['javascript', 'python', 'java'],
        templates: {}
      };
    }
  }
}

export default CodeExecutionService;