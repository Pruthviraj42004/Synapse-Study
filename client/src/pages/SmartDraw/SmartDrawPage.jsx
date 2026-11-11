/**
 * Smart Draw Page - UI Design to Code
 * Standalone page for designing UI and generating React/HTML code
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Tooltip,
    Chip, Divider, Alert, CircularProgress, Tabs, Tab, Grid,
    Card, CardContent, Slider, ToggleButton, ToggleButtonGroup,
    Snackbar, Fab,
} from '@mui/material';
import {
    Brush, Delete, Undo, Code, AutoAwesome, Rectangle, Circle,
    ContentCopy, Check, Download, Add, TextFields, Image,
    ViewModule, CropSquare, RadioButtonUnchecked, HorizontalRule,
    FormatColorFill, GridOn, Layers,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { fabric } from 'fabric';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Pre-made UI component templates
const UI_TEMPLATES = [
    { id: 'button', name: 'Button', icon: <CropSquare />, width: 120, height: 45, color: '#1976d2' },
    { id: 'input', name: 'Input Field', icon: <HorizontalRule />, width: 250, height: 45, color: '#333' },
    { id: 'card', name: 'Card', icon: <ViewModule />, width: 300, height: 200, color: '#424242' },
    { id: 'navbar', name: 'Navbar', icon: <HorizontalRule />, width: 500, height: 60, color: '#1a1a2e' },
    { id: 'sidebar', name: 'Sidebar', icon: <ViewModule />, width: 80, height: 300, color: '#2d2d44' },
    { id: 'heading', name: 'Heading', icon: <TextFields />, width: 200, height: 40, color: '#9c27b0' },
    { id: 'image', name: 'Image', icon: <Image />, width: 150, height: 150, color: '#666' },
    { id: 'form', name: 'Form', icon: <ViewModule />, width: 350, height: 250, color: '#37474f' },
];

const SmartDrawPage = () => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [shapes, setShapes] = useState([]);
    const [generatedCode, setGeneratedCode] = useState({ react: '', html: '', css: '' });
    const [codeTab, setCodeTab] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [selectedTool, setSelectedTool] = useState('select');
    const [showGrid, setShowGrid] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState('#00f0ff');
    const [brushWidth, setBrushWidth] = useState(3);

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 900,
            height: 550,
            backgroundColor: '#1e1e2e',
            selection: true,
        });

        fabricRef.current = canvas;

        // Add grid pattern
        if (showGrid) {
            addGrid(canvas);
        }

        canvas.on('object:added', updateShapesList);
        canvas.on('object:modified', updateShapesList);
        canvas.on('object:removed', updateShapesList);

        return () => {
            canvas.dispose();
        };
    }, []);

    // Add grid pattern to canvas
    const addGrid = (canvas) => {
        const gridSize = 20;
        for (let i = 0; i < canvas.width / gridSize; i++) {
            canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
                stroke: '#333',
                strokeWidth: 0.5,
                selectable: false,
                evented: false,
            }));
        }
        for (let i = 0; i < canvas.height / gridSize; i++) {
            canvas.add(new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
                stroke: '#333',
                strokeWidth: 0.5,
                selectable: false,
                evented: false,
            }));
        }
    };

    // Update shapes list from canvas
    const updateShapesList = useCallback(() => {
        if (!fabricRef.current) return;
        const objects = fabricRef.current.getObjects().filter(obj =>
            obj.type !== 'line' || obj.strokeWidth > 1
        );
        setShapes(objects.map(obj => ({
            type: obj.uiType || obj.type,
            left: obj.left,
            top: obj.top,
            width: obj.width * (obj.scaleX || 1),
            height: obj.height * (obj.scaleY || 1),
            fill: obj.fill,
            label: obj.label || '',
        })));
    }, []);

    // Toggle freehand drawing mode
    const toggleDrawing = () => {
        if (!fabricRef.current) return;
        const canvas = fabricRef.current;
        const newDrawingState = !isDrawing;
        canvas.isDrawingMode = newDrawingState;
        if (newDrawingState) {
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = brushWidth;
        }
        setIsDrawing(newDrawingState);
        setSnackbar({ open: true, message: newDrawingState ? '✏️ Drawing mode ON - draw freely!' : '🖱️ Selection mode ON' });
    };

    // Update brush settings
    const updateBrush = (color, width) => {
        if (!fabricRef.current) return;
        if (color) {
            setBrushColor(color);
            fabricRef.current.freeDrawingBrush.color = color;
        }
        if (width) {
            setBrushWidth(width);
            fabricRef.current.freeDrawingBrush.width = width;
        }
    };

    // Add UI template to canvas
    const addTemplate = (template) => {
        if (!fabricRef.current) return;

        const rect = new fabric.Rect({
            left: 50 + Math.random() * 300,
            top: 50 + Math.random() * 200,
            width: template.width,
            height: template.height,
            fill: 'transparent',
            stroke: template.color,
            strokeWidth: 2,
            rx: template.id === 'button' ? 8 : 4,
            ry: template.id === 'button' ? 8 : 4,
        });

        rect.uiType = template.id;
        rect.label = template.name;

        // Add label text
        const text = new fabric.Text(template.name, {
            left: rect.left + 10,
            top: rect.top + template.height / 2 - 8,
            fontSize: 14,
            fill: template.color,
            selectable: false,
        });

        const group = new fabric.Group([rect, text], {
            left: rect.left,
            top: rect.top,
        });
        group.uiType = template.id;
        group.label = template.name;

        fabricRef.current.add(group);
        fabricRef.current.setActiveObject(group);
        fabricRef.current.renderAll();

        setSnackbar({ open: true, message: `Added ${template.name}` });
    };

    // Clear canvas
    const clearCanvas = () => {
        if (!fabricRef.current) return;
        fabricRef.current.clear();
        fabricRef.current.backgroundColor = '#1e1e2e';
        if (showGrid) addGrid(fabricRef.current);
        fabricRef.current.renderAll();
        setShapes([]);
        setGeneratedCode({ react: '', html: '', css: '' });
    };

    // Generate code from shapes
    const generateCode = async () => {
        if (shapes.length === 0) {
            setSnackbar({ open: true, message: 'Add some UI components first!' });
            return;
        }

        setIsGenerating(true);
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

        // Sort shapes by position (top to bottom, left to right)
        const sortedShapes = [...shapes].sort((a, b) => {
            if (Math.abs(a.top - b.top) < 50) return a.left - b.left;
            return a.top - b.top;
        });

        let reactCode = `import React from 'react';
import './App.css';

const App = () => {
    return (
        <div className="app-container">
`;
        let htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My UI Design</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app-container">
`;
        let cssCode = `/* Generated CSS */
