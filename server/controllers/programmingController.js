const { VM } = require('vm2');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const dockerExecutionService = require('../services/dockerExecutionService');

// Models
const Session = require('../models/Session');
const Challenge = require('../models/Challenge');
const Tutorial = require('../models/Tutorial');

/**
 * Execute code in a secure Docker container
 */
exports.executeCode = asyncHandler(async (req, res) => {
  const { code, language, input, sessionId } = req.body;
  
  if (!code || !code.trim()) {
    throw new ApiError('Code is required', 400);
  }
  
  // Default to JavaScript if language isn't specified
  const lang = (language || 'javascript').toLowerCase();
  
  // Validate language support
  const availableLanguages = dockerExecutionService.getAvailableLanguages();
  if (!availableLanguages.includes(lang)) {
    throw new ApiError(`Language '${lang}' is not supported. Available languages: ${availableLanguages.join(', ')}`, 400);
  }
  
  try {
    // Check Docker health
    const dockerHealth = await dockerExecutionService.checkDockerHealth();
    if (!dockerHealth.healthy) {
      // Fallback to VM2 for JavaScript only
      if (lang === 'javascript') {
        console.warn('Docker unavailable, falling back to VM2 for JavaScript execution');
        return await executeJavaScriptFallback(code, req, res);
      } else {
        throw new ApiError(`Docker is unavailable: ${dockerHealth.message}. Only JavaScript execution is available as fallback.`, 503);
      }
    }
    
    // Execute code in Docker container
    const result = await dockerExecutionService.executeCode(code, lang, input || '');
    
    // Update session if sessionId is provided
    if (sessionId) {
      try {
        const session = await Session.findOne({ 
          _id: sessionId, 
          user: req.user.id 
        });
        
        if (session) {
          session.code = code;
          session.language = lang;
          session.lastExecuted = new Date();
          session.executionHistory.push({
            timestamp: new Date(),
            output: result.output,
            error: result.error
          });
          
          // Keep only last 10 execution records
          if (session.executionHistory.length > 10) {
            session.executionHistory = session.executionHistory.slice(-10);
          }
          
          await session.save();
        }
      } catch (sessionError) {
        console.error('Session update error:', sessionError.message);
        // Don't fail the execution if session update fails
      }
    }
    
    // Emit execution result to connected clients in real-time
    if (req.io && sessionId) {
      req.io.emit('codeExecutionResult', {
        sessionId,
        userId: req.user.id,
        result
      });
    }
    
    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
      language: result.language
    });
    
  } catch (err) {
    console.error('Code execution error:', err);
    
    res.json({
      success: false,
      output: null,
      error: err.message || 'An error occurred during code execution',
      executionTime: null,
      memoryUsage: null,
      language: lang
    });
  }
});

/**
 * Fallback JavaScript execution using VM2 when Docker is unavailable
 */
async function executeJavaScriptFallback(code, req, res) {
  let result = '';
  let error = null;
  const startTime = Date.now();
  
  try {
    // Set up a secure sandbox with enhanced console
    const vm = new VM({
      timeout: 10000, // 10 seconds timeout
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
    
    return res.json({
      success: true,
      output: result || 'Code executed successfully (no output)',
      error: null,
      executionTime,
      memoryUsage: null, // VM2 doesn't provide memory stats
      language: 'javascript'
    });
    
  } catch (err) {
    const executionTime = Date.now() - startTime;
    
    return res.json({
      success: false,
      output: result,
      error: err.message || 'JavaScript execution failed',
      executionTime,
      memoryUsage: null,
      language: 'javascript'
    });
  }
}

/**
 * Get all code sessions for the authenticated user
 */
exports.getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ user: req.user.id })
    .sort({ updatedAt: -1 })
    .lean();
    
  res.json(sessions);
});

/**
 * Create a new code session
 */
exports.createSession = asyncHandler(async (req, res) => {
  const { title, code, language } = req.body;
  
  if (!title) {
    throw new ApiError('Title is required', 400);
  }
  
  const session = await Session.create({
    title,
    code: code || '',
    language: language || 'javascript',
    user: req.user.id
  });
  
  res.status(201).json(session);
});

