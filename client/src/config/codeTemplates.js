// Default code templates for various programming languages

export const CODE_TEMPLATES = {
  javascript: 
`// JavaScript Template
console.log('Hello, world!');

// Function example
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try it out
const greeting = greet('Programmer');
console.log(greeting);`,

  typescript: 
`// TypeScript Template
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Try it out
const greeting: string = greet('Programmer');
console.log(greeting);`,

  python: 
`# Python Template
def greet(name):
    """Return a greeting message"""
    return f"Hello, {name}!"

# Try it out
greeting = greet("Programmer")
print(greeting)

# You can also use input
# name = input("Enter your name: ")
# print(greet(name))`,

  java: 
`// Java Template
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
        System.out.println(greet("Programmer"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

  csharp: 
`// C# Template
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, world!");
        Console.WriteLine(Greet("Programmer"));
    }
    
    static string Greet(string name) {
        return $"Hello, {name}!";
    }
}`,

  cpp: 
`// C++ Template
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << "Hello, world!" << std::endl;
    std::cout << greet("Programmer") << std::endl;
    return 0;
}`,

  c: 
`// C Template
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void greet(const char* name, char* buffer) {
    strcpy(buffer, "Hello, ");
    strcat(buffer, name);
    strcat(buffer, "!");
}

int main() {
    printf("Hello, world!\\n");
    
    char greeting[100];
    greet("Programmer", greeting);
    printf("%s\\n", greeting);
    
    return 0;
}`,

  go: 
`// Go Template
package main

import "fmt"

func greet(name string) string {
    return "Hello, " + name + "!"
}

func main() {
    fmt.Println("Hello, world!")
    fmt.Println(greet("Programmer"))
}`,

  rust: 
`// Rust Template
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("Hello, world!");
    println!("{}", greet("Programmer"));
}`,

  php: 
`<?php
// PHP Template
function greet($name) {
    return "Hello, $name!";
}

echo "Hello, world!\\n";
echo greet("Programmer") . "\\n";
?>`,

  ruby: 
`# Ruby Template
def greet(name)
  "Hello, #{name}!"
end

puts "Hello, world!"
puts greet("Programmer")`,

  html: 
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    .greeting {
      color: #0066cc;
      font-size: 24px;
    }
  </style>
</head>
<body>
  <h1>Hello, world!</h1>
  <div class="greeting" id="greeting">Hello, Programmer!</div>
  
  <script>
    function greet(name) {
      document.getElementById('greeting').textContent = \`Hello, \${name}!\`;
    }
    
    // Uncomment to try it out
    // greet('Student');
  </script>
</body>
</html>`,

  css: 
`/* CSS Template */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
}

.button {
  display: inline-block;
  padding: 10px 15px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #0055aa;
}`,

  sql: 
`-- SQL Template
-- Create a table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER
);

-- Insert some data
INSERT INTO users (name, email, age) VALUES
  ('Alice', 'alice@example.com', 28),
  ('Bob', 'bob@example.com', 32),
  ('Charlie', 'charlie@example.com', 22);

-- Query the data
SELECT * FROM users WHERE age > 25;`
};

export const getTemplateForLanguage = (languageId) => {
  return CODE_TEMPLATES[languageId] || '// No template available for this language';
};

// Educational templates with exercises
export const EDUCATIONAL_TEMPLATES = {
  javascript: {
    beginner: `// JavaScript Beginner Exercise
// Task: Write a function that calculates the sum of all numbers from 1 to n

function sumToN(n) {
  // Your code here
  
}

// Test cases
console.log(sumToN(5));  // Should output 15 (1+2+3+4+5)
console.log(sumToN(10)); // Should output 55
`,
    intermediate: `// JavaScript Intermediate Exercise
// Task: Implement a function that checks if a string is a palindrome
// (reads the same forwards and backwards, ignoring spaces, punctuation, and case)

function isPalindrome(str) {
  // Your code here
  
}

// Test cases
console.log(isPalindrome("racecar"));          // Should output true
console.log(isPalindrome("A man, a plan, a canal: Panama")); // Should output true
console.log(isPalindrome("hello"));            // Should output false
`,
    advanced: `// JavaScript Advanced Exercise
// Task: Implement a debounce function that limits the frequency at which a function can be called

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 */
function debounce(func, wait) {
  // Your code here
  
}

// Example usage:
const logMessage = (message) => console.log(\`Message: \${message}\`);
const debouncedLog = debounce(logMessage, 1000);

// These would normally be triggered by events like keystrokes
// In this example, only the last call would execute after 1000ms
debouncedLog("First");
debouncedLog("Second");
debouncedLog("Third");
`
  },

  python: {
    beginner: `# Python Beginner Exercise
# Task: Write a function to find the maximum number in a list

def find_max(numbers):
    # Your code here
    pass

# Test cases
print(find_max([5, 2, 9, 1, 7]))  # Should output 9
print(find_max([0, -1, -5, -2]))  # Should output 0
`,
    intermediate: `# Python Intermediate Exercise
# Task: Create a function that counts the frequency of each word in a text

def word_frequency(text):
    # Your code here
    pass

# Test cases
text1 = "the quick brown fox jumps over the lazy dog"
print(word_frequency(text1))  # Should count 'the' twice and all other words once

text2 = "to be or not to be that is the question"
print(word_frequency(text2))  # Should count 'to', 'be' twice
`,
    advanced: `# Python Advanced Exercise
# Task: Implement a decorator that caches function results

def memoize(func):
    """
    A decorator that caches the results of the function to avoid repeated calculations
    """
    # Your code here
    pass

# Example to test your decorator
@memoize
def fibonacci(n):
    """Calculate the nth Fibonacci number recursively"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the speed improvement from memoization
import time

start = time.time()
result = fibonacci(35)  # This would be very slow without memoization
end = time.time()

print(f"Result: {result}")
print(f"Time taken: {end - start:.6f} seconds")
`
  }
};