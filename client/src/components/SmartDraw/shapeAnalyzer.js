/**
 * Shape Analyzer - Heuristic Classification Engine
 * Analyzes drawn shapes and classifies them into UI elements
 */

/**
 * Analyze shape metadata and classify into UI element types
 * @param {Object} shape - Shape data from Fabric.js
 * @returns {Object} Classification result
 */
export const analyzeShape = (shape) => {
    const { width, height, left, top, type, fill, stroke } = shape;

    // Calculate metrics
    const area = width * height;
    const aspectRatio = width / height;
    const isWide = aspectRatio > 3;
    const isShort = height < 60;
    const isTall = height > 200;
    const isLarge = area > 20000;
    const isSmall = area < 5000;

    // Classification rules
    let classification = {
        elementType: 'div',
        suggestedClass: 'container',
        confidence: 0.5,
        reasoning: ''
    };

    // Input field: Short and wide
    if (isShort && isWide) {
        classification = {
            elementType: 'input',
            suggestedClass: 'text-input',
            confidence: 0.85,
            reasoning: 'Short height with wide aspect ratio suggests an input field'
        };
    }
    // Button: Short and not very wide
    else if (isShort && !isWide && width > 60 && width < 200) {
        classification = {
            elementType: 'button',
            suggestedClass: 'btn-primary',
            confidence: 0.9,
            reasoning: 'Short, compact rectangle suggests a button'
        };
    }
    // Card: Large rectangle
    else if (isLarge && aspectRatio > 0.5 && aspectRatio < 2) {
        classification = {
            elementType: 'div',
            suggestedClass: 'card',
            confidence: 0.8,
            reasoning: 'Large, roughly square rectangle suggests a card container'
        };
    }
    // Navbar: Very wide and short
    else if (width > 400 && height < 80) {
        classification = {
            elementType: 'nav',
            suggestedClass: 'navbar',
            confidence: 0.85,
            reasoning: 'Very wide and short suggests a navigation bar'
        };
    }
    // Sidebar: Tall and narrow
    else if (isTall && aspectRatio < 0.5) {
        classification = {
            elementType: 'aside',
            suggestedClass: 'sidebar',
            confidence: 0.8,
            reasoning: 'Tall and narrow suggests a sidebar'
        };
    }
    // Image placeholder
    else if (type === 'circle' || (aspectRatio > 0.8 && aspectRatio < 1.2 && isSmall)) {
        classification = {
            elementType: 'img',
            suggestedClass: 'avatar',
            confidence: 0.75,
            reasoning: 'Square/circular shape suggests an image or avatar'
        };
    }
    // Text block
    else if (width > 200 && height > 60 && height < 150) {
        classification = {
            elementType: 'p',
            suggestedClass: 'text-block',
            confidence: 0.7,
            reasoning: 'Medium rectangle suggests a text paragraph'
        };
    }
    // Heading
    else if (width > 150 && height > 30 && height < 60) {
        classification = {
            elementType: 'h2',
            suggestedClass: 'heading',
            confidence: 0.7,
            reasoning: 'Wide short rectangle suggests a heading'
        };
    }
    // Default: generic container
    else {
        classification = {
            elementType: 'div',
            suggestedClass: 'container',
            confidence: 0.5,
            reasoning: 'Generic shape - defaulting to div container'
        };
    }

    return {
        ...classification,
        metadata: {
            width: Math.round(width),
            height: Math.round(height),
            x: Math.round(left),
            y: Math.round(top),
            area: Math.round(area),
            aspectRatio: aspectRatio.toFixed(2)
        }
    };
};

/**
 * Analyze multiple shapes and detect nesting relationships
 * @param {Array} shapes - Array of shape objects
 * @returns {Array} Analyzed shapes with nesting info
 */
export const analyzeLayout = (shapes) => {
    if (!shapes || shapes.length === 0) return [];

    // Sort by area (largest first for potential parents)
    const sortedShapes = [...shapes].sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;
        return areaB - areaA;
    });

    // Analyze each shape
    const analyzedShapes = sortedShapes.map(shape => ({
        ...shape,
        analysis: analyzeShape(shape),
        children: [],
        isNested: false
    }));

    // Detect nesting (if shape is inside another)
    for (let i = 0; i < analyzedShapes.length; i++) {
        for (let j = i + 1; j < analyzedShapes.length; j++) {
            const parent = analyzedShapes[i];
            const child = analyzedShapes[j];

            // Check if child is inside parent
            const parentRight = parent.left + parent.width;
            const parentBottom = parent.top + parent.height;
            const childRight = child.left + child.width;
            const childBottom = child.top + child.height;

            if (child.left > parent.left &&
                child.top > parent.top &&
                childRight < parentRight &&
                childBottom < parentBottom) {
                parent.children.push(child);
                child.isNested = true;
            }
        }
    }

    return analyzedShapes;
};

export default { analyzeShape, analyzeLayout };