/**
 * Get a specific code session by ID
 */
exports.getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ 
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!session) {
    throw new ApiError('Session not found', 404);
  }
  
  res.json(session);
});

/**
 * Update a code session
 */
exports.updateSession = asyncHandler(async (req, res) => {
  const { title, code, language } = req.body;
  const sessionId = req.params.id;
  
  // Find session
  let session = await Session.findOne({
    _id: sessionId,
    user: req.user.id
  });
  
  if (!session) {
    throw new ApiError('Session not found', 404);
  }
  
  // Update fields
  session.title = title || session.title;
  session.code = code !== undefined ? code : session.code;
  session.language = language || session.language;
  
  await session.save();
  
  res.json(session);
});

/**
 * Delete a code session
 */
exports.deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!session) {
    throw new ApiError('Session not found', 404);
  }
  
  res.json({ message: 'Session deleted successfully' });
});

/**
 * Get all programming challenges for the user's college
 */
exports.getChallenges = asyncHandler(async (req, res) => {
  let challenges;
  
  // If user belongs to a college, get challenges for that college
  if (req.user.college) {
    challenges = await Challenge.find({
      $or: [
        { college: req.user.college },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });
  } else {
    // If user doesn't belong to a college, only get public challenges
    challenges = await Challenge.find({ isPublic: true })
      .sort({ createdAt: -1 });
  }
  
  res.json(challenges);
});

/**
 * Create a new programming challenge
 */
exports.createChallenge = asyncHandler(async (req, res) => {
  const { title, description, difficulty, starterCode, language, testCases, isPublic } = req.body;
  
  if (!title || !description) {
    throw new ApiError('Title and description are required', 400);
  }
  
  const challenge = await Challenge.create({
    title,
    description,
    difficulty: difficulty || 'medium',
    starterCode: starterCode || '',
    language: language || 'javascript',
    testCases: testCases || [],
    createdBy: req.user.id,
    college: req.user.college,
    isPublic: isPublic !== undefined ? isPublic : false
  });
  
  res.status(201).json(challenge);
});

/**
 * Get a specific challenge by ID
 */
exports.getChallengeById = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)
    .populate('createdBy', 'name avatar');
  
  if (!challenge) {
    throw new ApiError('Challenge not found', 404);
  }
  
  // Check if user can access this challenge
  if (!challenge.isPublic && 
      (!req.user.college || challenge.college.toString() !== req.user.college.toString())) {
    throw new ApiError('Not authorized to access this challenge', 403);
  }
  
  res.json(challenge);
});

/**
 * Update a challenge
 */
exports.updateChallenge = asyncHandler(async (req, res) => {
  const { title, description, difficulty, starterCode, language, testCases, isPublic } = req.body;
  
  // Find challenge
  let challenge = await Challenge.findById(req.params.id);
  
  if (!challenge) {
    throw new ApiError('Challenge not found', 404);
  }
  
  // Check if user is the creator of the challenge
  if (challenge.createdBy.toString() !== req.user.id) {
    throw new ApiError('Not authorized to update this challenge', 403);
  }
  
  // Update fields
  challenge.title = title || challenge.title;
  challenge.description = description || challenge.description;
  challenge.difficulty = difficulty || challenge.difficulty;
  challenge.starterCode = starterCode !== undefined ? starterCode : challenge.starterCode;
  challenge.language = language || challenge.language;
  challenge.testCases = testCases || challenge.testCases;
  challenge.isPublic = isPublic !== undefined ? isPublic : challenge.isPublic;
  
  await challenge.save();
  
  res.json(challenge);
});

/**
 * Delete a challenge
 */
exports.deleteChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  
  if (!challenge) {
    throw new ApiError('Challenge not found', 404);
  }
  
  // Check if user is the creator of the challenge
  if (challenge.createdBy.toString() !== req.user.id) {
    throw new ApiError('Not authorized to delete this challenge', 403);
  }
  
  await challenge.remove();
  
  res.json({ message: 'Challenge deleted successfully' });
});

/**
 * Get all tutorials
 */
