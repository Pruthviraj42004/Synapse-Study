import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  currentRoom: null,
  participants: [],
  messages: [],
  loading: false,
  error: null,
};

const studyRoomSlice = createSlice({
  name: 'studyRoom',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    addRoom: (state, action) => {
      state.rooms.push(action.payload);
    },
    updateRoom: (state, action) => {
      const index = state.rooms.findIndex(room => room._id === action.payload._id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.participants = [];
      state.messages = [];
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action) => {
      const exists = state.participants.find(p => p._id === action.payload._id);
      if (!exists) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p._id !== action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setRooms,
  addRoom,
  updateRoom,
  setCurrentRoom,
  clearCurrentRoom,
  setParticipants,
  addParticipant,
  removeParticipant,
  setMessages,
  addMessage,
} = studyRoomSlice.actions;

export default studyRoomSlice.reducer;