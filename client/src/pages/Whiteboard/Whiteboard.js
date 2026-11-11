import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Slider,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Delete,
  Undo,
  Redo,
  Save,
  PanTool,
  Create,
  Circle,
  Crop169,
  TextFields,
  Clear
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SketchPicker } from 'react-color';
import socketService from '../../services/socketService';

const tools = [
  { name: 'Select', icon: <PanTool />, id: 'select' },
  { name: 'Pen', icon: <Create />, id: 'pen' },
  { name: 'Rectangle', icon: <Crop169 />, id: 'rectangle' },
  { name: 'Circle', icon: <Circle />, id: 'circle' },
  { name: 'Text', icon: <TextFields />, id: 'text' },
  { name: 'Eraser', icon: <Delete />, id: 'eraser' }
];

const Whiteboard = () => {
  const { roomId } = useParams();
  const { currentRoom } = useSelector((state) => state.studyRoom || {});
  const { user } = useSelector((state) => state.auth);
  
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const drawingPoints = useRef([]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [users, setUsers] = useState({});
  const [userCursors, setUserCursors] = useState({});
  
  // Save canvas state
  const saveState = useCallback(() => {
    if (!canvasRef.current) return;
    setHistory(prevHistory => [...prevHistory, canvasRef.current.toDataURL()]);
    setRedoStack([]);
  }, []);

  // Apply whiteboard updates from other users
  const applyWhiteboardUpdate = useCallback((drawingData) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    if (drawingData.tool === 'clear') {
      contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
      saveState();
      return;
    }
    
    const { tool, color, width, points, isFinal } = drawingData;
    
    // Save current context settings
    const currentColor = contextRef.current.strokeStyle;
    const currentWidth = contextRef.current.lineWidth;
    
    // Apply received settings
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = width;
    
    if (tool === 'pen') {
      // Don't call beginPath() for continuous strokes, only moveTo the first point if needed
      if (points.length > 0) {
        contextRef.current.beginPath();
        contextRef.current.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          contextRef.current.lineTo(points[i].x, points[i].y);
        }
        
        contextRef.current.stroke();
      }
    } else if (tool === 'rectangle') {
      const startPoint = points[0];
      const endPoint = points[1];
      
      contextRef.current.beginPath();
      contextRef.current.rect(
        startPoint.x, 
        startPoint.y, 
        endPoint.x - startPoint.x, 
        endPoint.y - startPoint.y
      );
      contextRef.current.stroke();
    } else if (tool === 'circle') {
      const startPoint = points[0];
      const endPoint = points[1];
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      );
      
      contextRef.current.beginPath();
      contextRef.current.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      contextRef.current.stroke();
    } else if (tool === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
      
      if (points.length > 0) {
        contextRef.current.beginPath();
        contextRef.current.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          contextRef.current.lineTo(points[i].x, points[i].y);
        }
        
        contextRef.current.stroke();
      }
      
      contextRef.current.globalCompositeOperation = 'source-over';
    }
    
    // Restore original context settings
    contextRef.current.strokeStyle = currentColor;
    contextRef.current.lineWidth = currentWidth;
    
    // Only save state on final updates to avoid performance issues
    if (isFinal) {
      saveState();
    }
  }, [saveState]);
  
  // Send whiteboard updates to other users
  const sendDrawingUpdate = useCallback((isFinal = false) => {
    if (drawingPoints.current.length < 2 && selectedTool !== 'rectangle' && selectedTool !== 'circle') return;
    if ((selectedTool === 'rectangle' || selectedTool === 'circle') && drawingPoints.current.length !== 2) return;
    
    const drawingData = {
      tool: selectedTool,
      color: strokeColor,
      width: lineWidth,
      points: [...drawingPoints.current], // Create a copy
      isFinal: isFinal
    };
    
    console.log('[Whiteboard] Sending drawing update:', { 
      roomId, 
      tool: selectedTool,
      pointsCount: drawingPoints.current.length,
      isFinal,
      drawingData 
    });
    socketService.sendWhiteboardUpdate(roomId, drawingData);
    
    // For continuous drawing (pen/eraser), keep the last point as the start of the next batch
    if (!isFinal && (selectedTool === 'pen' || selectedTool === 'eraser') && drawingPoints.current.length > 0) {
      const lastPoint = drawingPoints.current[drawingPoints.current.length - 1];
      drawingPoints.current = [lastPoint];
    } else {
      drawingPoints.current = [];
    }
  }, [roomId, selectedTool, strokeColor, lineWidth]);
  
  // Initialize socket connection
  useEffect(() => {
    console.log('[Whiteboard] ========== INITIALIZING WHITEBOARD ==========');
    console.log('[Whiteboard] Room ID:', roomId);
    
    const socket = socketService.getSocket();
    console.log('[Whiteboard] Socket status:', {
      exists: !!socket,
      connected: socket?.connected,
      id: socket?.id
    });
    
    if (!socket) {
      console.error('[Whiteboard] ERROR: Socket is null! Cannot join room.');
      return;
    }
    
    // Function to join room using socketService (with ack + sticky membership)
    const joinRoomNow = () => {
      console.log('[Whiteboard] ===== JOINING ROOM (via socketService.joinRoom) =====');
      console.log('[Whiteboard] Socket connected?', socket.connected);
      console.log('[Whiteboard] Socket ID:', socket.id);
      console.log('[Whiteboard] Room ID:', roomId);

      if (socket.connected) {
        socketService.joinRoom(roomId); // provides ack + retry logic
      } else {
        console.warn('[Whiteboard] ✗ Socket not connected, will wait for connect to join');
      }
    };
    
    // Join room immediately if connected
    if (socket.connected) {
      console.log('[Whiteboard] Socket is already connected, joining immediately...');
      joinRoomNow();
    } else {
      console.log('[Whiteboard] Socket not yet connected, will join on connect event...');
    }
    
    // ALWAYS set up reconnection handler
    const handleReconnect = () => {
      console.log('[Whiteboard] ===== SOCKET RECONNECTED =====');
      console.log('[Whiteboard] New socket ID:', socket.id);
      // Give socket a moment to stabilize, then join
      setTimeout(() => {
        console.log('[Whiteboard] Re-joining room after reconnection...');
        joinRoomNow();
      }, 200);
    };
    
  // On any (re)connect ensure we rejoin
  socket.on('connect', handleReconnect);
    
    // Listen for whiteboard updates from other users
    socketService.onWhiteboardUpdate((data) => {
      console.log('[Whiteboard] Received whiteboard update:', { 
        tool: data.drawingData?.tool,
        pointsCount: data.drawingData?.points?.length,
        userId: data.userId,
        data 
      });
      // Server already uses socket.to() which excludes sender, so we can apply all updates
      applyWhiteboardUpdate(data.drawingData);
    });
    
    // Listen for cursor updates
    socketService.onCursorUpdate((data) => {
      console.log('[Whiteboard] Received cursor update:', data);
      setUserCursors(prevCursors => ({
        ...prevCursors,
        [data.userId]: { 
          position: data.position, 
          userName: data.userName
        }
      }));
    });
    
    // Listen for user joined
    socketService.onUserJoined((data) => {
      console.log('[Whiteboard] User joined:', data);
      setUsers(prevUsers => ({
        ...prevUsers,
        [data.userId]: { 
          name: data.userName, 
          avatar: data.userAvatar 
        }
      }));
    });
    
    // Listen for user left
    socketService.onUserLeft((data) => {
      console.log('[Whiteboard] User left:', data);
      setUsers(prevUsers => {
        const newUsers = { ...prevUsers };
        delete newUsers[data.userId];
        return newUsers;
      });
      
      setUserCursors(prevCursors => {
        const newCursors = { ...prevCursors };
        delete newCursors[data.userId];
        return newCursors;
      });
    });
    
    // Cleanup socket listeners when unmounting
    return () => {
      if (socket) {
        socket.off('connect', handleReconnect);
      }
      socketService.offWhiteboardUpdate();
      // NOTE: Intentionally NOT leaving the room here to avoid StrictMode double-mount
      // instantly removing us. Use navigation logic elsewhere to explicitly untrack if needed.
    };
  }, [roomId, applyWhiteboardUpdate]);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    
    const context = canvas.getContext('2d');
    context.scale(2, 2); // For high DPI displays
    context.lineCap = 'round';
    context.strokeStyle = strokeColor;
    context.lineWidth = lineWidth;
    contextRef.current = context;
    
    // Save initial canvas state
    saveState();
    
    // Handle resize
    const handleResize = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Copy the current canvas to temp canvas
      const tempContext = tempCanvas.getContext('2d');
      tempContext.drawImage(canvas, 0, 0);
      
      // Resize main canvas
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      
      // Reset context settings
      context.scale(2, 2);
      context.lineCap = 'round';
      context.strokeStyle = strokeColor;
      context.lineWidth = lineWidth;
      
      // Restore drawing
      context.drawImage(tempCanvas, 0, 0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [strokeColor, lineWidth, saveState]);
  
  // Update context when color or line width changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = strokeColor;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [strokeColor, lineWidth]);
  
  // Track cursor position for broadcasting to other users
  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Send cursor position update to other users
    socketService.sendCursorUpdate(roomId, position);
    
    // If drawing, add to points array
    if (isDrawing) {
      const { offsetX, offsetY } = getCoordinates(e);
      drawingPoints.current.push({ x: offsetX, y: offsetY });
    }
  }, [roomId, isDrawing]);
  
  const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      // For touch devices
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    } else {
      // For mouse events
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    }
  };
  
  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setStartX(offsetX);
    setStartY(offsetY);
    setIsDrawing(true);
    
    // Start collecting points
    drawingPoints.current = [{ x: offsetX, y: offsetY }];
  };
  
  const finishDrawing = (e) => {
    if (isDrawing) {
      // For shapes (rectangle/circle), we need to capture the end point
      if (selectedTool === 'rectangle' || selectedTool === 'circle') {
        const { offsetX, offsetY } = getCoordinates(e);
        drawingPoints.current = [
          { x: startX, y: startY },
          { x: offsetX, y: offsetY }
        ];
      }
      
      contextRef.current.closePath();
      setIsDrawing(false);
      saveState();
      
      // Send final drawing update to socket
      sendDrawingUpdate(true); // Mark as final
    }
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (selectedTool === 'pen') {
      // Add point to the drawing points array for socket emission
      drawingPoints.current.push({ x: offsetX, y: offsetY });
      
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      
      // Send updates more frequently for smoother sync (every 3 points instead of 5)
      if (drawingPoints.current.length >= 3) {
        sendDrawingUpdate(false);
      }
    } else if (selectedTool === 'rectangle') {
      // Clear canvas to previous state and draw rectangle
      const img = new Image();
      img.src = history[history.length - 1];
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        
        // Draw new rectangle
        contextRef.current.beginPath();
        contextRef.current.rect(startX, startY, offsetX - startX, offsetY - startY);
        contextRef.current.stroke();
      };
    } else if (selectedTool === 'circle') {
      // Clear canvas to previous state and draw circle
      const img = new Image();
      img.src = history[history.length - 1];
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        
        // Calculate radius
        const radius = Math.sqrt(Math.pow(offsetX - startX, 2) + Math.pow(offsetY - startY, 2));
        
        // Draw new circle
        contextRef.current.beginPath();
        contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI);
        contextRef.current.stroke();
      };
    } else if (selectedTool === 'eraser') {
      // Add point to the drawing points array for socket emission
      drawingPoints.current.push({ x: offsetX, y: offsetY });
      
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      contextRef.current.globalCompositeOperation = 'source-over';
      
      // Send updates more frequently for smoother sync (every 3 points instead of 5)
      if (drawingPoints.current.length >= 3) {
        sendDrawingUpdate(false);
      }
    }
  };
  
  const handleUndo = () => {
    if (history.length > 1) {
      const currentState = history[history.length - 1];
      const previousState = history[history.length - 2];
      
      setRedoStack([...redoStack, currentState]);
      setHistory(history.slice(0, -1));
      
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
      };
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      
      setHistory([...history, nextState]);
      setRedoStack(redoStack.slice(0, -1));
      
      const img = new Image();
      img.src = nextState;
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
      };
    }
  };
  
  const handleClear = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
    saveState();
    
    // Broadcast clear action to others
    socketService.sendWhiteboardUpdate(roomId, { tool: 'clear' });
  };
  
  const handleSaveImage = () => {
    const image = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.click();
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {currentRoom?.name || `Whiteboard - Room ${roomId}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Object.keys(users).length > 0 && `${Object.keys(users).length} users connected`}
        </Typography>
      </Paper>
      
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Tools sidebar */}
        <Grid item xs={12} md={2}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>Tools</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {tools.map((tool) => (
                <Tooltip key={tool.id} title={tool.name} placement="right">
                  <IconButton 
                    color={selectedTool === tool.id ? "primary" : "default"} 
                    onClick={() => setSelectedTool(tool.id)}
                    sx={{ 
                      backgroundColor: selectedTool === tool.id ? 'primary.light' : 'transparent',
                    }}
                  >
                    {tool.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Color</Typography>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: strokeColor,
                border: '2px solid #ccc',
                cursor: 'pointer',
                mb: 2
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            
            {showColorPicker && (
              <Box sx={{ position: 'relative', zIndex: 10 }}>
                <Box 
                  sx={{ 
                    position: 'fixed', 
                    top: 0, 
                    right: 0, 
                    bottom: 0, 
                    left: 0 
                  }}
                  onClick={() => setShowColorPicker(false)}
                />
                <SketchPicker 
                  color={strokeColor}
                  onChange={(color) => setStrokeColor(color.hex)}
                />
              </Box>
            )}
            
            <Typography variant="subtitle1" gutterBottom>Brush Size</Typography>
            <Slider
              value={lineWidth}
              onChange={(e, newValue) => setLineWidth(newValue)}
              min={1}
              max={30}
              aria-label="Brush size"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Tooltip title="Undo">
                <IconButton onClick={handleUndo} disabled={history.length <= 1}>
                  <Undo />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Redo">
                <IconButton onClick={handleRedo} disabled={redoStack.length === 0}>
                  <Redo />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Clear All">
                <IconButton onClick={handleClear}>
                  <Clear />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Save as Image">
                <IconButton onClick={handleSaveImage}>
                  <Save />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Connected Users */}
            {Object.keys(users).length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Connected Users</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(users).map(([id, userData]) => (
                    <Box key={id} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" noWrap>
                        {userData.name || 'Unknown'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Canvas area */}
        <Grid item xs={12} md={10}>
          <Paper 
            sx={{ 
              height: '100%', 
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Cursor indicators for other users */}
            {Object.entries(userCursors).map(([userId, cursorData]) => (
              <Box
                key={userId}
                sx={{
                  position: 'absolute',
                  left: cursorData.position.x,
                  top: cursorData.position.y,
                  zIndex: 2,
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    border: '2px solid white'
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  {cursorData.userName || 'User'}
                </Typography>
              </Box>
            ))}
            
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={finishDrawing}
              onMouseMove={(e) => {
                handleMouseMove(e);
                draw(e);
              }}
              onMouseLeave={finishDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={finishDrawing}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                touchAction: 'none' // Prevent scrolling while drawing on touch devices
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Whiteboard;