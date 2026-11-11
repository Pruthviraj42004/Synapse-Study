// API base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// WebSocket URL
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

// Programming language configurations
export const LANGUAGE_CONFIGS = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    monacoLanguage: 'javascript',
    runner: 'node',
    dockerImage: 'node:18-alpine'
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    monacoLanguage: 'typescript',
    runner: 'ts-node',
    dockerImage: 'node:18-alpine'
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: 'py',
    monacoLanguage: 'python',
    runner: 'python3',
    dockerImage: 'python:3.11-alpine'
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: 'java',
    monacoLanguage: 'java',
    runner: 'javac',
    dockerImage: 'openjdk:17-alpine',
    compileFirst: true
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    monacoLanguage: 'csharp',
    runner: 'dotnet',
    dockerImage: 'mcr.microsoft.com/dotnet/sdk:7.0'
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    monacoLanguage: 'cpp',
    runner: 'g++',
    dockerImage: 'gcc:latest',
    compileFirst: true
  },
  c: {
    id: 'c',
    name: 'C',
    extension: 'c',
    monacoLanguage: 'c',
    runner: 'gcc',
    dockerImage: 'gcc:latest',
    compileFirst: true
  },
  go: {
    id: 'go',
    name: 'Go',
    extension: 'go',
    monacoLanguage: 'go',
    runner: 'go',
    dockerImage: 'golang:1.21-alpine'
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    monacoLanguage: 'rust',
    runner: 'rustc',
    dockerImage: 'rust:1.70-alpine',
    compileFirst: true
  },
  php: {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    monacoLanguage: 'php',
    runner: 'php',
    dockerImage: 'php:8.2-alpine'
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    monacoLanguage: 'ruby',
    runner: 'ruby',
    dockerImage: 'ruby:3.2-alpine'
  },
  html: {
    id: 'html',
    name: 'HTML',
    extension: 'html',
    monacoLanguage: 'html',
    runner: 'browser',
    dockerImage: null
  },
  css: {
    id: 'css',
    name: 'CSS',
    extension: 'css',
    monacoLanguage: 'css',
    runner: 'browser',
    dockerImage: null
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    monacoLanguage: 'sql',
    runner: 'sqlite3',
    dockerImage: 'alpine/sqlite'
  }
};