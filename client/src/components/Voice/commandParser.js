/**
 * Command Parser - Parse voice commands into intents
 * Detects coding-related commands and extracts parameters
 */

// Command patterns with regex and handlers
const COMMAND_PATTERNS = [
    {
        pattern: /create (?:a )?function (?:to |that |which |for )?(.+)/i,
        intent: 'create_function',
        extract: (match) => ({ description: match[1] })
    },
    {
        pattern: /write (?:a )?(?:for )?loop (?:from )?(\d+) to (\d+)/i,
        intent: 'create_loop',
        extract: (match) => ({ start: parseInt(match[1]), end: parseInt(match[2]) })
    },
    {
        pattern: /add (?:a )?button(?: called| named| with text)? ?(.+)?/i,
        intent: 'create_button',
        extract: (match) => ({ text: match[1] || 'Click Me' })
    },
    {
        pattern: /add (?:a )?(?:text )?input(?: (?:for|called|named))? ?(.+)?/i,
        intent: 'create_input',
        extract: (match) => ({ placeholder: match[1] || 'Enter text' })
    },
    {
        pattern: /create (?:a )?(?:new )?(?:javascript )?class (?:called |named )?(\w+)/i,
        intent: 'create_class',
        extract: (match) => ({ name: match[1] })
    },
    {
        pattern: /create (?:a )?(?:new )?array (?:called |named )?(\w+)/i,
        intent: 'create_array',
        extract: (match) => ({ name: match[1] })
    },
    {
        pattern: /create (?:a )?(?:new )?object (?:called |named )?(\w+)/i,
        intent: 'create_object',
        extract: (match) => ({ name: match[1] })
    },
    {
        pattern: /(?:write|create|add) (?:a )?variable (?:called |named )?(\w+)(?: (?:with value|equals?) (.+))?/i,
        intent: 'create_variable',
        extract: (match) => ({ name: match[1], value: match[2] || 'null' })
    },
    {
        pattern: /(?:write|create|add) (?:an? )?if (?:statement )?(?:to )?check (?:if )?(.+)/i,
        intent: 'create_if',
        extract: (match) => ({ condition: match[1] })
    },
    {
        pattern: /console ?log (.+)/i,
        intent: 'console_log',
        extract: (match) => ({ message: match[1] })
    },
    {
        pattern: /(?:add|create|write) (?:a )?comment ?(.+)?/i,
        intent: 'create_comment',
        extract: (match) => ({ text: match[1] || 'TODO: Add comment' })
    },
    {
        pattern: /import (.+) from ["']?(.+)["']?/i,
        intent: 'create_import',
        extract: (match) => ({ what: match[1], from: match[2] })
    },
    {
        pattern: /export (?:default )?(.+)/i,
        intent: 'create_export',
        extract: (match) => ({ what: match[1], isDefault: match[0].includes('default') })
    },
    {
        pattern: /(?:create|write|add) (?:an? )?async function (?:to |that |which )?(.+)/i,
        intent: 'create_async_function',
        extract: (match) => ({ description: match[1] })
    },
    {
        pattern: /(?:create|write) (?:a )?react component (?:called |named )?(\w+)/i,
        intent: 'create_react_component',
        extract: (match) => ({ name: match[1] })
    },
    {
        pattern: /(?:create|add) (?:a )?(?:use)?state (?:for |called |named )?(\w+)/i,
        intent: 'create_useState',
        extract: (match) => ({ name: match[1] })
    },
    {
        pattern: /try ?catch/i,
        intent: 'create_try_catch',
        extract: () => ({})
    },
    {
        pattern: /fetch (?:data )?(?:from )?(.+)/i,
        intent: 'create_fetch',
        extract: (match) => ({ url: match[1] })
    }
];

/**
 * Parse a voice command into an intent
 * @param {string} command - The voice command text
 * @returns {Object|null} Parsed intent or null if not recognized
 */
export const parseCommand = (command) => {
    if (!command || typeof command !== 'string') {
        return null;
    }

    const normalizedCommand = command.toLowerCase().trim();

    for (const { pattern, intent, extract } of COMMAND_PATTERNS) {
        const match = normalizedCommand.match(pattern);
        if (match) {
            return {
                intent,
                params: extract(match),
                originalCommand: command,
                confidence: 0.85
            };
        }
    }

    // Fallback: Try to detect general coding intent
    if (normalizedCommand.includes('function') || normalizedCommand.includes('method')) {
        return {
            intent: 'create_function',
            params: { description: command },
            originalCommand: command,
            confidence: 0.5
        };
    }

    return null;
};

/**
 * Get suggestions for similar commands
 * @param {string} command - Unrecognized command
 * @returns {Array} List of suggested commands
 */
export const getSuggestions = (command) => {
    return [
        "create a function to...",
        "write a loop from X to Y",
        "add a button called...",
        "create a variable named...",
        "console log...",
    ];
};

export default { parseCommand, getSuggestions };
