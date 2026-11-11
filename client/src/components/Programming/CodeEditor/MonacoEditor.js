import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { setEditor } from '../../../services/editorContextService';
import { 
  Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, 
  Paper, IconButton, Tooltip, Avatar, AvatarGroup
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  Settings as SettingsIcon,
  PlayArrow as RunIcon,
  Save as SaveIcon,
  People as PeopleIcon
} from '@mui/icons-material';
// Y is used internally by MonacoBinding for CRDT operations
// eslint-disable-next-line no-unused-vars
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { yjsProviderService } from '../../../services/yjsProvider';

const LANGUAGE_CONFIGS = {
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

const languageOptions = Object.values(LANGUAGE_CONFIGS);

const defaultCode = {
  javascript: `// JavaScript Programming Environment
console.log("Welcome to StudySphere Programming!");

// Example: Fibonacci sequence
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// Example: Array manipulation
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Original:", numbers);
console.log("Doubled:", doubled);`,

  typescript: `// TypeScript Programming Environment
interface Person {
  name: string;
  age: number;
}

const greeting = (person: Person): string => {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
};

const user: Person = { name: "Alice", age: 30 };
console.log(greeting(user));

// Generic function example
function identity<T>(arg: T): T {
  return arg;
}

console.log(identity<string>("TypeScript"));
console.log(identity<number>(42));`,

  python: `# Python Programming Environment
print("Welcome to StudySphere Programming!")

# Example: Fibonacci sequence
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# Example: List comprehension
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(f"Original: {numbers}")
print(f"Squared: {squared}")

# Example: Class definition
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"Hi, I'm {self.name} and I'm {self.age} years old."

student = Student("Bob", 20)
print(student.introduce())`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to StudySphere Programming!");
        
        // Example: Fibonacci sequence
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
        
        // Example: Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println("Original array:");
        printArray(numbers);
        
        int[] doubled = doubleArray(numbers);
        System.out.println("Doubled array:");
        printArray(doubled);
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static int[] doubleArray(int[] arr) {
        int[] result = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            result[i] = arr[i] * 2;
        }
        return result;
    }
    
    public static void printArray(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
    }
}`,

  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Welcome to StudySphere Programming!" << endl;
    
    // Example: Fibonacci sequence
    cout << "Fibonacci sequence:" << endl;
    for (int i = 0; i < 10; i++) {
        cout << "F(" << i << ") = " << fibonacci(i) << endl;
    }
    
    // Example: Vector operations
    vector<int> numbers = {1, 2, 3, 4, 5};
    vector<int> doubled(numbers.size());
    
    transform(numbers.begin(), numbers.end(), doubled.begin(), 
              [](int n) { return n * 2; });
    
    cout << "Original: ";
    for (int n : numbers) cout << n << " ";
    cout << endl;
    
    cout << "Doubled: ";
    for (int n : doubled) cout << n << " ";
    cout << endl;
    
    return 0;
}`,

  c: `#include <stdio.h>
#include <stdlib.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

void printArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

int main() {
    printf("Welcome to StudySphere Programming!\\n");
    
    // Example: Fibonacci sequence
    printf("Fibonacci sequence:\\n");
    for (int i = 0; i < 10; i++) {
        printf("F(%d) = %d\\n", i, fibonacci(i));
    }
    
    // Example: Array operations
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Original array: ");
    printArray(numbers, size);
    
    // Double the array elements
    for (int i = 0; i < size; i++) {
        numbers[i] *= 2;
    }
    
    printf("Doubled array: ");
    printArray(numbers, size);
    
    return 0;
}`,

  go: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Welcome to StudySphere Programming!")
    
    // Example: Fibonacci sequence
    fmt.Println("Fibonacci sequence:")
    for i := 0; i < 10; i++ {
        fmt.Printf("F(%d) = %d\\n", i, fibonacci(i))
    }
    
    // Example: Slice operations
    numbers := []int{1, 2, 3, 4, 5}
    doubled := make([]int, len(numbers))
    
    for i, n := range numbers {
        doubled[i] = n * 2
    }
    
    fmt.Printf("Original: %v\\n", numbers)
    fmt.Printf("Doubled: %v\\n", doubled)
}`,

  rust: `fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    println!("Welcome to StudySphere Programming!");
    
    // Example: Fibonacci sequence
    println!("Fibonacci sequence:");
    for i in 0..10 {
        println!("F({}) = {}", i, fibonacci(i));
    }
    
    // Example: Vector operations
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    
    println!("Original: {:?}", numbers);
    println!("Doubled: {:?}", doubled);
}`,

  php: `<?php
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "Welcome to StudySphere Programming!\\n";

