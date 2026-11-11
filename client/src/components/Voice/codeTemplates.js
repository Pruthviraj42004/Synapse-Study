/**
 * Code Templates - Generate code snippets from intents
 * Template-based code generation for common programming patterns
 */

/**
 * Generate function name from description
 * @param {string} description - Natural language description
 * @returns {string} camelCase function name
 */
const generateFunctionName = (description) => {
    if (!description) return 'myFunction';

    // Extract key words and convert to camelCase
    const words = description
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(word => !['a', 'an', 'the', 'to', 'that', 'which', 'for', 'and', 'or'].includes(word))
        .slice(0, 4);

    if (words.length === 0) return 'myFunction';

    return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
};

/**
 * Code templates for different intents
 */
const templates = {
    create_function: ({ description }) => {
        const name = generateFunctionName(description);
        return `/**
 * ${description || 'Function description'}
 */
function ${name}(param) {
    // TODO: Implement ${description || 'function logic'}
    
    return result;
}`;
    },

    create_async_function: ({ description }) => {
        const name = generateFunctionName(description);
        return `/**
 * ${description || 'Async function description'}
 */
async function ${name}(param) {
    try {
        // TODO: Implement ${description || 'async logic'}
        
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}`;
    },

    create_loop: ({ start, end }) => {
        return `for (let i = ${start}; i <= ${end}; i++) {
    console.log(i);
    // TODO: Add loop logic
}`;
    },

    create_button: ({ text }) => {
        return `<button 
    onClick={handleClick}
    className="btn-primary"
>
    ${text}
</button>`;
    },

    create_input: ({ placeholder }) => {
        return `<input
    type="text"
    placeholder="${placeholder}"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="text-input"
/>`;
    },

    create_class: ({ name }) => {
        const className = name.charAt(0).toUpperCase() + name.slice(1);
        return `class ${className} {
    constructor() {
        // Initialize properties
        this.property = null;
    }

    method() {
        // TODO: Implement method
    }

    static staticMethod() {
        // Static method implementation
    }
}`;
    },

    create_array: ({ name }) => {
        return `const ${name} = [
    // Add array items
];`;
    },

    create_object: ({ name }) => {
        return `const ${name} = {
    property1: 'value1',
    property2: 'value2',
    method() {
        // Method implementation
    }
};`;
    },

    create_variable: ({ name, value }) => {
        return `const ${name} = ${value};`;
    },

    create_if: ({ condition }) => {
        return `if (${condition}) {
    // Condition is true
} else {
    // Condition is false
}`;
    },

    console_log: ({ message }) => {
        const isVariable = !message.includes(' ') && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(message);
        if (isVariable) {
            return `console.log('${message}:', ${message});`;
        }
        return `console.log('${message}');`;
    },

    create_comment: ({ text }) => {
        if (text.length > 60) {
            return `/**
 * ${text}
 */`;
        }
        return `// ${text}`;
    },

    create_import: ({ what, from }) => {
        return `import ${what} from '${from}';`;
    },

    create_export: ({ what, isDefault }) => {
        return isDefault ? `export default ${what};` : `export { ${what} };`;
    },

    create_react_component: ({ name }) => {
        const componentName = name.charAt(0).toUpperCase() + name.slice(1);
        return `import React from 'react';

const ${componentName} = ({ props }) => {
    return (
        <div className="${name.toLowerCase()}-container">
            <h2>${componentName}</h2>
            {/* Component content */}
        </div>
    );
};

export default ${componentName};`;
    },

    create_useState: ({ name }) => {
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        return `const [${name}, set${capitalizedName}] = useState(null);`;
    },

    create_try_catch: () => {
        return `try {
    // Code that might throw an error
    
} catch (error) {
    console.error('Error:', error);
} finally {
    // Cleanup code (optional)
}`;
    },

    create_fetch: ({ url }) => {
        const cleanUrl = url.replace(/^["']|["']$/g, '');
        return `const fetchData = async () => {
    try {
        const response = await fetch('${cleanUrl}');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};`;
    }
};

/**
 * Generate code from parsed intent
 * @param {Object} parsedIntent - Parsed intent from command parser
 * @returns {string} Generated code
 */
export const generateCodeFromIntent = (parsedIntent) => {
    if (!parsedIntent || !parsedIntent.intent) {
        return null;
    }

    const template = templates[parsedIntent.intent];
    if (!template) {
        return `// Unrecognized command: ${parsedIntent.originalCommand}`;
    }

    return template(parsedIntent.params);
};

/**
 * Get all available command categories
 * @returns {Array} List of command categories with examples
 */
export const getCommandCategories = () => [
    {
        category: 'Functions',
        examples: [
            'Create a function to calculate sum',
            'Create an async function to fetch users',
        ]
    },
    {
        category: 'Control Flow',
        examples: [
            'Write a loop from 1 to 10',
            'Create an if statement to check if x is greater than 5',
            'Try catch',
        ]
    },
    {
        category: 'Variables',
        examples: [
            'Create a variable named count',
            'Create an array called items',
            'Create an object named user',
        ]
    },
    {
        category: 'React',
        examples: [
            'Create a React component called Header',
            'Create a useState for loading',
        ]
    },
    {
        category: 'UI Elements',
        examples: [
            'Add a button called Submit',
            'Add an input for email',
        ]
    },
    {
        category: 'Other',
        examples: [
            'Console log the result',
            'Add a comment TODO',
            'Fetch data from API',
        ]
    }
];

export default { generateCodeFromIntent, getCommandCategories };
