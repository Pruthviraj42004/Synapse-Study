const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const tmp = require('tmp');

class DockerExecutionService {
  constructor() {
    this.docker = new Docker();
    this.maxExecutionTime = 30000; // 30 seconds max
    this.maxMemory = 128 * 1024 * 1024; // 128MB max
    this.tempDir = tmp.dirSync({ unsafeCleanup: true });

    // Language configurations with Docker images and execution commands
    this.languageConfigs = {
      javascript: {
        image: 'node:18-alpine',
        extension: 'js',
        command: ['node'],
        setup: null
      },
      typescript: {
        image: 'node:18-alpine',
        extension: 'ts',
        command: ['npx', 'ts-node'],
        setup: 'npm install -g typescript ts-node'
      },
      python: {
        image: 'python:3.11-alpine',
        extension: 'py',
        command: ['python'],
        setup: null
      },
      java: {
        image: 'openjdk:17-alpine',
        extension: 'java',
        command: ['sh', '-c'],
        compileCommand: 'javac Main.java && java Main',
        setup: null
      },
      cpp: {
        image: 'gcc:latest',
        extension: 'cpp',
        command: ['sh', '-c'],
        compileCommand: 'g++ -o main main.cpp && ./main',
        setup: null
      },
      c: {
        image: 'gcc:latest',
        extension: 'c',
        command: ['sh', '-c'],
        compileCommand: 'gcc -o main main.c && ./main',
        setup: null
      },
      csharp: {
        image: 'mcr.microsoft.com/dotnet/sdk:7.0',
        extension: 'cs',
        command: ['sh', '-c'],
        compileCommand: 'dotnet new console --force && cp Program.cs Program.cs.bak && mv main.cs Program.cs && dotnet run',
        setup: null
      },
      go: {
        image: 'golang:1.21-alpine',
        extension: 'go',
        command: ['go', 'run'],
        setup: null
      },
      rust: {
        image: 'rust:1.75-alpine',
        extension: 'rs',
        command: ['sh', '-c'],
        compileCommand: 'rustc main.rs && ./main',
        setup: null
      },
      php: {
        image: 'php:8.2-alpine',
        extension: 'php',
        command: ['php'],
        setup: null
      },
      ruby: {
        image: 'ruby:3.2-alpine',
        extension: 'rb',
        command: ['ruby'],
        setup: null
      }
    };
  }

  /**
   * Execute code in a Docker container
   */
  async executeCode(code, language = 'javascript', input = '') {
    const startTime = Date.now();
    let container = null;
    let tempFilePath = null;

    try {
      // Validate language
      const config = this.languageConfigs[language.toLowerCase()];
      if (!config) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Create temporary file with code
      tempFilePath = await this.createTempFile(code, config, language);

      // Pull Docker image if not exists
      await this.ensureDockerImage(config.image);

      // Create and run container
      const result = await this.runContainer(config, tempFilePath, input);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output: result.output,
        error: result.error,
        executionTime,
        memoryUsage: result.memoryUsage,
        language
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        output: null,
        error: error.message || 'Execution failed',
        executionTime,
        memoryUsage: null,
        language
      };
    } finally {
      // Cleanup
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (err) {
          console.error('Container cleanup error:', err.message);
        }
      }