.app-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
    padding: 20px;
    position: relative;
}

`;

        sortedShapes.forEach((shape, idx) => {
            const className = `${shape.type}-${idx}`;

            switch (shape.type) {
                case 'button':
                    reactCode += `            <button className="${className}">Click Me</button>\n`;
                    htmlCode += `        <button class="${className}">Click Me</button>\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    height: ${Math.round(shape.height)}px;
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.${className}:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
}

`;
                    break;
                case 'input':
                    reactCode += `            <input className="${className}" placeholder="Enter text..." />\n`;
                    htmlCode += `        <input class="${className}" placeholder="Enter text..." />\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    height: ${Math.round(shape.height)}px;
    padding: 12px 16px;
    border: 2px solid #444;
    border-radius: 8px;
    background: #2d2d44;
    color: white;
    font-size: 14px;
}
.${className}:focus {
    border-color: #1976d2;
    outline: none;
}

`;
                    break;
                case 'card':
                    reactCode += `            <div className="${className}">
                <h3>Card Title</h3>
                <p>Card content goes here...</p>
            </div>\n`;
                    htmlCode += `        <div class="${className}">
            <h3>Card Title</h3>
            <p>Card content goes here...</p>
        </div>\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    height: ${Math.round(shape.height)}px;
    background: #2d2d44;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.${className} h3 {
    margin: 0 0 10px 0;
    color: #fff;
}
.${className} p {
    color: #aaa;
    margin: 0;
}