// Example: Fibonacci sequence
echo "Fibonacci sequence:\\n";
for ($i = 0; $i < 10; $i++) {
    echo "F($i) = " . fibonacci($i) . "\\n";
}

// Example: Array operations
$numbers = [1, 2, 3, 4, 5];
$doubled = array_map(function($n) { return $n * 2; }, $numbers);

echo "Original: " . implode(", ", $numbers) . "\\n";
echo "Doubled: " . implode(", ", $doubled) . "\\n";

// Example: Class definition
class Student {
    private $name;
    private $age;
    
    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }
    
    public function introduce() {
        return "Hi, I'm {$this->name} and I'm {$this->age} years old.";
    }
}

$student = new Student("Alice", 22);
echo $student->introduce() . "\\n";
?>`,

  ruby: `def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

puts "Welcome to StudySphere Programming!"

# Example: Fibonacci sequence
puts "Fibonacci sequence:"
(0...10).each do |i|
  puts "F(#{i}) = #{fibonacci(i)}"
end

# Example: Array operations
numbers = [1, 2, 3, 4, 5]
doubled = numbers.map { |n| n * 2 }

puts "Original: #{numbers}"
puts "Doubled: #{doubled}"

# Example: Class definition
class Student
  attr_reader :name, :age
  
  def initialize(name, age)
    @name = name
    @age = age
  end
  
  def introduce
    "Hi, I'm #{@name} and I'm #{@age} years old."
  end
end

student = Student.new("Bob", 21)
puts student.introduce`,

  csharp: `using System;
using System.Linq;

class Program {
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
    
    static void Main() {
        Console.WriteLine("Welcome to StudySphere Programming!");
        
        // Example: Fibonacci sequence
        Console.WriteLine("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            Console.WriteLine($"F({i}) = {Fibonacci(i)}");
        }
        
        // Example: LINQ operations
        int[] numbers = {1, 2, 3, 4, 5};
        var doubled = numbers.Select(n => n * 2).ToArray();
        
        Console.WriteLine($"Original: [{string.Join(", ", numbers)}]");
        Console.WriteLine($"Doubled: [{string.Join(", ", doubled)}]");
    }
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudySphere Programming</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { text-align: center; margin-bottom: 30px; }
        .feature { margin: 20px 0; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; }
        button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to StudySphere Programming!</h1>
        
        <div class="feature">
            <h3>📝 Interactive Code Editor</h3>
            <p>Write code in 10+ programming languages with syntax highlighting and auto-completion.</p>
        </div>
        
        <div class="feature">
            <h3>🤝 Real-time Collaboration</h3>
            <p>Code together with your classmates in real-time collaborative sessions.</p>
        </div>
        
        <div class="feature">
            <h3>🏃‍♂️ Instant Code Execution</h3>
            <p>Run your code instantly with our secure sandboxed execution environment.</p>
        </div>
        
        <div class="feature">
            <h3>📚 Learning Tutorials</h3>
            <p>Follow interactive programming tutorials and challenges.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="alert('Start coding now!')">Get Started</button>
            <button onclick="alert('Join a programming room!')">Join Room</button>
        </div>
    </div>
    
    <script>
        console.log("StudySphere Programming Platform Loaded!");
        
        // Example JavaScript functionality
        document.addEventListener('DOMContentLoaded', function() {
            const features = document.querySelectorAll('.feature');
            features.forEach((feature, index) => {
                feature.style.opacity = '0';
                feature.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    feature.style.transition = 'all 0.5s ease';
                    feature.style.opacity = '1';
                    feature.style.transform = 'translateY(0)';
                }, index * 200);
            });
        });
    </script>