      if (tempFilePath) {
        try {
          await fs.remove(tempFilePath);
        } catch (err) {
          console.error('Temp file cleanup error:', err.message);
        }
      }
    }
  }

  /**
   * Create temporary file with the code
   */
  async createTempFile(code, config, language) {
    const executionId = uuidv4();
    const fileName = language === 'java' ? 'Main' : 'main';
    const fullFileName = `${fileName}.${config.extension}`;
    const tempDir = path.join(this.tempDir.name, executionId);

    await fs.ensureDir(tempDir);

    const filePath = path.join(tempDir, fullFileName);

    // Handle Java class name replacement
    if (language === 'java') {
      code = code.replace(/public\s+class\s+\w+/g, 'public class Main');
    }

    await fs.writeFile(filePath, code, 'utf8');

    return tempDir;
  }

  /**
   * Ensure Docker image is available
   */
  async ensureDockerImage(imageName) {
    try {
      await this.docker.getImage(imageName).inspect();
      // Image exists, all good
    } catch (error) {
      if (error.statusCode === 404) {
        // Image not found - throw error instead of trying to pull
        // This prevents the docker-modem stdout.write crash
        throw new Error(`Docker image '${imageName}' not found. Please pull it manually: docker pull ${imageName}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Run code in Docker container
   */
  async runContainer(config, codePath, input = '') {
    const containerName = `code-execution-${uuidv4()}`;

    // Prepare command
    let cmd;
    if (config.compileCommand) {
      cmd = ['sh', '-c', config.compileCommand];
    } else {
      const fileName = config.extension === 'java' ? 'Main' : 'main';
      cmd = [...config.command, `${fileName}.${config.extension}`];
    }

    // Container configuration
    const containerConfig = {
      Image: config.image,
      Cmd: cmd,
      WorkingDir: '/app',
      HostConfig: {
        Memory: this.maxMemory,
        CpuQuota: 50000, // Limit CPU usage
        NetworkMode: 'none', // No network access
        ReadonlyRootfs: false,
        Binds: [`${codePath}:/app:ro`], // Mount code directory as read-only
        AutoRemove: false
      },
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: !!input,
      OpenStdin: !!input,
      StdinOnce: !!input,
      Tty: false,
      name: containerName
    };

    // Create container
    const container = await this.docker.createContainer(containerConfig);

    // Start container and get stream
    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
      stdin: !!input
    });

    // Start the container
    await container.start();

    // Send input if provided
    if (input) {
      stream.write(input);
      stream.end();
    }

    // Collect output with timeout
    const result = await this.collectOutput(container, stream);

    // Get container stats for memory usage
    let memoryUsage = null;
    try {
      const stats = await container.stats({ stream: false });
      memoryUsage = Math.round(stats.memory_stats.usage / 1024 / 1024); // Convert to MB
    } catch (err) {
      // Stats might not be available, that's okay
    }

    return {
      output: result.stdout,
      error: result.stderr,
      memoryUsage
    };
  }

  /**
   * Collect output from container with timeout
   */
  async collectOutput(container, stream) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let isResolved = false;

      // Set timeout
      const timeout = setTimeout(async () => {
        if (!isResolved) {
          isResolved = true;
          try {
            await container.kill();
          } catch (err) {
            // Container might already be stopped
          }
          resolve({
            stdout: stdout || '',
            stderr: stderr + '\nExecution timed out after 30 seconds'
          });
        }
      }, this.maxExecutionTime);

      // Handle container output
      this.docker.modem.demuxStream(stream,
        // stdout
        (chunk) => {
          stdout += chunk.toString();
        },
        // stderr  
        (chunk) => {
          stderr += chunk.toString();
        }
      );

      // Handle stream end
      stream.on('end', () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve({ stdout, stderr });
        }
      });

      // Handle errors
      stream.on('error', (err) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          reject(err);
        }
      });

      // Monitor container state
      container.wait((err, data) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          if (err) {
            reject(err);
          } else {
            resolve({ stdout, stderr });
          }
        }
      });
    });
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.languageConfigs);
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(language) {
    return this.languageConfigs[language.toLowerCase()];
  }

  /**
   * Check Docker daemon availability
   */
  async checkDockerHealth() {
    try {
      await this.docker.ping();
      return { healthy: true, message: 'Docker daemon is running' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // Remove temp directory
      if (this.tempDir) {
        this.tempDir.removeCallback();
      }

      // Remove dangling containers
      const containers = await this.docker.listContainers({
        all: true,
        filters: { name: ['code-execution-'] }
      });

      for (const containerInfo of containers) {
        try {
          const container = this.docker.getContainer(containerInfo.Id);
          await container.remove({ force: true });
        } catch (err) {
          console.error('Container cleanup error:', err.message);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }
}

// Create singleton instance
const dockerExecutionService = new DockerExecutionService();

// Cleanup on process exit
process.on('SIGTERM', () => dockerExecutionService.cleanup());
process.on('SIGINT', () => dockerExecutionService.cleanup());

module.exports = dockerExecutionService;