`;
                    break;
                case 'navbar':
                    reactCode += `            <nav className="${className}">
                <span className="logo">MyApp</span>
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
            </nav>\n`;
                    htmlCode += `        <nav class="${className}">
            <span class="logo">MyApp</span>
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </nav>\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    height: ${Math.round(shape.height)}px;
    background: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 30px;
    padding: 0 20px;
    border-radius: 8px;
}
.${className} .logo {
    font-weight: bold;
    color: #00f0ff;
    font-size: 18px;
}
.${className} a {
    color: #fff;
    text-decoration: none;
    opacity: 0.8;
}
.${className} a:hover {
    opacity: 1;
}

`;
                    break;
                case 'heading':
                    reactCode += `            <h1 className="${className}">Page Heading</h1>\n`;
                    htmlCode += `        <h1 class="${className}">Page Heading</h1>\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(45deg, #00f0ff, #9c27b0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
}

`;
                    break;
                case 'image':
                    reactCode += `            <img className="${className}" src="https://via.placeholder.com/${Math.round(shape.width)}x${Math.round(shape.height)}" alt="Placeholder" />\n`;
                    htmlCode += `        <img class="${className}" src="https://via.placeholder.com/${Math.round(shape.width)}x${Math.round(shape.height)}" alt="Placeholder" />\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    height: ${Math.round(shape.height)}px;
    border-radius: 8px;
    object-fit: cover;
}

`;
                    break;
                case 'form':
                    reactCode += `            <form className="${className}">
                <input placeholder="Name" />
                <input placeholder="Email" type="email" />
                <button type="submit">Submit</button>
            </form>\n`;
                    htmlCode += `        <form class="${className}">
            <input placeholder="Name" />
            <input placeholder="Email" type="email" />
            <button type="submit">Submit</button>
        </form>\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    padding: 20px;
    background: #2d2d44;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.${className} input {
    padding: 12px;
    border: 2px solid #444;
    border-radius: 6px;
    background: #1e1e2e;
    color: white;
}
.${className} button {
    padding: 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

`;
                    break;
                default:
                    reactCode += `            <div className="${className}"></div>\n`;
                    htmlCode += `        <div class="${className}"></div>\n`;
                    cssCode += `.${className} {
    position: absolute;
    left: ${Math.round(shape.left)}px;
    top: ${Math.round(shape.top)}px;
    width: ${Math.round(shape.width)}px;
    height: ${Math.round(shape.height)}px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
}

`;
            }
        });

        reactCode += `        </div>
    );
};

export default App;`;
        htmlCode += `    </div>