</body>
</html>`,

  css: `/* StudySphere Programming - CSS Styling Example */

/* Modern CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* CSS Variables for theming */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #4CAF50;
  --background-light: #f8f9fa;
  --background-dark: #2c3e50;
  --text-light: #333;
  --text-dark: #fff;
  --border-radius: 8px;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Modern gradient background */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  min-height: 100vh;
  color: var(--text-dark);
}

/* Container with glassmorphism effect */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

/* Typography */
h1, h2, h3 {
  margin-bottom: 1rem;
  font-weight: 600;
}

h1 { font-size: 2.5rem; text-align: center; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* Card components */
.card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: var(--border-radius);
  margin: 15px 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Button styles */
.btn {
  background: var(--accent-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--accent-color);
}

.btn-secondary:hover {
  background: var(--accent-color);
}

/* Grid layout */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 15px;
    margin: 10px;
  }
  
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  
  .grid {
    grid-template-columns: 1fr;
  }
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

/* Code syntax highlighting */
.code-block {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: var(--border-radius);
  font-family: 'Consolas', 'Monaco', monospace;
  overflow-x: auto;
  margin: 15px 0;
}`,

  sql: `-- StudySphere Programming - SQL Examples
-- Database setup and queries

-- Create a sample database for a programming learning platform
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    college VARCHAR(100),
    programming_language VARCHAR(50),
    skill_level VARCHAR(20) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS code_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(200),
    language VARCHAR(50),
    code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20),
    language VARCHAR(50),
    test_cases TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email, college, programming_language, skill_level) VALUES
('Alice Johnson', 'alice@example.com', 'MIT', 'Python', 'advanced'),
('Bob Smith', 'bob@example.com', 'Stanford', 'JavaScript', 'intermediate'),
('Carol Davis', 'carol@example.com', 'Harvard', 'Java', 'beginner'),
('David Wilson', 'david@example.com', 'CMU', 'C++', 'advanced'),
('Eve Brown', 'eve@example.com', 'Berkeley', 'Go', 'intermediate');

INSERT INTO code_sessions (user_id, title, language, code) VALUES
(1, 'Fibonacci Implementation', 'Python', 'def fibonacci(n):\\n    if n <= 1: return n\\n    return fibonacci(n-1) + fibonacci(n-2)'),
(2, 'Array Operations', 'JavaScript', 'const arr = [1,2,3,4,5];\\nconst doubled = arr.map(x => x * 2);'),
(3, 'Hello World', 'Java', 'public class Main {\\n    public static void main(String[] args) {\\n        System.out.println("Hello World!");\\n    }\\n}');

INSERT INTO challenges (title, description, difficulty, language) VALUES
('Two Sum Problem', 'Find two numbers in array that add up to target', 'easy', 'Python'),
('Binary Search', 'Implement binary search algorithm', 'medium', 'C++'),
('Palindrome Checker', 'Check if a string is a palindrome', 'easy', 'JavaScript'),
('Merge Sort', 'Implement merge sort algorithm', 'hard', 'Java'),
('Graph Traversal', 'Implement DFS and BFS for graphs', 'hard', 'Go');

-- Example Queries

-- 1. Find all users and their skill levels
SELECT name, email, college, programming_language, skill_level
FROM users
ORDER BY skill_level DESC, name;

-- 2. Count code sessions by programming language
SELECT 
    language,
    COUNT(*) as session_count,
    COUNT(DISTINCT user_id) as unique_users
FROM code_sessions
GROUP BY language
ORDER BY session_count DESC;

-- 3. Find challenges by difficulty level
SELECT difficulty, COUNT(*) as challenge_count
FROM challenges
GROUP BY difficulty
ORDER BY 
    CASE difficulty
        WHEN 'easy' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'hard' THEN 3
    END;

-- 4. Advanced query: User activity with their latest session
SELECT 
    u.name,
    u.email,
    u.college,
    u.programming_language as preferred_language,
    u.skill_level,
    cs.title as latest_session_title,
    cs.language as session_language,
    cs.updated_at as last_activity
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        title,
        language,
        updated_at,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
    FROM code_sessions
) cs ON u.id = cs.user_id AND cs.rn = 1
ORDER BY cs.updated_at DESC;

