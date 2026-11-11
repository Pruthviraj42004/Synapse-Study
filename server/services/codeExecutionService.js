const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Timeout for code execution (10 seconds)
const EXECUTION_TIMEOUT = 10000;

// Maximum output size (1MB)
const MAX_OUTPUT_SIZE = 1024 * 1024;

/**
 * Execute JavaScript code using Node.js
 */
const executeJavaScript = (code, input = '') => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    const tempDir = path.join(__dirname, '../../temp');
    const fileName = `${uuidv4()}.js`;
    const filePath = path.join(tempDir, fileName);
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write code to temporary file
      await fs.writeFile(filePath, code);
      
      // Execute the code
      const process = spawn('node', [filePath], {
        timeout: EXECUTION_TIMEOUT
      });
      
      let output = '';
      let errorOutput = '';
      
      // Send input if provided
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
      
      // Capture stdout
      process.stdout.on('data', (data) => {
        output += data.toString();
        if (output.length > MAX_OUTPUT_SIZE) {
          process.kill();
          reject(new Error('Output size exceeded maximum limit'));
        }
      });
      
      // Capture stderr
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Handle process completion
      process.on('close', async (code) => {
        const executionTime = Date.now() - startTime;
        
        // Clean up temporary file
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
        
        if (code === 0) {
          resolve({
            output: output || 'Program executed successfully (no output)',
            error: null,
            executionTime,
            memoryUsage: null
          });
        } else {
          resolve({
            output: output,
            error: errorOutput || `Process exited with code ${code}`,
            executionTime,
            memoryUsage: null
          });
        }
      });
      
      // Handle timeout
      process.on('error', async (err) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
        reject(new Error(`Execution error: ${err.message}`));
      });
      
    } catch (error) {
      reject(new Error(`Setup error: ${error.message}`));
    }
  });
};

/**
 * Execute Python code using Python 3
 */
const executePython = (code, input = '') => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    const tempDir = path.join(__dirname, '../../temp');
    const fileName = `${uuidv4()}.py`;
    const filePath = path.join(tempDir, fileName);
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write code to temporary file
      await fs.writeFile(filePath, code);
      
      // Try python3 first, fallback to python
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      
      // Execute the code
      const process = spawn(pythonCmd, [filePath], {
        timeout: EXECUTION_TIMEOUT
      });
      
      let output = '';
      let errorOutput = '';
      
      // Send input if provided
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
      
      // Capture stdout
      process.stdout.on('data', (data) => {
        output += data.toString();
        if (output.length > MAX_OUTPUT_SIZE) {
          process.kill();
          reject(new Error('Output size exceeded maximum limit'));
        }
      });
      
      // Capture stderr
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Handle process completion
      process.on('close', async (code) => {
        const executionTime = Date.now() - startTime;
        
        // Clean up temporary file
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
        
        if (code === 0) {
          resolve({
            output: output || 'Program executed successfully (no output)',
            error: null,
            executionTime,
            memoryUsage: null
          });
        } else {
          resolve({
            output: output,
            error: errorOutput || `Process exited with code ${code}`,
            executionTime,
            memoryUsage: null
          });
        }
      });
      
      // Handle timeout
      process.on('error', async (err) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
        
        if (err.code === 'ENOENT') {
          reject(new Error('Python is not installed or not in PATH'));
        } else {
          reject(new Error(`Execution error: ${err.message}`));
        }
      });
      
    } catch (error) {
      reject(new Error(`Setup error: ${error.message}`));
    }
  });
};

/**
 * Execute C++ code using g++
 */
const executeCpp = (code, input = '') => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    const tempDir = path.join(__dirname, '../../temp');
    const fileName = `${uuidv4()}.cpp`;
    const filePath = path.join(tempDir, fileName);
    const outputPath = path.join(tempDir, `${path.parse(fileName).name}`);
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write code to temporary file
      await fs.writeFile(filePath, code);
      
      // Compile the code
      const compileProcess = spawn('g++', [filePath, '-o', outputPath], {
        timeout: EXECUTION_TIMEOUT
      });
      
      let compileError = '';
      
      compileProcess.stderr.on('data', (data) => {
        compileError += data.toString();
      });
      
      compileProcess.on('close', async (compileCode) => {
        if (compileCode !== 0) {
          // Compilation failed
          try {
            await fs.unlink(filePath);
          } catch (e) {}
          
          resolve({
            output: '',
            error: `Compilation failed:\n${compileError}`,
            executionTime: Date.now() - startTime,
            memoryUsage: null
          });
          return;
        }
        
        // Execute the compiled code
        const execPath = process.platform === 'win32' ? `${outputPath}.exe` : outputPath;
        const execProcess = spawn(execPath, [], {
          timeout: EXECUTION_TIMEOUT
        });
        
        let output = '';
        let errorOutput = '';
        
        // Send input if provided
        if (input) {
          execProcess.stdin.write(input);
          execProcess.stdin.end();
        }
        
        // Capture stdout
        execProcess.stdout.on('data', (data) => {
          output += data.toString();
          if (output.length > MAX_OUTPUT_SIZE) {
            execProcess.kill();
          }
        });
        
        // Capture stderr
        execProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        // Handle process completion
        execProcess.on('close', async (code) => {
          const executionTime = Date.now() - startTime;
          
          // Clean up temporary files
          try {
            await fs.unlink(filePath);
            await fs.unlink(execPath);
          } catch (e) {
            console.error('Error deleting temp files:', e);
          }
          
          if (code === 0) {
            resolve({
              output: output || 'Program executed successfully (no output)',
              error: null,
              executionTime,
              memoryUsage: null
            });
          } else {
            resolve({
              output: output,
              error: errorOutput || `Process exited with code ${code}`,
              executionTime,
              memoryUsage: null
            });
          }
        });
        
        execProcess.on('error', async (err) => {
          try {
            await fs.unlink(filePath);
            await fs.unlink(execPath);
          } catch (e) {}
          reject(new Error(`Execution error: ${err.message}`));
        });
      });
      
      compileProcess.on('error', async (err) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {}
        
        if (err.code === 'ENOENT') {
          reject(new Error('g++ is not installed or not in PATH'));
        } else {
          reject(new Error(`Compilation error: ${err.message}`));
        }
      });
      
    } catch (error) {
      reject(new Error(`Setup error: ${error.message}`));
    }
  });
};

