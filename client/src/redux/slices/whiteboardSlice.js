import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  canvas: null,
  isDrawing: false,
  tool: 'pen',
  color: '#000000',
  brushWidth: 2,
  history: [],
  currentStep: -1,
  collaborators: [],
};

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    setCanvas: (state, action) => {
      state.canvas = action.payload;
    },
    setIsDrawing: (state, action) => {
      state.isDrawing = action.payload;
    },
    setTool: (state, action) => {
      state.tool = action.payload;
    },
    setColor: (state, action) => {
      state.color = action.payload;
    },
    setBrushWidth: (state, action) => {
      state.brushWidth = action.payload;
    },
    addToHistory: (state, action) => {
      state.history = state.history.slice(0, state.currentStep + 1);
      state.history.push(action.payload);
      state.currentStep = state.history.length - 1;
    },
    undo: (state) => {
      if (state.currentStep > 0) {
        state.currentStep--;
      }
    },
    redo: (state) => {
      if (state.currentStep < state.history.length - 1) {
        state.currentStep++;
      }
    },
    clearBoard: (state) => {
      state.history = [];
      state.currentStep = -1;
    },
    setCollaborators: (state, action) => {
      state.collaborators = action.payload;
    },
    addCollaborator: (state, action) => {
      const exists = state.collaborators.find(c => c.userId === action.payload.userId);
      if (!exists) {
        state.collaborators.push(action.payload);
      }
    },
    removeCollaborator: (state, action) => {
      state.collaborators = state.collaborators.filter(c => c.userId !== action.payload);
    },
    updateCollaboratorCursor: (state, action) => {
      const { userId, position } = action.payload;
      const collaborator = state.collaborators.find(c => c.userId === userId);
      if (collaborator) {
        collaborator.cursorPosition = position;
      }
    },
  },
});

export const {
  setCanvas,
  setIsDrawing,
  setTool,
  setColor,
  setBrushWidth,
  addToHistory,
  undo,
  redo,
  clearBoard,
  setCollaborators,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorCursor,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;