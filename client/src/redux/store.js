import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studyRoomReducer from './slices/studyRoomSlice';
import whiteboardReducer from './slices/whiteboardSlice';
import notificationReducer from './slices/notificationSlice';
import programmingReducer from './slices/programmingSlice';
import chatReducer from './slices/chat/chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    studyRoom: studyRoomReducer,
    whiteboard: whiteboardReducer,
    notification: notificationReducer,
    programming: programmingReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;