/**
 * Execute C code using gcc
 */
const executeC = (code, input = '') => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    const tempDir = path.join(__dirname, '../../temp');
    const fileName = `${uuidv4()}.c`;
    const filePath = path.join(tempDir, fileName);
    const outputPath = path.join(tempDir, `${path.parse(fileName).name}`);
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write code to temporary file
      await fs.writeFile(filePath, code);
      
      // Compile the code
      const compileProcess = spawn('gcc', [filePath, '-o', outputPath], {
        timeout: EXECUTION_TIMEOUT
      });
      
      let compileError = '';
      
      compileProcess.stderr.on('data', (data) => {
        compileError += data.toString();
      });
      
      compileProcess.on('close', async (compileCode) => {
        if (compileCode !== 0) {
          // Compilation failed
          try {
            await fs.unlink(filePath);
          } catch (e) {}
          
          resolve({
            output: '',
            error: `Compilation failed:\n${compileError}`,
            executionTime: Date.now() - startTime,
            memoryUsage: null
          });
          return;
        }
        
        // Execute the compiled code
        const execPath = process.platform === 'win32' ? `${outputPath}.exe` : outputPath;
        const execProcess = spawn(execPath, [], {
          timeout: EXECUTION_TIMEOUT
        });
        
        let output = '';
        let errorOutput = '';
        
        // Send input if provided
        if (input) {
          execProcess.stdin.write(input);
          execProcess.stdin.end();
        }
        
        // Capture stdout
        execProcess.stdout.on('data', (data) => {
          output += data.toString();
          if (output.length > MAX_OUTPUT_SIZE) {
            execProcess.kill();
          }
        });
        
        // Capture stderr
        execProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        // Handle process completion
        execProcess.on('close', async (code) => {
          const executionTime = Date.now() - startTime;
          
          // Clean up temporary files
          try {
            await fs.unlink(filePath);
            await fs.unlink(execPath);
          } catch (e) {
            console.error('Error deleting temp files:', e);
          }
          
          if (code === 0) {
            resolve({
              output: output || 'Program executed successfully (no output)',
              error: null,
              executionTime,
              memoryUsage: null
            });
          } else {
            resolve({
              output: output,
              error: errorOutput || `Process exited with code ${code}`,
              executionTime,
              memoryUsage: null
            });
          }
        });
        
        execProcess.on('error', async (err) => {
          try {
            await fs.unlink(filePath);
            await fs.unlink(execPath);
          } catch (e) {}
          reject(new Error(`Execution error: ${err.message}`));
        });
      });
      
      compileProcess.on('error', async (err) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {}
        
        if (err.code === 'ENOENT') {
          reject(new Error('gcc is not installed or not in PATH'));
        } else {
          reject(new Error(`Compilation error: ${err.message}`));
        }
      });
      
    } catch (error) {
      reject(new Error(`Setup error: ${error.message}`));
    }
  });
};

/**
 * Execute code in the specified language
 * @param {string} code - The code to execute
 * @param {string} language - The programming language (javascript, python, cpp, c, etc.)
 * @param {string} input - Optional stdin input for the program
 * @returns {Promise} - A promise that resolves with the execution result
 */
const executeCode = async (code, language, input = '') => {
  // Validate input
  if (!code || code.trim() === '') {
    throw new Error('Code is required');
  }
  
  if (!language) {
    throw new Error('Language is required');
  }
  
  try {
    // Execute code based on language
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return await executeJavaScript(code, input);
      
      case 'python':
      case 'py':
        return await executePython(code, input);
      
      case 'cpp':
      case 'c++':
        return await executeCpp(code, input);
      
      case 'c':
        return await executeC(code, input);
      
      default:
        return {
          output: '',
          error: `Language '${language}' is not supported yet. Supported languages: JavaScript, Python, C++, C`,
          executionTime: 0,
          memoryUsage: null
        };
    }
  } catch (error) {
    return {
      output: '',
      error: error.message,
      executionTime: 0,
      memoryUsage: null
    };
  }
};

module.exports = {
  executeCode
};