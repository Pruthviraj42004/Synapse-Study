/**
 * Smart Draw Board Component
 * A separate canvas for sketch-to-code conversion
 * Independent from the existing Whiteboard
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    Button,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Slider,
} from '@mui/material';
import {
    Brush,
    Delete,
    Undo,
    Redo,
    Code,
    AutoAwesome,
    Rectangle,
    Circle,
    ContentCopy,
    Check,
    Info,
} from '@mui/icons-material';
import { fabric } from 'fabric';
import { analyzeShape, analyzeLayout } from './shapeAnalyzer';
import { generateCompleteCode, generateElementCode } from './codeGenerator';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SmartDrawBoard = ({ onCodeGenerated }) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [smartModeEnabled, setSmartModeEnabled] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedCode, setGeneratedCode] = useState({ html: '', css: '' });
    const [codeTab, setCodeTab] = useState(0);
    const [shapes, setShapes] = useState([]);
    const [drawingMode, setDrawingMode] = useState('rect'); // rect, circle, free
    const [brushSize, setBrushSize] = useState(3);
    const [copied, setCopied] = useState(false);
    const [analysisResults, setAnalysisResults] = useState([]);

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 600,
            height: 400,
            backgroundColor: '#1a1a2e',
            selection: true,
        });

        fabricRef.current = canvas;

        // Set up drawing brush
        canvas.freeDrawingBrush.color = '#00f0ff';
        canvas.freeDrawingBrush.width = brushSize;

        // Handle object creation
        canvas.on('object:added', handleShapeAdded);
        canvas.on('object:modified', handleShapeModified);
        canvas.on('object:removed', handleShapeRemoved);

        return () => {
            canvas.dispose();
        };
    }, []);

    // Update brush size
    useEffect(() => {
        if (fabricRef.current) {
            fabricRef.current.freeDrawingBrush.width = brushSize;
        }
    }, [brushSize]);

    // Handle shape added
    const handleShapeAdded = useCallback(() => {
        updateShapesList();
    }, []);

    const handleShapeModified = useCallback(() => {
        updateShapesList();
    }, []);

    const handleShapeRemoved = useCallback(() => {
        updateShapesList();
    }, []);

    // Update shapes list from canvas
    const updateShapesList = () => {
        if (!fabricRef.current) return;

        const objects = fabricRef.current.getObjects();
        const shapeData = objects.map(obj => ({
            type: obj.type,
            left: obj.left,
            top: obj.top,
            width: obj.width * (obj.scaleX || 1),
            height: obj.height * (obj.scaleY || 1),
            fill: obj.fill,
            stroke: obj.stroke,
        }));
        setShapes(shapeData);
    };

    // Add rectangle to canvas
    const addRectangle = () => {
        if (!fabricRef.current) return;

        const rect = new fabric.Rect({
            left: 50 + Math.random() * 200,
            top: 50 + Math.random() * 100,
            width: 120,
            height: 60,
            fill: 'transparent',
            stroke: '#00f0ff',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
        });

        fabricRef.current.add(rect);
        fabricRef.current.setActiveObject(rect);
        fabricRef.current.renderAll();
    };

    // Add circle to canvas
    const addCircle = () => {
        if (!fabricRef.current) return;

        const circle = new fabric.Circle({
            left: 50 + Math.random() * 200,
            top: 50 + Math.random() * 100,
            radius: 40,
            fill: 'transparent',
            stroke: '#9c27b0',
            strokeWidth: 2,
        });

        fabricRef.current.add(circle);
        fabricRef.current.setActiveObject(circle);
        fabricRef.current.renderAll();
    };

    // Toggle free drawing mode
    const toggleFreeDrawing = () => {
        if (!fabricRef.current) return;
        fabricRef.current.isDrawingMode = !fabricRef.current.isDrawingMode;
        setDrawingMode(fabricRef.current.isDrawingMode ? 'free' : 'rect');
    };

    // Clear canvas
    const clearCanvas = () => {
        if (!fabricRef.current) return;
        fabricRef.current.clear();
        fabricRef.current.backgroundColor = '#1a1a2e';
        fabricRef.current.renderAll();
        setShapes([]);
        setGeneratedCode({ html: '', css: '' });
        setAnalysisResults([]);
    };

    // Analyze and generate code
    const analyzeAndGenerateCode = async () => {
        if (shapes.length === 0) return;

        setIsAnalyzing(true);
        setAnalysisResults([]);

        // Artificial delay for "AI analyzing" effect
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

        // Analyze shapes
        const analyzed = analyzeLayout(shapes);
        setAnalysisResults(analyzed.map(s => s.analysis));

        // Generate code
        const code = generateCompleteCode(analyzed);
        setGeneratedCode(code);

        // Emit event for external listeners
        if (onCodeGenerated) {
            onCodeGenerated(code);
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('smart-board-code-gen', {
            detail: { code, shapes: analyzed }
        }));

        setIsAnalyzing(false);
    };

    // Copy code to clipboard
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome sx={{ color: '#9c27b0' }} />
                        Smart Draw → Code
                    </Typography>
                    <Chip
                        label="Experimental"
                        size="small"
                        color="secondary"
                        variant="outlined"
                    />
                </Box>
                <FormControlLabel
                    control={
                        <Switch
                            checked={smartModeEnabled}
                            onChange={(e) => setSmartModeEnabled(e.target.checked)}
                            color="secondary"
                        />
                    }
                    label={
                        <Box display="flex" alignItems="center" gap={0.5}>
                            Enable Smart Draw Mode
                            <AutoAwesome sx={{ fontSize: 16, color: smartModeEnabled ? '#9c27b0' : 'inherit' }} />
                        </Box>
                    }
                />
            </Box>

            {/* Info Alert */}
            {!smartModeEnabled && (
                <Alert severity="info" icon={<Info />}>
                    Enable Smart Draw Mode to convert your sketches into HTML/CSS code. Draw shapes and the AI will analyze them!
                </Alert>
            )}

            {/* Main Content */}
            <Box display="flex" gap={2} flex={1} minHeight={0}>
                {/* Canvas Section */}
                <Paper
                    sx={{
                        flex: 1,
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {/* Toolbar */}
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Tooltip title="Add Rectangle">
                            <IconButton onClick={addRectangle} color="primary">
                                <Rectangle />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Circle">
                            <IconButton onClick={addCircle} sx={{ color: '#9c27b0' }}>
                                <Circle />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Free Draw">
                            <IconButton
                                onClick={toggleFreeDrawing}
                                color={drawingMode === 'free' ? 'secondary' : 'default'}
                            >
                                <Brush />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem />
                        <Tooltip title="Clear Canvas">
                            <IconButton onClick={clearCanvas} color="error">
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ flex: 1 }} />
                        <Chip
                            label={`${shapes.length} shape${shapes.length !== 1 ? 's' : ''}`}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    {/* Brush Size Slider */}
                    {drawingMode === 'free' && (
                        <Box sx={{ mb: 2, px: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                Brush Size: {brushSize}px
                            </Typography>
                            <Slider
                                value={brushSize}
                                onChange={(e, v) => setBrushSize(v)}
                                min={1}
                                max={20}
                                size="small"
                            />
                        </Box>
                    )}

                    {/* Canvas */}
                    <Box
                        sx={{
                            border: '2px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <canvas ref={canvasRef} />
                    </Box>

                    {/* Generate Button */}
                    {smartModeEnabled && (
                        <Box mt={2} display="flex" justifyContent="center">
                            <Button
                                variant="contained"
                                onClick={analyzeAndGenerateCode}
                                disabled={shapes.length === 0 || isAnalyzing}
                                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Code />}
                                sx={{
                                    background: 'linear-gradient(45deg, #9c27b0 30%, #1976d2 90%)',
                                    px: 4,
                                }}
                            >
                                {isAnalyzing ? 'AI Analyzing Sketch...' : 'Generate Code'}
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Code Output Section */}
                {smartModeEnabled && (
                    <Paper
                        sx={{
                            flex: 1,
                            p: 2,
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Code />
                                Generated Code
                            </Typography>
                            <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
                                <IconButton
                                    onClick={() => copyToClipboard(codeTab === 0 ? generatedCode.html : generatedCode.css)}
                                    color={copied ? 'success' : 'default'}
                                >
                                    {copied ? <Check /> : <ContentCopy />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Tabs
                            value={codeTab}
                            onChange={(e, v) => setCodeTab(v)}
                            sx={{ mb: 2 }}
                        >
                            <Tab label="HTML" />
                            <Tab label="CSS" />
                        </Tabs>

                        {/* Analysis Results */}
                        {analysisResults.length > 0 && (
                            <Box mb={2}>
                                <Typography variant="caption" color="secondary">
                                    Detected Elements:
                                </Typography>
                                <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                    {analysisResults.map((result, idx) => (
                                        <Chip
                                            key={idx}
                                            label={`<${result.elementType}> (${Math.round(result.confidence * 100)}%)`}
                                            size="small"
                                            color={result.confidence > 0.8 ? 'success' : 'warning'}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Code Display */}
                        <Box sx={{ flex: 1, overflow: 'auto', borderRadius: 1 }}>
                            {generatedCode.html || generatedCode.css ? (
                                <SyntaxHighlighter
                                    language={codeTab === 0 ? 'html' : 'css'}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        height: '100%',
                                    }}
                                >
                                    {codeTab === 0 ? generatedCode.html : generatedCode.css}
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
                                        <AutoAwesome sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                        <Typography>
                                            Draw shapes on the canvas and click "Generate Code" to see the magic!
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default SmartDrawBoard;