exports.getTutorials = asyncHandler(async (req, res) => {
  const tutorials = await Tutorial.find()
    .sort({ order: 1 });
    
  res.json(tutorials);
});

/**
 * Get a tutorial by slug
 */
exports.getTutorialBySlug = asyncHandler(async (req, res) => {
  const tutorial = await Tutorial.findOne({ slug: req.params.slug });
  
  if (!tutorial) {
    throw new ApiError('Tutorial not found', 404);
  }
  
  res.json(tutorial);
});

/**
 * Get available programming languages
 */
exports.getLanguages = asyncHandler(async (req, res) => {
  const languages = dockerExecutionService.getAvailableLanguages();
  const languageDetails = languages.map(lang => {
    const config = dockerExecutionService.getLanguageConfig(lang);
    return {
      name: lang,
      displayName: lang.charAt(0).toUpperCase() + lang.slice(1),
      extension: config.extension,
      dockerImage: config.image,
      supportsInput: true,
      supportsCompilation: !!config.compileCommand
    };
  });
  
  res.json({
    languages: languageDetails,
    defaultLanguage: 'javascript'
  });
});

/**
 * Check Docker service health
 */
exports.getExecutionHealth = asyncHandler(async (req, res) => {
  const dockerHealth = await dockerExecutionService.checkDockerHealth();
  
  res.json({
    docker: dockerHealth,
    vm2Fallback: true, // VM2 is always available for JavaScript
    supportedLanguages: dockerHealth.healthy 
      ? dockerExecutionService.getAvailableLanguages()
      : ['javascript'],
    timestamp: new Date().toISOString()
  });
});

/**
 * Stop running code execution (for future implementation)
 */
exports.stopExecution = asyncHandler(async (req, res) => {
  // This would be used to stop long-running executions
  // For now, we'll just return a success message
  res.json({
    success: true,
    message: 'Execution stop requested'
  });
});

/**
 * Get code templates for different languages
 */
