/**
 * Utility for executing code snippets in different programming languages
 * Uses Docker or VM2 for secure execution
 */

const { VM } = require('vm2');
const dockerExecutionService = require('../services/dockerExecutionService');

/**
 * Execute code in a secure environment
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} input - Optional user input for the program
 * @returns {object} - Execution result
 */
const executeCode = async (code, language, input = '') => {
  // Default to JavaScript if language isn't specified
  const lang = (language || 'javascript').toLowerCase();

  // TEMPORARY: Only support JavaScript with VM2 until Docker issue is fixed
  if (lang !== 'javascript') {
    return {
      success: false,
      output: null,
      error: `Currently only JavaScript is supported. Docker execution is temporarily disabled to prevent server crashes. Language requested: ${lang}`,
      executionTime: null,
      memoryUsage: null,
      language: lang
    };
  }

  try {
    // Always use VM2 for JavaScript (Docker temporarily disabled)
    console.log('Executing JavaScript code with VM2 sandbox');
    return await executeJavaScriptFallback(code);
  } catch (err) {
    console.error('Code execution error:', err);

    return {
      success: false,
      output: null,
      error: err.message || 'An error occurred during code execution',
      executionTime: null,
      memoryUsage: null,
      language: lang
    };
  }
};

/**
 * Execute code in Docker container
 */
const executeInDocker = async (code, language, input) => {
  return await dockerExecutionService.executeCode(code, language, input);
};

/**
 * Execute JavaScript using VM2 as fallback when Docker is unavailable
 */
const executeJavaScriptFallback = async (code) => {
  let result = '';
  let error = null;
  const startTime = Date.now();

  try {
    // Set up a secure sandbox with enhanced console
    const vm = new VM({
      timeout: 5000, // 5 seconds timeout
      sandbox: {
        console: {
          log: (...args) => {
            result += args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch (e) {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' ') + '\n';
          },
          error: (...args) => {
            result += 'ERROR: ' + args.map(arg => String(arg)).join(' ') + '\n';
          },
          warn: (...args) => {
            result += 'WARNING: ' + args.map(arg => String(arg)).join(' ') + '\n';
          },
          info: (...args) => {
            result += 'INFO: ' + args.map(arg => String(arg)).join(' ') + '\n';
          },
          debug: (...args) => {
            result += 'DEBUG: ' + args.map(arg => String(arg)).join(' ') + '\n';
          }
        },
        // Add some basic utilities
        Math,
        Date,
        JSON,
        setTimeout: (fn, delay) => {
          if (delay > 1000) delay = 1000; // Max 1 second
          return setTimeout(fn, delay);
        },
        setInterval: (fn, interval) => {
          if (interval < 100) interval = 100; // Min 100ms
          return setInterval(fn, interval);
        }
      }
    });

    // Execute the JavaScript code
    vm.run(code);

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      output: result || 'Code executed successfully (no output)',
      error: null,
      executionTime,
      memoryUsage: null, // VM2 doesn't provide memory stats
      language: 'javascript'
    };

  } catch (err) {
    const executionTime = Date.now() - startTime;

    return {
      success: false,
      output: result,
      error: err.message || 'JavaScript execution failed',
      executionTime,
      memoryUsage: null,
      language: 'javascript'
    };
  }
};

/**
 * Check Docker service health
 */
const checkDockerHealth = async () => {
  try {
    return await dockerExecutionService.checkDockerHealth();
  } catch (err) {
    return { healthy: false, message: err.message };
  }
};

/**
 * Get list of available languages
 */
const getAvailableLanguages = () => {
  return [
    'javascript',
    'python',
    'java',
    'cpp',
    'csharp',
    'ruby',
    'php'
  ];
};

/**
 * Get language configuration
 */
const getLanguageConfig = (language) => {
  const configs = {
    javascript: {
      extension: 'js',
      image: 'node:16-alpine',
      executeCommand: 'node {file}',
      compileCommand: null
    },
    python: {
      extension: 'py',
      image: 'python:3.9-alpine',
      executeCommand: 'python {file}',
      compileCommand: null
    },
    java: {
      extension: 'java',
      image: 'openjdk:17-alpine',
      executeCommand: 'java {file}',
      compileCommand: 'javac {file}.java'
    },
    cpp: {
      extension: 'cpp',
      image: 'gcc:11.2',
      executeCommand: './{file}',
      compileCommand: 'g++ -std=c++17 {file}.cpp -o {file}'
    },
    csharp: {
      extension: 'cs',
      image: 'mcr.microsoft.com/dotnet/sdk:6.0',
      executeCommand: 'dotnet run',
      compileCommand: 'dotnet build'
    },
    ruby: {
      extension: 'rb',
      image: 'ruby:3.1-alpine',
      executeCommand: 'ruby {file}',
      compileCommand: null
    },
    php: {
      extension: 'php',
      image: 'php:8.0-alpine',
      executeCommand: 'php {file}',
      compileCommand: null
    }
  };

  return configs[language] || configs.javascript;
};

module.exports = {
  executeCode,
  checkDockerHealth,
  getAvailableLanguages,
  getLanguageConfig
};