</body>
</html>`;

        setGeneratedCode({ react: reactCode, html: htmlCode, css: cssCode });
        setIsGenerating(false);
        setSnackbar({ open: true, message: '✨ Code generated successfully!' });
    };

    // Copy code to clipboard
    const copyToClipboard = async () => {
        const codeTypes = ['react', 'html', 'css'];
        const code = generatedCode[codeTypes[codeTab]];
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Download code as file
    const downloadCode = () => {
        const codeTypes = ['react', 'html', 'css'];
        const extensions = ['jsx', 'html', 'css'];
        const code = generatedCode[codeTypes[codeTab]];
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-ui.${extensions[codeTab]}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Helmet>
                <title>Smart Draw - UI Design to Code | StudySphere</title>
            </Helmet>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4" sx={{
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            background: 'linear-gradient(45deg, #9c27b0, #00f0ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            <AutoAwesome sx={{ color: '#9c27b0', fontSize: 40 }} />
                            Smart Draw → Code
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Design your UI visually and generate React/HTML/CSS code instantly
                        </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={clearCanvas}
                            startIcon={<Delete />}
                            color="error"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="contained"
                            onClick={generateCode}
                            disabled={shapes.length === 0 || isGenerating}
                            startIcon={isGenerating ? <CircularProgress size={20} /> : <Code />}
                            sx={{
                                background: 'linear-gradient(45deg, #9c27b0 30%, #1976d2 90%)',
                            }}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Code'}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* UI Component Templates */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Layers /> Click to add UI components:
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                {UI_TEMPLATES.map(template => (
                                    <Chip
                                        key={template.id}
                                        icon={template.icon}
                                        label={template.name}
                                        onClick={() => addTemplate(template)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                            }
                                        }}
                                    />
                                ))}
                                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                {/* Freehand Drawing Tool */}
                                <Chip
                                    icon={<Brush />}
                                    label={isDrawing ? 'Stop Drawing' : 'Draw'}
                                    onClick={toggleDrawing}
                                    color={isDrawing ? 'secondary' : 'default'}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: isDrawing ? 'secondary.main' : 'transparent',
                                        '&:hover': {
                                            bgcolor: isDrawing ? 'secondary.dark' : 'secondary.light',
                                        }
                                    }}
                                />
                                {isDrawing && (
                                    <>
                                        {/* Brush Color Options */}
                                        {['#00f0ff', '#ff4081', '#4caf50', '#ffc107', '#ffffff'].map(color => (
                                            <IconButton
                                                key={color}
                                                size="small"
                                                onClick={() => updateBrush(color, null)}
                                                sx={{
                                                    bgcolor: color,
                                                    width: 24,
                                                    height: 24,
                                                    border: brushColor === color ? '3px solid white' : '1px solid #666',
                                                    '&:hover': { bgcolor: color, opacity: 0.8 }
                                                }}
                                            />
                                        ))}
                                        {/* Brush Width Options */}
                                        {[2, 4, 8].map(width => (
                                            <Chip
                                                key={width}
                                                label={`${width}px`}
                                                size="small"
                                                onClick={() => updateBrush(null, width)}
                                                variant={brushWidth === width ? 'filled' : 'outlined'}
                                                color={brushWidth === width ? 'primary' : 'default'}
                                                sx={{ cursor: 'pointer', minWidth: 45 }}
                                            />
                                        ))}
                                    </>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Canvas */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Design Canvas</Typography>
                                <Chip
                                    label={`${shapes.length} component${shapes.length !== 1 ? 's' : ''}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            <Box
                                sx={{
                                    border: '2px solid rgba(0, 240, 255, 0.3)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    bgcolor: '#1e1e2e',
                                }}
                            >
                                <canvas ref={canvasRef} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" mt={1} display="block">
                                Tip: Drag components to position them. Resize by dragging corners.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Code Output */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{
                            p: 2,
                            height: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Code /> Generated Code
                                </Typography>
                                {generatedCode.react && (
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

                            <Tabs value={codeTab} onChange={(e, v) => setCodeTab(v)} sx={{ mb: 2 }}>
                                <Tab label="React" />
                                <Tab label="HTML" />
                                <Tab label="CSS" />
                            </Tabs>

                            <Box sx={{ flex: 1, overflow: 'auto', borderRadius: 1, minHeight: 400 }}>
                                {generatedCode.react ? (
                                    <SyntaxHighlighter
                                        language={codeTab === 0 ? 'jsx' : codeTab === 1 ? 'html' : 'css'}
                                        style={vscDarkPlus}
                                        customStyle={{
                                            margin: 0,
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            height: '100%',
                                        }}
                                    >
                                        {codeTab === 0 ? generatedCode.react : codeTab === 1 ? generatedCode.html : generatedCode.css}
                                    </SyntaxHighlighter>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'text.secondary',
                                            textAlign: 'center',
                                            p: 3,
                                        }}
                                    >
                                        <Box>
                                            <AutoAwesome sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                                            <Typography variant="h6">Add UI components and click Generate</Typography>
                                            <Typography variant="body2" color="text.disabled" mt={1}>
                                                Click the component chips above to add them to your design
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </>
    );
};

export default SmartDrawPage;
