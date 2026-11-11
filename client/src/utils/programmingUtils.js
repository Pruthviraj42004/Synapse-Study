// Utility functions for the programming feature

/**
 * Get file extension from a language ID
 * @param {string} languageId - The language ID (e.g., 'javascript', 'python')
 * @returns {string} - The file extension (e.g., 'js', 'py')
 */
export const getFileExtension = (languageId) => {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb',
    html: 'html',
    css: 'css',
    sql: 'sql',
  };
  
  return extensions[languageId] || 'txt';
};

/**
 * Get language ID from a file extension
 * @param {string} extension - The file extension (e.g., 'js', 'py')
 * @returns {string} - The language ID (e.g., 'javascript', 'python')
 */
export const getLanguageFromExtension = (extension) => {
  const mapping = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'html': 'html',
    'css': 'css',
    'sql': 'sql',
  };
  
  return mapping[extension] || 'text';
};

/**
 * Format code execution time for display
 * @param {number} executionTime - Time in milliseconds
 * @returns {string} - Formatted time string
 */
export const formatExecutionTime = (executionTime) => {
  if (executionTime < 1) {
    return '< 1ms';
  } 
  if (executionTime < 1000) {
    return `${executionTime}ms`;
  }
  return `${(executionTime / 1000).toFixed(2)}s`;
};

/**
 * Format memory usage for display
 * @param {number} memoryBytes - Memory usage in bytes
 * @returns {string} - Formatted memory string
 */
export const formatMemory = (memoryBytes) => {
  if (!memoryBytes) return null;
  
  if (memoryBytes < 1024) {
    return `${memoryBytes} B`;
  } else if (memoryBytes < 1024 * 1024) {
    return `${(memoryBytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(memoryBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

/**
 * Get color code for a programming language
 * @param {string} language - The language ID
 * @returns {string} - Hex color code
 */
export const getLanguageColor = (language) => {
  const colors = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3776ab',
    java: '#ed8b00',
    cpp: '#00599c',
    c: '#a8b9cc',
    csharp: '#239120',
    go: '#00add8',
    rust: '#dea584',
    php: '#777bb4',
    ruby: '#cc342d',
    html: '#e34c26',
    css: '#264de4',
    sql: '#336791'
  };
  
  return colors[language] || '#666666';
};

/**
 * Get programming challenges by difficulty
 * @param {string} difficulty - The difficulty level ('easy', 'medium', 'hard')
 * @param {string} language - The programming language
 * @returns {Array} - Array of challenge objects
 */
export const getChallengesByDifficulty = (difficulty, language) => {
  // This would normally come from an API but we're providing mock data for demo
  const challenges = {
    easy: [
      {
        id: 'e1',
        title: 'FizzBuzz',
        description: 'Write a program that prints the numbers from 1 to 100. But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".',
        difficulty: 'easy',
        languages: ['javascript', 'python', 'java']
      },
      {
        id: 'e2',
        title: 'Reverse a String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters.',
        difficulty: 'easy',
        languages: ['javascript', 'python', 'java', 'c', 'cpp']
      }
    ],
    medium: [
      {
        id: 'm1',
        title: 'Valid Parentheses',
        description: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
        difficulty: 'medium',
        languages: ['javascript', 'python', 'java']
      },
      {
        id: 'm2',
        title: 'Binary Tree Level Order Traversal',
        description: 'Given a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
        difficulty: 'medium',
        languages: ['javascript', 'python', 'java', 'cpp']
      }
    ],
    hard: [
      {
        id: 'h1',
        title: 'Median of Two Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, find the median of the two sorted arrays.',
        difficulty: 'hard',
        languages: ['javascript', 'python', 'java', 'cpp']
      },
      {
        id: 'h2',
        title: 'Regular Expression Matching',
        description: 'Given an input string s and a pattern p, implement regular expression matching with support for "." and "*".',
        difficulty: 'hard',
        languages: ['javascript', 'python', 'java']
      }
    ]
  };
  
  if (!difficulty) {
    // Return all challenges if no difficulty specified
    return [
      ...challenges.easy,
      ...challenges.medium,
      ...challenges.hard
    ].filter(c => !language || c.languages.includes(language));
  }
  
  return (challenges[difficulty] || [])
    .filter(c => !language || c.languages.includes(language));
};

/**
 * Get programming tutorials by level
 * @param {string} level - The tutorial level ('beginner', 'intermediate', 'advanced')
 * @param {string} language - The programming language
 * @returns {Array} - Array of tutorial objects
 */
export const getTutorialsByLevel = (level, language) => {
  // This would normally come from an API but we're providing mock data for demo
  const tutorials = {
    beginner: [
      {
        id: 'b1',
        title: 'Introduction to Programming',
        slug: 'intro-to-programming',
        description: 'Learn the basics of programming concepts like variables, data types, and control flow.',
        level: 'beginner',
        languages: ['javascript', 'python']
      },
      {
        id: 'b2',
        title: 'Getting Started with Functions',
        slug: 'getting-started-with-functions',
        description: 'Understand how to create and use functions to organize and reuse code.',
        level: 'beginner',
        languages: ['javascript', 'python', 'java']
      }
    ],
    intermediate: [
      {
        id: 'i1',
        title: 'Object-Oriented Programming',
        slug: 'object-oriented-programming',
        description: 'Learn about classes, objects, inheritance, and polymorphism.',
        level: 'intermediate',
        languages: ['javascript', 'python', 'java', 'cpp']
      },
      {
        id: 'i2',
        title: 'Data Structures: Arrays and Lists',
        slug: 'data-structures-arrays-lists',
        description: 'Understand how to use arrays and lists to store and manipulate collections of data.',
        level: 'intermediate',
        languages: ['javascript', 'python', 'java', 'cpp']
      }
    ],
    advanced: [
      {
        id: 'a1',
        title: 'Algorithms: Sorting and Searching',
        slug: 'algorithms-sorting-searching',
        description: 'Learn about common sorting and searching algorithms and their implementations.',
        level: 'advanced',
        languages: ['javascript', 'python', 'java', 'cpp']
      },
      {
        id: 'a2',
        title: 'Advanced Data Structures',
        slug: 'advanced-data-structures',
        description: 'Understand complex data structures like trees, graphs, and hash tables.',
        level: 'advanced',
        languages: ['javascript', 'python', 'java', 'cpp']
      }
    ]
  };
  
  if (!level) {
    // Return all tutorials if no level specified
    return [
      ...tutorials.beginner,
      ...tutorials.intermediate,
      ...tutorials.advanced
    ].filter(t => !language || t.languages.includes(language));
  }
  
  return (tutorials[level] || [])
    .filter(t => !language || t.languages.includes(language));
};

/**
 * Generate unique session ID
 * @returns {string} - Unique session ID
 */
export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
};

/**
 * Format date for display
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};