exports.getCodeTemplates = asyncHandler(async (req, res) => {
  const templates = {
    javascript: {
      helloWorld: `// JavaScript Hello World
console.log("Hello, World!");

// Variables and data types
let name = "Student";
let age = 20;
let isActive = true;

console.log(\`Name: \${name}, Age: \${age}, Active: \${isActive}\`);`,
      
      functions: `// JavaScript Functions
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Arrow function
const add = (a, b) => a + b;

// Function usage
console.log(greet("World"));
console.log("5 + 3 =", add(5, 3));`,
      
      arrays: `// JavaScript Arrays
const numbers = [1, 2, 3, 4, 5];
const fruits = ["apple", "banana", "orange"];

// Array methods
console.log("Numbers:", numbers);
console.log("Doubled numbers:", numbers.map(n => n * 2));
console.log("Even numbers:", numbers.filter(n => n % 2 === 0));

// Array iteration
fruits.forEach((fruit, index) => {
    console.log(\`\${index + 1}. \${fruit}\`);
});`
    },
    
    python: {
      helloWorld: `# Python Hello World
print("Hello, World!")

# Variables and data types
name = "Student"
age = 20
is_active = True

print(f"Name: {name}, Age: {age}, Active: {is_active}")`,
      
      functions: `# Python Functions
def greet(name):
    return f"Hello, {name}!"

# Lambda function
add = lambda a, b: a + b

# Function usage
print(greet("World"))
print("5 + 3 =", add(5, 3))`,
      
      lists: `# Python Lists
numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "orange"]

# List comprehensions
print("Numbers:", numbers)
print("Doubled numbers:", [n * 2 for n in numbers])
print("Even numbers:", [n for n in numbers if n % 2 == 0])

# List iteration
for i, fruit in enumerate(fruits, 1):
    print(f"{i}. {fruit}")`
    },
    
    java: {
      helloWorld: `// Java Hello World
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Variables and data types
        String name = "Student";
        int age = 20;
        boolean isActive = true;
        
        System.out.println("Name: " + name + ", Age: " + age + ", Active: " + isActive);
    }
}`,
      
      methods: `// Java Methods
public class Main {
    // Static method
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    // Static method for addition
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        System.out.println(greet("World"));
        System.out.println("5 + 3 = " + add(5, 3));
    }
}`,
      
      arrays: `// Java Arrays
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        String[] fruits = {"apple", "banana", "orange"};
        
        System.out.println("Numbers: " + Arrays.toString(numbers));
        
        // Array iteration
        for (int i = 0; i < fruits.length; i++) {
            System.out.println((i + 1) + ". " + fruits[i]);
        }
        
        // Enhanced for loop
        System.out.println("\\nUsing enhanced for loop:");
        for (String fruit : fruits) {
            System.out.println("Fruit: " + fruit);
        }
    }
}`
    },
    
    cpp: {
      helloWorld: `// C++ Hello World
#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    // Variables and data types
    std::string name = "Student";
    int age = 20;
    bool isActive = true;
    
    std::cout << "Name: " << name << ", Age: " << age << ", Active: " << isActive << std::endl;
    
    return 0;
}`,
      
      functions: `// C++ Functions
#include <iostream>

// Function declaration
std::string greet(const std::string& name);
int add(int a, int b);

int main() {
    std::cout << greet("World") << std::endl;
    std::cout << "5 + 3 = " << add(5, 3) << std::endl;
    
    return 0;
}

// Function definitions
std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int add(int a, int b) {
    return a + b;
}`,
      
      arrays: `// C++ Arrays and Vectors
#include <iostream>
#include <vector>
#include <string>

int main() {
    // Traditional array
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    // Vector (dynamic array)
    std::vector<std::string> fruits = {"apple", "banana", "orange"};
    
    std::cout << "Numbers: ";
    for (int i = 0; i < size; i++) {
        std::cout << numbers[i] << " ";
    }
    std::cout << std::endl;
    
    std::cout << "Fruits:" << std::endl;
    for (size_t i = 0; i < fruits.size(); i++) {
        std::cout << (i + 1) << ". " << fruits[i] << std::endl;
    }
    
    return 0;
}`
    }
  };
  
  const { language } = req.query;
  
  if (language && templates[language]) {
    res.json({
      language,
      templates: templates[language]
    });
  } else {
    res.json({
      availableLanguages: Object.keys(templates),
      templates
    });
  }
});

/**
 * Save code snippet
 */
exports.saveSnippet = asyncHandler(async (req, res) => {
  const { title, code, language, description, tags } = req.body;
  
  if (!title || !code) {
    throw new ApiError('Title and code are required', 400);
  }
  
  // For now, we'll store snippets as sessions with a special flag
  const snippet = await Session.create({
    title: `[SNIPPET] ${title}`,
    code,
    language: language || 'javascript',
    user: req.user.id,
    isPublic: false,
    description,
    tags: tags || []
  });
  
  res.status(201).json({
    success: true,
    message: 'Code snippet saved successfully',
    snippet
  });
});

/**
 * Get a code session for a study room
 */
exports.getSessionByRoomId = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  // Find existing session for this room
  let session = await Session.findOne({ 
    roomId: roomId,
    user: req.user.id 
  });
  
  if (!session) {
    // Create a new session for this room if none exists
    session = await Session.create({
      title: `Room ${roomId} Session`,
      code: '// Start coding here\nconsole.log("Hello from study room!");',
      language: 'javascript',
      user: req.user.id,
      roomId: roomId
    });
  }
  
  res.json(session);
});

/**
 * Share code session
 */
exports.shareSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { isPublic, shareWith } = req.body;
  
  const session = await Session.findOne({
    _id: sessionId,
    user: req.user.id
  });
  
  if (!session) {
    throw new ApiError('Session not found', 404);
  }
  
  session.isPublic = isPublic !== undefined ? isPublic : true;
  
  if (shareWith && Array.isArray(shareWith)) {
    session.sharedWith = shareWith;
  }
  
  await session.save();
  
  res.json({
    success: true,
    message: 'Session sharing settings updated',
    session,
    shareUrl: `${process.env.CLIENT_URL}/programming/shared/${session._id}`
  });
});