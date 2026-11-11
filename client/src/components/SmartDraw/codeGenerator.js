/**
 * Code Generator - Converts shape analysis to HTML/CSS code
 * Generates clean, formatted code from UI element classifications
 */

/**
 * Generate HTML element code from shape analysis
 * @param {Object} analysis - Shape analysis result
 * @returns {string} Generated HTML code
 */
export const generateElementCode = (analysis) => {
    const { elementType, suggestedClass, metadata } = analysis;

    switch (elementType) {
        case 'input':
            return `<input 
    type="text" 
    class="${suggestedClass}" 
    placeholder="Enter text here..."
    style="width: ${metadata.width}px; height: ${metadata.height}px;"
/>`;

        case 'button':
            return `<button class="${suggestedClass}">
    Click Me
</button>`;

        case 'nav':
            return `<nav class="${suggestedClass}">
    <a href="#" class="nav-link">Home</a>
    <a href="#" class="nav-link">About</a>
    <a href="#" class="nav-link">Contact</a>
</nav>`;

        case 'aside':
            return `<aside class="${suggestedClass}">
    <ul class="sidebar-menu">
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
        <li>Menu Item 3</li>
    </ul>
</aside>`;

        case 'img':
            return `<img 
    src="https://via.placeholder.com/${metadata.width}x${metadata.height}" 
    alt="Placeholder image"
    class="${suggestedClass}"
/>`;

        case 'p':
            return `<p class="${suggestedClass}">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
</p>`;

        case 'h2':
            return `<h2 class="${suggestedClass}">
    Section Heading
</h2>`;

        case 'div':
        default:
            if (suggestedClass === 'card') {
                return `<div class="${suggestedClass}">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content goes here...</p>
    </div>
    <div class="card-footer">
        <button class="btn-primary">Action</button>
    </div>
</div>`;
            }
            return `<div class="${suggestedClass}">
    <!-- Container content -->
</div>`;
    }
};

/**
 * Generate CSS for a shape analysis
 * @param {Object} analysis - Shape analysis result
 * @returns {string} Generated CSS code
 */
export const generateCSS = (analysis) => {
    const { suggestedClass, metadata } = analysis;

    const baseStyles = `
.${suggestedClass} {
    width: ${metadata.width}px;
    height: ${metadata.height}px;
    position: relative;
}`;

    const additionalStyles = {
        'text-input': `
.text-input {
    padding: 12px 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease;
}
.text-input:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}`,
        'btn-primary': `
.btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}`,
        'card': `
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}
.card-body {
    padding: 20px;
}
.card-footer {
    padding: 16px 20px;
    border-top: 1px solid #eee;
    background: #f9f9f9;
}`,
        'navbar': `
.navbar {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
    background: #1a1a2e;
    color: white;
}
.nav-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.2s ease;
}
.nav-link:hover {
    color: white;
}`,
        'sidebar': `
.sidebar {
    background: #f5f5f5;
    padding: 20px;
}
.sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
}
.sidebar-menu li {
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
}
.sidebar-menu li:hover {
    background: rgba(0, 123, 255, 0.1);
}`
    };

    return baseStyles + (additionalStyles[suggestedClass] || '');
};

/**
 * Generate complete code from multiple analyzed shapes
 * @param {Array} analyzedShapes - Array of analyzed shapes with nesting info
 * @returns {Object} Generated HTML and CSS
 */
export const generateCompleteCode = (analyzedShapes) => {
    if (!analyzedShapes || analyzedShapes.length === 0) {
        return { html: '', css: '' };
    }

    // Get top-level shapes (not nested inside others)
    const topLevelShapes = analyzedShapes.filter(s => !s.isNested);

    let htmlParts = [];
    let cssParts = new Set();

    const processShape = (shape, indent = 0) => {
        const indentStr = '    '.repeat(indent);
        const elementCode = generateElementCode(shape.analysis);
        cssParts.add(generateCSS(shape.analysis));

        if (shape.children && shape.children.length > 0) {
            // For shapes with children, wrap them
            const childrenCode = shape.children.map(c => processShape(c, indent + 1)).join('\n');

            // If it's a div with children, include them inside
            if (shape.analysis.elementType === 'div') {
                return `${indentStr}<div class="${shape.analysis.suggestedClass}">
${childrenCode}
${indentStr}</div>`;
            }
        }

        return indentStr + elementCode.split('\n').join('\n' + indentStr);
    };

    topLevelShapes.forEach(shape => {
        htmlParts.push(processShape(shape));
    });

    return {
        html: htmlParts.join('\n\n'),
        css: Array.from(cssParts).join('\n')
    };
};

export default { generateElementCode, generateCSS, generateCompleteCode };
