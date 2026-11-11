/**
 * J.A.R.V.I.S. Voice Assistant Page - Standalone
 * Complete program generation from voice commands
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Tooltip,
    Chip, Divider, Alert, CircularProgress, Grid, List, ListItem,
    ListItemText, ListItemIcon, Snackbar, Accordion, AccordionSummary,
    AccordionDetails, TextField,
} from '@mui/material';
import {
    Mic, MicOff, Code, ContentCopy, Check, Download, Psychology,
    VolumeUp, History, ExpandMore, PlayArrow, Stop, Info,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Check for Web Speech API support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

// Complete program templates
const PROGRAM_TEMPLATES = {
    'calculator': `// Calculator Program
function Calculator() {
    let display = '0';
    let currentValue = 0;
    let operator = null;
    let waitingForSecondOperand = false;

    const inputDigit = (digit) => {
        if (waitingForSecondOperand) {
            display = digit;
            waitingForSecondOperand = false;
        } else {
            display = display === '0' ? digit : display + digit;
        }
    };

    const inputDecimal = () => {
        if (!display.includes('.')) {
            display += '.';
        }
    };

    const clear = () => {
        display = '0';
        currentValue = 0;
        operator = null;
        waitingForSecondOperand = false;
    };

    const performOperation = (nextOperator) => {
        const inputValue = parseFloat(display);

        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        if (currentValue === 0) {
            currentValue = inputValue;
        } else if (operator) {
            const result = calculate(currentValue, inputValue, operator);
            display = String(result);
            currentValue = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
    };

    const calculate = (first, second, op) => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return second !== 0 ? first / second : 'Error';
            default: return second;
        }
    };

    return { inputDigit, inputDecimal, clear, performOperation, getDisplay: () => display };
}

// Usage
const calc = Calculator();
calc.inputDigit('5');
calc.performOperation('+');
calc.inputDigit('3');
calc.performOperation('=');
console.log(calc.getDisplay()); // 8`,

    'todo list': `// Todo List Application
class TodoList {
    constructor() {
        this.todos = [];
        this.nextId = 1;
    }

    addTodo(text) {
        const todo = {
            id: this.nextId++,
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.todos.push(todo);
        return todo;
    }

    removeTodo(id) {
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            return this.todos.splice(index, 1)[0];
        }
        return null;
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            return todo;
        }
        return null;
    }

    editTodo(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.text = newText;
            return todo;
        }
        return null;
    }

    getAll() {
        return [...this.todos];
    }

    getCompleted() {
        return this.todos.filter(todo => todo.completed);
    }

    getPending() {
        return this.todos.filter(todo => !todo.completed);
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
    }
}

// Usage Example
const todoList = new TodoList();
todoList.addTodo('Learn JavaScript');
todoList.addTodo('Build a project');
todoList.addTodo('Practice coding');
todoList.toggleComplete(1);
console.log('All todos:', todoList.getAll());
console.log('Pending:', todoList.getPending());`,

    'login form': `// Login Form with Validation
import React, { useState } from 'react';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const validateEmail = (email) => {
        const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return regex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMessage('Login successful!');
            console.log('Logged in with:', formData);
        } catch (error) {
            setMessage('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Login</h2>
            
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {message && <p className="message">{message}</p>}
        </form>
    );
};

export default LoginForm;`,

    'fetch data': `// API Data Fetcher with Error Handling
class APIService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = \`\${this.baseURL}\${endpoint}\`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// React Hook for Data Fetching
import { useState, useEffect } from 'react';

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network error');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};

// Usage Example
const api = new APIService('https://api.example.com');
const users = await api.get('/users');
console.log(users);`,

    'sorting algorithm': `// Sorting Algorithms Collection
const SortingAlgorithms = {
    // Bubble Sort - O(n²)
    bubbleSort(arr) {
        const array = [...arr];
        const n = array.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                }
            }
        }
        return array;
    },

    // Quick Sort - O(n log n) average
    quickSort(arr) {
        if (arr.length <= 1) return arr;
        
        const pivot = arr[Math.floor(arr.length / 2)];
        const left = arr.filter(x => x < pivot);
        const middle = arr.filter(x => x === pivot);
        const right = arr.filter(x => x > pivot);
        
        return [...this.quickSort(left), ...middle, ...this.quickSort(right)];
    },

    // Merge Sort - O(n log n)
    mergeSort(arr) {
        if (arr.length <= 1) return arr;
        
        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid));
        const right = this.mergeSort(arr.slice(mid));
        
        return this.merge(left, right);
    },

    merge(left, right) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        
        return result.concat(left.slice(i)).concat(right.slice(j));
    },

    // Selection Sort - O(n²)
    selectionSort(arr) {
        const array = [...arr];
        const n = array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (array[j] < array[minIdx]) {
                    minIdx = j;
                }
            }
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
        }
        return array;
    },

    // Insertion Sort - O(n²)
    insertionSort(arr) {
        const array = [...arr];
        
        for (let i = 1; i < array.length; i++) {
            const key = array[i];
            let j = i - 1;
            
            while (j >= 0 && array[j] > key) {
                array[j + 1] = array[j];
                j--;
            }
            array[j + 1] = key;
        }
        return array;
    }
};

// Test
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log('Original:', testArray);
console.log('Bubble Sort:', SortingAlgorithms.bubbleSort(testArray));
console.log('Quick Sort:', SortingAlgorithms.quickSort(testArray));
console.log('Merge Sort:', SortingAlgorithms.mergeSort(testArray));`,

    'timer': `// Timer / Stopwatch Application
class Timer {
    constructor() {
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.intervalId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.seconds++;
            
            if (this.seconds >= 60) {
                this.seconds = 0;
                this.minutes++;
            }
            
            if (this.minutes >= 60) {
                this.minutes = 0;
                this.hours++;
            }
            
            this.display();
        }, 1000);
    }

    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.intervalId);
        this.isRunning = false;
    }

    reset() {
        this.stop();
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.display();
    }

    display() {
        const pad = (num) => num.toString().padStart(2, '0');
        console.log(\`\${pad(this.hours)}:\${pad(this.minutes)}:\${pad(this.seconds)}\`);
    }

    getTime() {
        return {
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds,
        };
    }
}

// Countdown Timer
class CountdownTimer {
    constructor(targetSeconds) {
        this.targetSeconds = targetSeconds;
        this.remainingSeconds = targetSeconds;
        this.intervalId = null;
        this.isRunning = false;
        this.onComplete = null;
    }

    start(callback) {
        if (this.isRunning) return;
        
        this.onComplete = callback;
        this.isRunning = true;
        
        this.intervalId = setInterval(() => {
            this.remainingSeconds--;
            this.display();
            
            if (this.remainingSeconds <= 0) {
                this.stop();
                if (this.onComplete) this.onComplete();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.intervalId);
        this.isRunning = false;
    }

    reset() {
        this.stop();
        this.remainingSeconds = this.targetSeconds;
    }

    display() {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;
        console.log(\`Remaining: \${hours}h \${minutes}m \${seconds}s\`);
    }
}

// Usage
const stopwatch = new Timer();
stopwatch.start();

const countdown = new CountdownTimer(60); // 60 seconds
countdown.start(() => console.log('Time is up!'));`,

    'weather app': `// Weather App with API Integration
import React, { useState } from 'react';

const WeatherApp = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key

    const fetchWeather = async () => {
        if (!city.trim()) {
            setError('Please enter a city name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}&units=metric\`
            );

            if (!response.ok) {
                throw new Error('City not found');
            }

            const data = await response.json();
            setWeather({
                city: data.name,
                country: data.sys.country,
                temp: Math.round(data.main.temp),
                feels_like: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                wind: data.wind.speed,
            });
        } catch (err) {
            setError(err.message);
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchWeather();
    };

    const getWeatherEmoji = (description) => {
        if (description.includes('rain')) return '🌧️';
        if (description.includes('cloud')) return '☁️';
        if (description.includes('sun') || description.includes('clear')) return '☀️';
        if (description.includes('snow')) return '❄️';
        if (description.includes('thunder')) return '⛈️';
        return '🌤️';
    };

    return (
        <div className="weather-app">
            <h1>Weather App</h1>
            
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name..."
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {weather && (
                <div className="weather-card">
                    <h2>{weather.city}, {weather.country}</h2>
                    <div className="weather-icon">
                        {getWeatherEmoji(weather.description)}
                    </div>
                    <p className="temp">{weather.temp}°C</p>
                    <p className="description">{weather.description}</p>
                    <div className="details">
                        <p>Feels like: {weather.feels_like}°C</p>
                        <p>Humidity: {weather.humidity}%</p>
                        <p>Wind: {weather.wind} m/s</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherApp;`,

    // ===== STRING MANIPULATION =====
    'reverse string': `// Reverse a String - Multiple Methods
// Method 1: Using built-in methods
function reverseString1(str) {
    return str.split('').reverse().join('');
}

// Method 2: Using a for loop
function reverseString2(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

// Method 3: Using recursion
function reverseString3(str) {
    if (str === '') return '';
    return reverseString3(str.substring(1)) + str[0];
}

// Method 4: Using reduce
function reverseString4(str) {
    return str.split('').reduce((rev, char) => char + rev, '');
}

// Test all methods
const testString = 'Hello World';
console.log('Original:', testString);
console.log('Method 1 (split/reverse/join):', reverseString1(testString));
console.log('Method 2 (for loop):', reverseString2(testString));
console.log('Method 3 (recursion):', reverseString3(testString));
console.log('Method 4 (reduce):', reverseString4(testString));

// Reverse words in a sentence
function reverseWords(sentence) {
    return sentence.split(' ').reverse().join(' ');
}
console.log('Reverse words:', reverseWords('Hello World'));
`,

    'palindrome': `// Palindrome Checker
function isPalindrome(str) {
    // Remove non-alphanumeric and convert to lowercase
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = cleaned.split('').reverse().join('');
    return cleaned === reversed;
}

// Method 2: Two pointer approach (more efficient)
function isPalindrome2(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

// Check if number is palindrome
function isNumberPalindrome(num) {
    const str = num.toString();
    return str === str.split('').reverse().join('');
}

// Test
console.log('Is "racecar" a palindrome?', isPalindrome('racecar')); // true
console.log('Is "A man a plan a canal Panama" a palindrome?', isPalindrome('A man a plan a canal Panama')); // true
console.log('Is "hello" a palindrome?', isPalindrome('hello')); // false
console.log('Is 12321 a palindrome number?', isNumberPalindrome(12321)); // true
`,

    'anagram': `// Anagram Checker
function areAnagrams(str1, str2) {
    const normalize = (str) => str.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join('');
    return normalize(str1) === normalize(str2);
}

// Method 2: Using character count
function areAnagrams2(str1, str2) {
    const clean1 = str1.toLowerCase().replace(/[^a-z]/g, '');
    const clean2 = str2.toLowerCase().replace(/[^a-z]/g, '');
    
    if (clean1.length !== clean2.length) return false;
    
    const charCount = {};
    
    for (const char of clean1) {
        charCount[char] = (charCount[char] || 0) + 1;
    }
    
    for (const char of clean2) {
        if (!charCount[char]) return false;
        charCount[char]--;
    }
    
    return true;
}

// Find all anagrams in array
function groupAnagrams(words) {
    const groups = {};
    
    for (const word of words) {
        const key = word.toLowerCase().split('').sort().join('');
        if (!groups[key]) groups[key] = [];
        groups[key].push(word);
    }
    
    return Object.values(groups);
}

// Test
console.log('Are "listen" and "silent" anagrams?', areAnagrams('listen', 'silent')); // true
console.log('Are "hello" and "world" anagrams?', areAnagrams('hello', 'world')); // false
console.log('Group anagrams:', groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));
`,

    'count vowels': `// Count Vowels and Consonants
function countVowelsAndConsonants(str) {
    const vowels = 'aeiouAEIOU';
    let vowelCount = 0;
    let consonantCount = 0;
    
    for (const char of str) {
        if (/[a-zA-Z]/.test(char)) {
            if (vowels.includes(char)) {
                vowelCount++;
            } else {
                consonantCount++;
            }
        }
    }
    
    return { vowels: vowelCount, consonants: consonantCount };
}

// Using filter
function countVowels(str) {
    return str.match(/[aeiou]/gi)?.length || 0;
}

// Count each vowel individually
function countEachVowel(str) {
    const counts = { a: 0, e: 0, i: 0, o: 0, u: 0 };
    
    for (const char of str.toLowerCase()) {
        if (counts.hasOwnProperty(char)) {
            counts[char]++;
        }
    }
    
    return counts;
}

// Test
const text = 'Hello World! This is a test string.';
console.log('Text:', text);
console.log('Vowels and Consonants:', countVowelsAndConsonants(text));
console.log('Total vowels:', countVowels(text));
console.log('Each vowel count:', countEachVowel(text));
`,

    // ===== MATH & NUMBERS =====
    'fibonacci': `// Fibonacci Sequence - Multiple Methods
// Method 1: Iterative (Most efficient)
function fibonacciIterative(n) {
    if (n <= 1) return n;
    
    let prev = 0, curr = 1;
    for (let i = 2; i <= n; i++) {
        [prev, curr] = [curr, prev + curr];
    }
    return curr;
}

// Method 2: Recursive (Simple but slow for large n)
function fibonacciRecursive(n) {
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// Method 3: Memoization (Optimized recursive)
function fibonacciMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
    return memo[n];
}

// Generate Fibonacci series up to n terms
function fibonacciSeries(n) {
    const series = [];
    for (let i = 0; i < n; i++) {
        series.push(fibonacciIterative(i));
    }
    return series;
}

// Check if a number is Fibonacci
function isFibonacci(num) {
    const isPerfectSquare = (n) => Math.sqrt(n) % 1 === 0;
    return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
}

// Test
console.log('Fibonacci of 10:', fibonacciIterative(10)); // 55
console.log('First 15 Fibonacci numbers:', fibonacciSeries(15));
console.log('Is 21 a Fibonacci number?', isFibonacci(21)); // true
`,

    'factorial': `// Factorial - Multiple Methods
// Method 1: Iterative
function factorialIterative(n) {
    if (n < 0) return 'Factorial not defined for negative numbers';
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Method 2: Recursive
function factorialRecursive(n) {
    if (n < 0) return 'Factorial not defined for negative numbers';
    if (n === 0 || n === 1) return 1;
    return n * factorialRecursive(n - 1);
}

// Method 3: Using reduce
function factorialReduce(n) {
    if (n < 0) return 'Factorial not defined for negative numbers';
    return [...Array(n).keys()].reduce((acc, i) => acc * (i + 1), 1);
}

// Factorial for large numbers using BigInt
function factorialBigInt(n) {
    if (n < 0n) return 'Factorial not defined for negative numbers';
    let result = 1n;
    for (let i = 2n; i <= BigInt(n); i++) {
        result *= i;
    }
    return result.toString();
}

// Test
console.log('5! =', factorialIterative(5)); // 120
console.log('10! =', factorialIterative(10)); // 3628800
console.log('20! =', factorialBigInt(20)); // 2432902008176640000
`,

    'prime number': `// Prime Number Operations
// Check if a number is prime
function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

// Generate prime numbers up to n (Sieve of Eratosthenes)
function sieveOfEratosthenes(n) {
    const sieve = new Array(n + 1).fill(true);
    sieve[0] = sieve[1] = false;
    
    for (let i = 2; i * i <= n; i++) {
        if (sieve[i]) {
            for (let j = i * i; j <= n; j += i) {
                sieve[j] = false;
            }
        }
    }
    
    return sieve.map((isPrime, num) => isPrime ? num : null).filter(n => n !== null);
}

// Get first n prime numbers
function getFirstNPrimes(count) {
    const primes = [];
    let num = 2;
    
    while (primes.length < count) {
        if (isPrime(num)) primes.push(num);
        num++;
    }
    
    return primes;
}

// Prime factorization
function primeFactors(n) {
    const factors = [];
    let divisor = 2;
    
    while (n > 1) {
        while (n % divisor === 0) {
            factors.push(divisor);
            n /= divisor;
        }
        divisor++;
    }
    
    return factors;
}

// Test
console.log('Is 17 prime?', isPrime(17)); // true
console.log('Is 20 prime?', isPrime(20)); // false
console.log('Primes up to 50:', sieveOfEratosthenes(50));
console.log('First 10 primes:', getFirstNPrimes(10));
console.log('Prime factors of 84:', primeFactors(84)); // [2, 2, 3, 7]
`,

    'armstrong': `// Armstrong Number (Narcissistic Number)
// A number is Armstrong if sum of each digit raised to power of total digits equals the number
function isArmstrong(num) {
    const str = num.toString();
    const power = str.length;
    const sum = str.split('').reduce((acc, digit) => acc + Math.pow(parseInt(digit), power), 0);
    return sum === num;
}

// Find all Armstrong numbers in a range
function findArmstrongNumbers(start, end) {
    const armstrongNumbers = [];
    
    for (let num = start; num <= end; num++) {
        if (isArmstrong(num)) {
            armstrongNumbers.push(num);
        }
    }
    
    return armstrongNumbers;
}

// Test
console.log('Is 153 Armstrong?', isArmstrong(153)); // true (1³ + 5³ + 3³ = 153)
console.log('Is 370 Armstrong?', isArmstrong(370)); // true
console.log('Is 123 Armstrong?', isArmstrong(123)); // false
console.log('Armstrong numbers 1-1000:', findArmstrongNumbers(1, 1000));
`,

    'gcd': `// GCD (Greatest Common Divisor) / HCF
// Method 1: Euclidean Algorithm (Recursive)
function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}

// Method 2: Iterative
function gcdIterative(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

// GCD of multiple numbers
function gcdArray(arr) {
    return arr.reduce((acc, num) => gcd(acc, num));
}

// Test
console.log('GCD of 48 and 18:', gcd(48, 18)); // 6
console.log('GCD of 54 and 24:', gcd(54, 24)); // 6
console.log('GCD of [24, 36, 60]:', gcdArray([24, 36, 60])); // 12
`,

    'lcm': `// LCM (Least Common Multiple)
function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// LCM of multiple numbers
function lcmArray(arr) {
    return arr.reduce((acc, num) => lcm(acc, num));
}

// Test
console.log('LCM of 4 and 6:', lcm(4, 6)); // 12
console.log('LCM of 15 and 20:', lcm(15, 20)); // 60
console.log('LCM of [2, 3, 4, 5]:', lcmArray([2, 3, 4, 5])); // 60
`,

    // ===== ARRAY OPERATIONS =====
    'array sum': `// Array Sum and Operations
// Sum of array elements
function arraySum(arr) {
    return arr.reduce((sum, num) => sum + num, 0);
}

// Average
function arrayAverage(arr) {
    return arr.length ? arraySum(arr) / arr.length : 0;
}

// Product
function arrayProduct(arr) {
    return arr.reduce((product, num) => product * num, 1);
}

// Sum of even/odd numbers
function sumEvenOdd(arr) {
    return arr.reduce((acc, num) => {
        num % 2 === 0 ? acc.even += num : acc.odd += num;
        return acc;
    }, { even: 0, odd: 0 });
}

// Test
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Array:', numbers);
console.log('Sum:', arraySum(numbers)); // 55
console.log('Average:', arrayAverage(numbers)); // 5.5
console.log('Product:', arrayProduct([1, 2, 3, 4])); // 24
console.log('Even/Odd sums:', sumEvenOdd(numbers)); // { even: 30, odd: 25 }
`,

    'array max min': `// Find Maximum and Minimum in Array
// Using Math functions
function findMaxMin(arr) {
    return {
        max: Math.max(...arr),
        min: Math.min(...arr)
    };
}

// Manual method
function findMaxMinManual(arr) {
    let max = arr[0], min = arr[0];
    
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    
    return { max, min };
}

// Find second largest
function secondLargest(arr) {
    const unique = [...new Set(arr)].sort((a, b) => b - a);
    return unique.length >= 2 ? unique[1] : null;
}

// Find kth largest/smallest
function kthElement(arr, k, largest = true) {
    const sorted = [...arr].sort((a, b) => largest ? b - a : a - b);
    return sorted[k - 1];
}

// Test
const nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
console.log('Array:', nums);
console.log('Max and Min:', findMaxMin(nums));
console.log('Second largest:', secondLargest(nums)); // 6
console.log('3rd smallest:', kthElement(nums, 3, false)); // 2
`,

    'remove duplicates': `// Remove Duplicates from Array
// Method 1: Using Set
function removeDuplicates1(arr) {
    return [...new Set(arr)];
}

// Method 2: Using filter
function removeDuplicates2(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

// Method 3: Using reduce
function removeDuplicates3(arr) {
    return arr.reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
    }, []);
}

// Remove duplicates from array of objects
function removeDuplicateObjects(arr, key) {
    const seen = new Set();
    return arr.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
}

// Test
const arr1 = [1, 2, 3, 2, 1, 4, 5, 4, 6];
console.log('Original:', arr1);
console.log('Using Set:', removeDuplicates1(arr1));
console.log('Using filter:', removeDuplicates2(arr1));

const objects = [{id: 1, name: 'A'}, {id: 2, name: 'B'}, {id: 1, name: 'C'}];
console.log('Remove duplicate objects by id:', removeDuplicateObjects(objects, 'id'));
`,

    'binary search': `// Binary Search Algorithm
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid; // Found at index mid
        } else if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    
    return -1; // Not found
}

// Recursive version
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
    if (left > right) return -1;
    
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right);
    return binarySearchRecursive(arr, target, left, mid - 1);
}

// Test
const sortedArr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log('Array:', sortedArr);
console.log('Search 7:', binarySearch(sortedArr, 7)); // 3
console.log('Search 10:', binarySearch(sortedArr, 10)); // -1
console.log('Search 19 (recursive):', binarySearchRecursive(sortedArr, 19)); // 9
`,

    'linear search': `// Linear Search Algorithm
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i; // Found at index i
        }
    }
    return -1; // Not found
}

// Find all occurrences
function findAllOccurrences(arr, target) {
    const indices = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            indices.push(i);
        }
    }
    return indices;
}

// Search in array of objects
function linearSearchObject(arr, key, value) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === value) {
            return { index: i, item: arr[i] };
        }
    }
    return null;
}

// Test
const arr = [10, 20, 30, 20, 40, 50, 20];
console.log('Search 30:', linearSearch(arr, 30)); // 2
console.log('Search 60:', linearSearch(arr, 60)); // -1
console.log('All occurrences of 20:', findAllOccurrences(arr, 20)); // [1, 3, 6]
`,

    'linked list': `// Linked List Implementation
class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    
    // Add at end
    append(value) {
        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }
    
    // Add at beginning
    prepend(value) {
        const newNode = new Node(value);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
    }
    
    // Remove node
    remove(value) {
        if (!this.head) return null;
        
        if (this.head.value === value) {
            this.head = this.head.next;
            this.size--;
            return value;
        }
        
        let current = this.head;
        while (current.next && current.next.value !== value) {
            current = current.next;
        }
        
        if (current.next) {
            current.next = current.next.next;
            this.size--;
            return value;
        }
        return null;
    }
    
    // Convert to array
    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current.value);
            current = current.next;
        }
        return arr;
    }
    
    // Reverse the list
    reverse() {
        let prev = null;
        let current = this.head;
        
        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        this.head = prev;
    }
}

// Test
const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.prepend(0);
console.log('List:', list.toArray()); // [0, 1, 2, 3]
list.reverse();
console.log('Reversed:', list.toArray()); // [3, 2, 1, 0]
`,

    'stack': `// Stack Data Structure (LIFO)
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(item) {
        this.items.push(item);
    }
    
    pop() {
        if (this.isEmpty()) return null;
        return this.items.pop();
    }
    
    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
    
    clear() {
        this.items = [];
    }
    
    print() {
        console.log(this.items.join(' <- '));
    }
}

// Balanced Parentheses using Stack
function isBalanced(str) {
    const stack = new Stack();
    const pairs = { ')': '(', ']': '[', '}': '{' };
    
    for (const char of str) {
        if ('([{'.includes(char)) {
            stack.push(char);
        } else if (')]}'.includes(char)) {
            if (stack.pop() !== pairs[char]) return false;
        }
    }
    
    return stack.isEmpty();
}

// Test
const stack = new Stack();
stack.push(10);
stack.push(20);
stack.push(30);
stack.print(); // 10 <- 20 <- 30
console.log('Pop:', stack.pop()); // 30
console.log('Peek:', stack.peek()); // 20

console.log('Is {[()]} balanced?', isBalanced('{[()]}')); // true
console.log('Is {[(])} balanced?', isBalanced('{[(])}')); // false
`,

    'queue': `// Queue Data Structure (FIFO)
class Queue {
    constructor() {
        this.items = [];
    }
    
    enqueue(item) {
        this.items.push(item);
    }
    
    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }
    
    front() {
        if (this.isEmpty()) return null;
        return this.items[0];
    }
    
    rear() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
    
    print() {
        console.log('[Front]', this.items.join(' -> '), '[Rear]');
    }
}

// Priority Queue
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    enqueue(item, priority) {
        const element = { item, priority };
        let added = false;
        
        for (let i = 0; i < this.items.length; i++) {
            if (priority < this.items[i].priority) {
                this.items.splice(i, 0, element);
                added = true;
                break;
            }
        }
        
        if (!added) this.items.push(element);
    }
    
    dequeue() {
        return this.items.shift()?.item;
    }
}

// Test
const queue = new Queue();
queue.enqueue('First');
queue.enqueue('Second');
queue.enqueue('Third');
queue.print(); // [Front] First -> Second -> Third [Rear]
console.log('Dequeue:', queue.dequeue()); // First
console.log('Front:', queue.front()); // Second
`,

    'patterns': `// Pattern Printing Programs
// Triangle pattern
function trianglePattern(rows) {
    let pattern = '';
    for (let i = 1; i <= rows; i++) {
        pattern += '*'.repeat(i) + '\\n';
    }
    return pattern;
}

// Pyramid pattern
function pyramidPattern(rows) {
    let pattern = '';
    for (let i = 1; i <= rows; i++) {
        const spaces = ' '.repeat(rows - i);
        const stars = '*'.repeat(2 * i - 1);
        pattern += spaces + stars + '\\n';
    }
    return pattern;
}

// Diamond pattern
function diamondPattern(rows) {
    let pattern = pyramidPattern(rows);
    for (let i = rows - 1; i >= 1; i--) {
        const spaces = ' '.repeat(rows - i);
        const stars = '*'.repeat(2 * i - 1);
        pattern += spaces + stars + '\\n';
    }
    return pattern;
}

// Number triangle
function numberTriangle(rows) {
    let pattern = '';
    for (let i = 1; i <= rows; i++) {
        let row = '';
        for (let j = 1; j <= i; j++) {
            row += j + ' ';
        }
        pattern += row.trim() + '\\n';
    }
    return pattern;
}

// Test
console.log('Triangle (5 rows):');
console.log(trianglePattern(5));

console.log('Pyramid (5 rows):');
console.log(pyramidPattern(5));

console.log('Number Triangle (5 rows):');
console.log(numberTriangle(5));
`,

    'swap numbers': `// Swap Two Numbers - Multiple Methods
// Method 1: Using temp variable
function swap1(a, b) {
    let temp = a;
    a = b;
    b = temp;
    return { a, b };
}

// Method 2: Using arithmetic
function swap2(a, b) {
    a = a + b;
    b = a - b;
    a = a - b;
    return { a, b };
}

// Method 3: Using XOR (for integers)
function swap3(a, b) {
    a = a ^ b;
    b = a ^ b;
    a = a ^ b;
    return { a, b };
}

// Method 4: ES6 Destructuring
function swap4(a, b) {
    [a, b] = [b, a];
    return { a, b };
}

// Test
console.log('Original: a=5, b=10');
console.log('Using temp:', swap1(5, 10));
console.log('Using arithmetic:', swap2(5, 10));
console.log('Using XOR:', swap3(5, 10));
console.log('Using destructuring:', swap4(5, 10));
`,

    'leap year': `// Leap Year Checker
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get all leap years in a range
function getLeapYears(startYear, endYear) {
    const leapYears = [];
    for (let year = startYear; year <= endYear; year++) {
        if (isLeapYear(year)) {
            leapYears.push(year);
        }
    }
    return leapYears;
}

// Days in month considering leap year
function daysInMonth(month, year) {
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isLeapYear(year)) return 29;
    return days[month - 1];
}

// Test
console.log('Is 2024 a leap year?', isLeapYear(2024)); // true
console.log('Is 2100 a leap year?', isLeapYear(2100)); // false
console.log('Is 2000 a leap year?', isLeapYear(2000)); // true
console.log('Leap years 2020-2050:', getLeapYears(2020, 2050));
console.log('Days in Feb 2024:', daysInMonth(2, 2024)); // 29
`,

    'merge arrays': `// Merge Arrays - Multiple Methods
// Method 1: Using spread
function mergeArrays1(arr1, arr2) {
    return [...arr1, ...arr2];
}

// Method 2: Using concat
function mergeArrays2(arr1, arr2) {
    return arr1.concat(arr2);
}

// Merge and remove duplicates
function mergeUnique(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}

// Merge sorted arrays
function mergeSorted(arr1, arr2) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] < arr2[j]) {
            result.push(arr1[i++]);
        } else {
            result.push(arr2[j++]);
        }
    }
    
    return result.concat(arr1.slice(i)).concat(arr2.slice(j));
}

// Test
const a = [1, 2, 3];
const b = [3, 4, 5];
console.log('Merge:', mergeArrays1(a, b)); // [1, 2, 3, 3, 4, 5]
console.log('Merge unique:', mergeUnique(a, b)); // [1, 2, 3, 4, 5]
console.log('Merge sorted:', mergeSorted([1, 3, 5], [2, 4, 6])); // [1, 2, 3, 4, 5, 6]
`,

    'temperature converter': `// Temperature Converter
const TemperatureConverter = {
    celsiusToFahrenheit(c) {
        return (c * 9/5) + 32;
    },
    
    fahrenheitToCelsius(f) {
        return (f - 32) * 5/9;
    },
    
    celsiusToKelvin(c) {
        return c + 273.15;
    },
    
    kelvinToCelsius(k) {
        return k - 273.15;
    },
    
    fahrenheitToKelvin(f) {
        return this.celsiusToKelvin(this.fahrenheitToCelsius(f));
    },
    
    kelvinToFahrenheit(k) {
        return this.celsiusToFahrenheit(this.kelvinToCelsius(k));
    }
};

// Test
console.log('100°C to Fahrenheit:', TemperatureConverter.celsiusToFahrenheit(100).toFixed(2) + '°F'); // 212°F
console.log('32°F to Celsius:', TemperatureConverter.fahrenheitToCelsius(32).toFixed(2) + '°C'); // 0°C
console.log('0°C to Kelvin:', TemperatureConverter.celsiusToKelvin(0).toFixed(2) + 'K'); // 273.15K
`,

    'currency converter': `// Currency Converter
class CurrencyConverter {
    constructor() {
        // Sample exchange rates (base: USD)
        this.rates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            INR: 83.5,
            JPY: 149.5,
            CAD: 1.36,
            AUD: 1.53
        };
    }
    
    convert(amount, from, to) {
        if (!this.rates[from] || !this.rates[to]) {
            return 'Invalid currency code';
        }
        const usdAmount = amount / this.rates[from];
        return (usdAmount * this.rates[to]).toFixed(2);
    }
    
    addRate(currency, rate) {
        this.rates[currency] = rate;
    }
    
    getAvailableCurrencies() {
        return Object.keys(this.rates);
    }
}

// Test
const converter = new CurrencyConverter();
console.log('100 USD to EUR:', converter.convert(100, 'USD', 'EUR'));
console.log('1000 INR to USD:', converter.convert(1000, 'INR', 'USD'));
console.log('Available currencies:', converter.getAvailableCurrencies());
`,
};

// Simple command patterns for program generation
const COMMAND_PATTERNS = [
    { pattern: /calculator/i, template: 'calculator' },
    { pattern: /todo|task list/i, template: 'todo list' },
    { pattern: /login|authentication|sign.?in/i, template: 'login form' },
    { pattern: /fetch|api|data/i, template: 'fetch data' },
    { pattern: /sort|sorting|algorithm/i, template: 'sorting algorithm' },
    { pattern: /timer|stopwatch|countdown/i, template: 'timer' },
    { pattern: /weather/i, template: 'weather app' },
    // String manipulation - order independent
    { pattern: /reverse|string.*reverse/i, template: 'reverse string' },
    { pattern: /palindrome/i, template: 'palindrome' },
    { pattern: /anagram/i, template: 'anagram' },
    { pattern: /vowel|consonant/i, template: 'count vowels' },
    // Math & Numbers
    { pattern: /fibonacci|fib series/i, template: 'fibonacci' },
    { pattern: /factorial/i, template: 'factorial' },
    { pattern: /prime/i, template: 'prime number' },
    { pattern: /armstrong/i, template: 'armstrong' },
    { pattern: /gcd|greatest common|hcf/i, template: 'gcd' },
    { pattern: /lcm|least common/i, template: 'lcm' },
    // Array operations - order independent (max/min/largest/smallest with array)
    { pattern: /(max|min|largest|smallest|maximum|minimum).*(array|element)/i, template: 'array max min' },
    { pattern: /array.*(max|min|largest|smallest|maximum|minimum)/i, template: 'array max min' },
    { pattern: /(sum|add|total).*(array|element)/i, template: 'array sum' },
    { pattern: /array.*(sum|add|total)/i, template: 'array sum' },
    { pattern: /remove.*(duplicate|repeated)|duplicate.*remove/i, template: 'remove duplicates' },
    { pattern: /(merge|combine|concat).*array|array.*(merge|combine)/i, template: 'merge arrays' },
    { pattern: /binary.*search/i, template: 'binary search' },
    { pattern: /linear.*search|search.*linear/i, template: 'linear search' },
    { pattern: /search.*array|find.*element|array.*search/i, template: 'linear search' },
    // Data structures
    { pattern: /linked.*list/i, template: 'linked list' },
    { pattern: /stack/i, template: 'stack' },
    { pattern: /queue/i, template: 'queue' },
    // Patterns
    { pattern: /pyramid|triangle|pattern|star/i, template: 'patterns' },
    // Common programs
    { pattern: /swap|exchange/i, template: 'swap numbers' },
    { pattern: /leap.*year/i, template: 'leap year' },
    { pattern: /currency|convert.*money/i, template: 'currency converter' },
    { pattern: /temperature|celsius|fahrenheit|kelvin/i, template: 'temperature converter' },
    // Even/odd
    { pattern: /even|odd/i, template: 'array sum' },
    // Number check
    { pattern: /positive|negative/i, template: 'swap numbers' },
];

const JarvisPage = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('idle');
    const [generatedCode, setGeneratedCode] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [manualInput, setManualInput] = useState('');
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (!isSpeechSupported) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setStatus('listening');
            setError(null);
            setTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            if (status === 'listening') {
                setStatus('idle');
            }
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';

            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript = event.results[i][0].transcript;
                } else {
                    setTranscript(event.results[i][0].transcript);
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                processCommand(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow access.');
            }
            setIsListening(false);
            setStatus('error');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        };
    }, [status]);

    // Toggle listening
    const toggleListening = () => {
        if (!isSpeechSupported) {
            setError('Speech not supported. Use Chrome or Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setStatus('idle');
        } else {
            setIsListening(true);
            setTranscript('');
            try {
                recognitionRef.current?.start();
            } catch (e) {
                setIsListening(false);
            }
        }
    };

    // Process command
    const processCommand = async (command) => {
        setStatus('processing');

        // Artificial delay
        await new Promise(r => setTimeout(r, 500));

        // Find matching template
        let matchedTemplate = null;
        for (const { pattern, template } of COMMAND_PATTERNS) {
            if (pattern.test(command)) {
                matchedTemplate = template;
                break;
            }
        }

        if (matchedTemplate && PROGRAM_TEMPLATES[matchedTemplate]) {
            const code = PROGRAM_TEMPLATES[matchedTemplate];
            setGeneratedCode(code);
            setStatus('success');

            setCommandHistory(prev => [{
                command,
                template: matchedTemplate,
                timestamp: new Date().toISOString(),
            }, ...prev.slice(0, 9)]);
        } else {
            // Generate basic code for unrecognized commands
            const basicCode = generateBasicCode(command);
            setGeneratedCode(basicCode);
            setStatus('success');

            setCommandHistory(prev => [{
                command,
                template: 'custom',
                timestamp: new Date().toISOString(),
            }, ...prev.slice(0, 9)]);
        }
    };

    // Generate basic code for custom commands
    const generateBasicCode = (command) => {
        const lowerCommand = command.toLowerCase();

        // Try to detect intent from keywords and generate appropriate code

        // Array/element related
        if (lowerCommand.includes('array') || lowerCommand.includes('element')) {
            return `// ${command}
// Working with arrays

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Find element
function findElement(arr, target) {
    return arr.find(item => item === target);
}

// Filter elements
function filterElements(arr, condition) {
    return arr.filter(condition);
}

// Transform elements
function transformElements(arr, transformer) {
    return arr.map(transformer);
}

// Reduce to single value
function reduceArray(arr, reducer, initial) {
    return arr.reduce(reducer, initial);
}

// Example usage
console.log('Original array:', array);
console.log('Find 5:', findElement(array, 5));
console.log('Filter even:', filterElements(array, n => n % 2 === 0));
console.log('Double all:', transformElements(array, n => n * 2));
console.log('Sum all:', reduceArray(array, (a, b) => a + b, 0));`;
        }

        // Number/calculate related
        if (lowerCommand.includes('number') || lowerCommand.includes('calculate') || lowerCommand.includes('compute')) {
            return `// ${command}
// Number operations and calculations

function calculate(num) {
    return {
        square: num * num,
        cube: num * num * num,
        sqrt: Math.sqrt(num),
        isEven: num % 2 === 0,
        isOdd: num % 2 !== 0,
        isPrime: isPrime(num),
        factorial: factorial(num),
        digits: num.toString().split('').map(Number)
    };
}

function isPrime(n) {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// Test
const num = 7;
console.log(\`Properties of \${num}:\`, calculate(num));`;
        }

        // String/text related
        if (lowerCommand.includes('string') || lowerCommand.includes('text') || lowerCommand.includes('word')) {
            return `// ${command}
// String manipulation utilities

const text = "Hello World Programming";

// Common string operations
const operations = {
    reversed: text.split('').reverse().join(''),
    uppercase: text.toUpperCase(),
    lowercase: text.toLowerCase(),
    length: text.length,
    words: text.split(' '),
    wordCount: text.split(' ').length,
    charCount: text.replace(/\\s/g, '').length,
    firstChar: text[0],
    lastChar: text[text.length - 1],
    isPalindrome: text.toLowerCase() === text.toLowerCase().split('').reverse().join('')
};

console.log('Original:', text);
console.log('Operations:', operations);`;
        }

        // Function/method creation
        if (lowerCommand.includes('function') || lowerCommand.includes('method')) {
            const funcName = extractName(command) || 'myFunction';
            return `// ${command}
// Function implementation template

function ${funcName}(param1, param2) {
    // Input validation
    if (param1 === undefined) {
        throw new Error('param1 is required');
    }

    // Main logic
    const result = param1 + (param2 || 0);

    // Return result
    return result;
}

// Arrow function version
const ${funcName}Arrow = (param1, param2 = 0) => param1 + param2;

// Async version
async function ${funcName}Async(param) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(param), 100);
    });
}

// Test
console.log('Function result:', ${funcName}(5, 3));
console.log('Arrow result:', ${funcName}Arrow(5, 3));
${funcName}Async('async result').then(console.log);`;
        }

        if (lowerCommand.includes('loop') || lowerCommand.includes('iterate')) {
            return `// ${command}
const items = [1, 2, 3, 4, 5];

// For loop
for (let i = 0; i < items.length; i++) {
    console.log('Item:', items[i]);
}

// forEach
items.forEach((item, index) => {
    console.log(\`Index \${index}: \${item}\`);
});

// map - transform
const doubled = items.map(item => item * 2);
console.log('Doubled:', doubled);

// filter - select
const evens = items.filter(item => item % 2 === 0);
console.log('Evens:', evens);

// reduce - aggregate
const sum = items.reduce((acc, item) => acc + item, 0);
console.log('Sum:', sum);`;
        }

        if (lowerCommand.includes('class') || lowerCommand.includes('object')) {
            const className = extractName(command) || 'MyClass';
            return `// ${command}
class ${className} {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    // Getter
    get info() {
        return \`\${this.name}: \${this.value}\`;
    }

    // Setter
    set updateValue(newValue) {
        this.value = newValue;
    }

    // Instance method
    process() {
        return this.value * 2;
    }

    // Static method
    static create(name, value) {
        return new ${className}(name, value);
    }
}

// Usage
const instance = new ${className}('Test', 42);
console.log('Info:', instance.info);
console.log('Processed:', instance.process());

const staticInstance = ${className}.create('Static', 100);
console.log('Static created:', staticInstance.info);`;
        }

        // Check/validate/verify related
        if (lowerCommand.includes('check') || lowerCommand.includes('validate') || lowerCommand.includes('verify')) {
            return `// ${command}
// Validation utilities

function validate(value, rules) {
    const errors = [];

    if (rules.required && !value) {
        errors.push('Value is required');
    }
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(\`Minimum length is \${rules.minLength}\`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(\`Maximum length is \${rules.maxLength}\`);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push('Invalid format');
    }

    return { isValid: errors.length === 0, errors };
}

// Test validations
console.log('Email check:', validate('test@email.com', {
    required: true,
    pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
}));

console.log('Password check:', validate('abc', {
    required: true,
    minLength: 8
}));`;
        }

        // Default fallback - helpful template
        return `// ${command}
// J.A.R.V.I.S. Code Template

/**
 * Main function for: ${command}
 * Modify this template to implement your solution
 */