-- 5. Programming language popularity by college
SELECT 
    u.college,
    cs.language,
    COUNT(*) as usage_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY u.college), 2) as percentage
FROM users u
JOIN code_sessions cs ON u.id = cs.user_id
GROUP BY u.college, cs.language
ORDER BY u.college, usage_count DESC;

-- 6. Find users who haven't created any code sessions yet
SELECT u.name, u.email, u.college, u.skill_level
FROM users u
LEFT JOIN code_sessions cs ON u.id = cs.user_id
WHERE cs.user_id IS NULL;

-- Performance optimization: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_college ON users(college);
CREATE INDEX IF NOT EXISTS idx_users_skill_level ON users(skill_level);
CREATE INDEX IF NOT EXISTS idx_code_sessions_user_id ON code_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_sessions_language ON code_sessions(language);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);

-- Example of a stored procedure (for databases that support them)
-- This would be the equivalent logic in SQLite using a view
CREATE VIEW user_progress AS
SELECT 
    u.id,
    u.name,
    u.skill_level,
    COUNT(DISTINCT cs.language) as languages_used,
    COUNT(cs.id) as total_sessions,
    MAX(cs.updated_at) as last_activity,
    CASE 
        WHEN COUNT(cs.id) = 0 THEN 'Inactive'
        WHEN COUNT(cs.id) < 5 THEN 'Beginner'
        WHEN COUNT(cs.id) < 20 THEN 'Active'
        ELSE 'Expert'
    END as activity_level
FROM users u
LEFT JOIN code_sessions cs ON u.id = cs.user_id
GROUP BY u.id, u.name, u.skill_level;