function solution(input) {
    // Step 1: Parse/validate input
    if (!input) {
        throw new Error('Input is required');
    }

    // Step 2: Process the input
    const result = processInput(input);

    // Step 3: Return the result
    return result;
}

function processInput(data) {
    // Add your processing logic here
    // This is where the main algorithm goes

    // Example: if working with arrays
    if (Array.isArray(data)) {
        return data.map(item => item);
    }

    // Example: if working with strings
    if (typeof data === 'string') {
        return data.trim();
    }

    // Example: if working with numbers
    if (typeof data === 'number') {
        return data;
    }

    return data;
}

// Test your solution
const testData = [1, 2, 3, 4, 5];
console.log('Input:', testData);
console.log('Result:', solution(testData));

// Try with different inputs
console.log('String:', solution('Hello World'));
console.log('Number:', solution(42));`;
    };

    const extractName = (command) => {
        const words = command.split(' ');
        const idx = words.findIndex(w => w.toLowerCase() === 'called' || w.toLowerCase() === 'named');
        if (idx !== -1 && words[idx + 1]) {
            return words[idx + 1].replace(/[^a-zA-Z]/g, '');
        }
        return null;
    };

    // Manual command processing
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            processCommand(manualInput);
            setManualInput('');
        }
    };

    // Copy code
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { }
    };

    // Download code
    const downloadCode = () => {
        const blob = new Blob([generatedCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jarvis-generated.js';
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'listening': return '🎤';
            case 'processing': return '🧠';
            case 'success': return '✅';
            case 'error': return '❌';
            default: return '💤';
        }
    };

    return (
        <>
            <Helmet>
                <title>J.A.R.V.I.S. Voice Assistant | StudySphere</title>
            </Helmet>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" sx={{
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            background: 'linear-gradient(45deg, #00f0ff, #9c27b0)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            <Psychology sx={{ color: '#00f0ff', fontSize: 40 }} />
                            J.A.R.V.I.S. Voice Assistant
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Generate complete programs using voice commands
                        </Typography>
                    </Box>
                    <Chip
                        icon={<span>{getStatusIcon()}</span>}
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        color={status === 'success' ? 'success' : status === 'error' ? 'error' : 'default'}
                    />
                </Box>

                {!isSpeechSupported && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Voice recognition not supported in your browser. Use the text input below or try Chrome/Edge.
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Voice Control */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)' }}>
                            {/* Big Microphone Button */}
                            <Tooltip title={isListening ? 'Click to Stop' : 'Click to Start'}>
                                <IconButton
                                    onClick={toggleListening}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: isListening ? 'error.main' : 'primary.main',
                                        color: 'white',
                                        mb: 3,
                                        transition: 'all 0.3s',
                                        boxShadow: isListening
                                            ? '0 0 40px rgba(244, 67, 54, 0.6)'
                                            : '0 0 20px rgba(25, 118, 210, 0.4)',
                                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(1)' },
                                            '50%': { transform: 'scale(1.05)' },
                                            '100%': { transform: 'scale(1)' }
                                        },
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                        },
                                    }}
                                >
                                    {isListening ? <MicOff sx={{ fontSize: 50 }} /> : <Mic sx={{ fontSize: 50 }} />}
                                </IconButton>
                            </Tooltip>

                            <Typography variant="h6" gutterBottom>
                                {isListening ? 'Listening...' : 'Click to Speak'}
                            </Typography>

                            {/* Transcript */}
                            <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.3)', minHeight: 60 }}>
                                <Typography variant="body2" color={transcript ? 'text.primary' : 'text.secondary'}>
                                    {transcript || 'Your voice command will appear here...'}
                                </Typography>
                            </Paper>

                            {/* Manual Input */}
                            <form onSubmit={handleManualSubmit}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="Or type a command..."
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    type="submit"
                                    disabled={!manualInput.trim()}
                                >
                                    Generate Code
                                </Button>
                            </form>

                            <Divider sx={{ my: 3 }} />

                            {/* Quick Commands */}
                            <Typography variant="subtitle2" gutterBottom>
                                Try saying:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                                {Object.keys(PROGRAM_TEMPLATES).slice(0, 4).map(cmd => (
                                    <Chip
                                        key={cmd}
                                        label={cmd}
                                        size="small"
                                        onClick={() => processCommand(cmd)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Paper>

                        {/* Command History */}
                        {commandHistory.length > 0 && (
                            <Paper sx={{ mt: 2, p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <History fontSize="small" /> Recent Commands
                                </Typography>
                                <List dense>
                                    {commandHistory.slice(0, 5).map((item, idx) => (
                                        <ListItem
                                            key={idx}
                                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                            onClick={() => processCommand(item.command)}
                                        >
                                            <ListItemText
                                                primary={item.command}
                                                secondary={item.template}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Grid>

                    {/* Generated Code */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: '100%', background: 'rgba(0,0,0,0.3)' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Code /> Generated Program
                                </Typography>
                                {generatedCode && (
                                    <Box display="flex" gap={1}>
                                        <Tooltip title="Download">
                                            <IconButton onClick={downloadCode} size="small">
                                                <Download />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                                            <IconButton onClick={copyToClipboard} color={copied ? 'success' : 'default'} size="small">
                                                {copied ? <Check /> : <ContentCopy />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ height: 500, overflow: 'auto', borderRadius: 1 }}>
                                {generatedCode ? (
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={vscDarkPlus}
                                        customStyle={{
                                            margin: 0,
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            height: '100%',
                                        }}
                                    >
                                        {generatedCode}
                                    </SyntaxHighlighter>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Box>
                                            <Psychology sx={{ fontSize: 80, opacity: 0.2, mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                Say or type a command to generate code
                                            </Typography>
                                            <Typography variant="body2" color="text.disabled" mt={1}>
                                                Try: "calculator", "todo list", "login form", "weather app"
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default JarvisPage;