-- Query the view
SELECT * FROM user_progress ORDER BY total_sessions DESC;`
};

const MonacoEditor = ({ 
  onRun, 
  onSave, 
  initialLanguage = 'javascript',
  initialCode = null,
  readOnly = false,
  roomId,
  userId,
  onCodeChange,
  showToolbar = true,
  height = '500px',
  collaborativeMode = false,
  onLanguageChange,
  className = '',
  // Optional ref from parent to access Monaco editor instance
  editorRef: externalEditorRef
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState('vs-dark');
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState(initialCode || defaultCode[initialLanguage]);
  const [activeUsers, setActiveUsers] = useState([]);
  
  // Internal refs; optionally forward editor instance to parent via externalEditorRef
  const editorRefInternal = useRef(null);
  const monacoRef = useRef(null);
  const yjsBindingRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);
  
  // Cleanup Yjs on unmount
  useEffect(() => {
    return () => {
      if (yjsBindingRef.current) {
        yjsBindingRef.current.destroy();
      }
      if (providerRef.current && roomId && collaborativeMode) {
        yjsProviderService.destroySession(roomId);
      }
    };
  }, [roomId, collaborativeMode]);

  // Update active users when awareness changes
  useEffect(() => {
    if (!collaborativeMode || !roomId) return;

    const interval = setInterval(() => {
      const users = yjsProviderService.getActiveUsers(roomId);
      setActiveUsers(users.filter(u => u.id !== userId)); // Exclude current user
    }, 1000);

    return () => clearInterval(interval);
  }, [collaborativeMode, roomId, userId]);

  useEffect(() => {
    // If initialCode changes (e.g., from collaboration), update the editor
    if (initialCode !== null && editorRefInternal.current && !collaborativeMode) {
      const currentValue = editorRefInternal.current.getValue();
      if (initialCode !== currentValue) {
        editorRefInternal.current.setValue(initialCode);
      }
    }
  }, [initialCode, collaborativeMode]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRefInternal.current = editor;
    monacoRef.current = monaco;
    // Forward to external ref if provided
    if (externalEditorRef && typeof externalEditorRef === 'object') {
      externalEditorRef.current = editor;
    }
    // Publish editor globally for chatbot and other consumers
    setEditor(editor, monaco);
    setIsLoading(false);
    
    // Set up editor configuration
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      renderLineHighlight: 'all',
      readOnly: readOnly
    });

    // Initialize Yjs collaboration if in collaborative mode
    if (collaborativeMode && roomId && userId) {
      initializeCollaboration(editor, monaco);
    }
  };

  const initializeCollaboration = (editor, monaco) => {
    try {
      console.log('[MonacoEditor] Initializing collaboration for room:', roomId);

      // Get user info (you can enhance this to get from context/redux)
      const currentUser = {
        id: userId,
        name: `User ${userId.substring(0, 6)}`, // You can pass full user name from props
        color: null // Will be auto-generated
      };

      // Initialize Yjs provider
      const { doc, provider, awareness } = yjsProviderService.initSession(
        roomId,
        currentUser
      );

      providerRef.current = provider;
      awarenessRef.current = awareness;

      // Get or create a shared text type for the code
      const yText = doc.getText('monaco');

      // Create Monaco binding
      const binding = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        awareness
      );

      yjsBindingRef.current = binding;

      console.log('[MonacoEditor] Collaboration initialized successfully');

      // Update cursor position on selection change
      editor.onDidChangeCursorPosition((e) => {
        if (awareness && !readOnly) {
          const position = e.position;
          const selection = editor.getSelection();
          
          yjsProviderService.updateCursor(roomId, {
            position: {
              lineNumber: position.lineNumber,
              column: position.column
            },
            selection: selection ? {
              startLineNumber: selection.startLineNumber,
              startColumn: selection.startColumn,
              endLineNumber: selection.endLineNumber,
              endColumn: selection.endColumn
            } : null
          });
        }
      });

      // Listen for provider status changes
      provider.on('status', ({ status }) => {
        console.log('[MonacoEditor] Provider status:', status);
      });

      provider.on('sync', (isSynced) => {
        console.log('[MonacoEditor] Sync status:', isSynced);
      });

    } catch (error) {
      console.error('[MonacoEditor] Failed to initialize collaboration:', error);
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    // When changing language, update to default code if we don't have a specific code for this language yet
    if (!initialCode) {
      setCode(defaultCode[newLanguage] || '// Start coding here\n');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'vs-dark' : 'light');
  };

  const handleEditorChange = (value) => {
    setCode(value);
    if (onCodeChange) {
      onCodeChange(value, language);
    }
  };

  const handleRunCode = () => {
    if (onRun) {
      onRun(code, language);
    }
  };

  const handleSaveCode = () => {
    if (onSave) {
      onSave(code, language);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showToolbar && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={handleLanguageChange}
                disabled={readOnly}
              >
                {languageOptions.map(lang => (
                  <MenuItem key={lang.id} value={lang.id}>{lang.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}>
              <IconButton onClick={toggleTheme} size="small">
                {theme === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            {/* Collaborators indicator */}
            {collaborativeMode && activeUsers.length > 0 && (
              <Tooltip title={`${activeUsers.length} active collaborator${activeUsers.length > 1 ? 's' : ''}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize="small" color="primary" />
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                    {activeUsers.map((user) => (
                      <Avatar 
                        key={user.clientId} 
                        sx={{ 
                          bgcolor: user.color,
                          width: 24,
                          height: 24,
                          fontSize: 12
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
              </Tooltip>
            )}
          </Box>
          
          <Box>
            {!readOnly && (
              <>
                <Tooltip title="Run Code">
                  <IconButton 
                    color="primary" 
                    onClick={handleRunCode}
                    disabled={isLoading}
                  >
                    <RunIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Save Code">
                  <IconButton 
                    onClick={handleSaveCode}
                    disabled={isLoading}
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Tooltip title="Editor Settings">
              <IconButton 
                onClick={() => {}} // Will implement settings panel later
                disabled={isLoading}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {isLoading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={theme === 'light' ? 'light' : 'vs-dark'}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: readOnly,
            wordWrap: 'on',
            minimap: { enabled: true },
            showUnused: true,
            folding: true,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontSize: 14,
            renderLineHighlight: 'all'
          }}
        />
      </Box>
    </Paper>
  );
};

export default MonacoEditor;