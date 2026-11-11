import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../../services/chat/chatService';

// Async thunks
export const sendChatMessage = createAsyncThunk(
  'aiChat/sendMessage',
  async ({ message, sessionId, context }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(message, sessionId, context);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatSessions = createAsyncThunk(
  'aiChat/fetchSessions',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await chatService.getChatSessions(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generateQuiz = createAsyncThunk(
  'aiChat/generateQuiz',
  async ({ topic, difficulty, numberOfQuestions }, { rejectWithValue }) => {
    try {
      const response = await chatService.generateQuiz(topic, difficulty, numberOfQuestions);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchQuizzes = createAsyncThunk(
  'aiChat/fetchQuizzes',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await chatService.getQuizzes(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitQuizAttempt = createAsyncThunk(
  'aiChat/submitQuizAttempt',
  async ({ quizId, answers, timeTaken }, { rejectWithValue }) => {
    try {
      const response = await chatService.submitQuizAttempt(quizId, answers, timeTaken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generateRoadmap = createAsyncThunk(
  'aiChat/generateRoadmap',
  async ({ topic, level, duration }, { rejectWithValue }) => {
    try {
      const response = await chatService.generateRoadmap(topic, level, duration);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRoadmaps = createAsyncThunk(
  'aiChat/fetchRoadmaps',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await chatService.getRoadmaps(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateRoadmapProgress = createAsyncThunk(
  'aiChat/updateRoadmapProgress',
  async ({ roadmapId, progressData }, { rejectWithValue }) => {
    try {
      const response = await chatService.updateRoadmapProgress(roadmapId, progressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Chat
  messages: [],
  sessions: [],
  currentSessionId: null,
  
  // Quizzes
  quizzes: [],
  currentQuiz: null,
  quizResult: null,
  
  // Roadmaps
  roadmaps: [],
  currentRoadmap: null,
  
  // UI State
  isLoading: false,
  error: null,
  
  // Pagination
  pagination: {
    page: 1,
    pages: 1,
    total: 0
  }
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    setCurrentSessionId: (state, action) => {
      state.currentSessionId = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    clearQuizResult: (state) => {
      state.quizResult = null;
    },
    setCurrentRoadmap: (state, action) => {
      state.currentRoadmap = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Send Chat Message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.message) {
          state.messages.push(action.payload.message);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Chat Sessions
    builder
      .addCase(fetchChatSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.sessions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Generate Quiz
    builder
      .addCase(generateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuiz = action.payload.quiz;
        state.quizzes.unshift(action.payload.quiz);
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Quizzes
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = action.payload.quizzes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Submit Quiz Attempt
    builder
      .addCase(submitQuizAttempt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizResult = action.payload.result;
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Generate Roadmap
    builder
      .addCase(generateRoadmap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoadmap = action.payload.roadmap;
        state.roadmaps.unshift(action.payload.roadmap);
      })
      .addCase(generateRoadmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Roadmaps
    builder
      .addCase(fetchRoadmaps.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRoadmaps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roadmaps = action.payload.roadmaps;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRoadmaps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Roadmap Progress
    builder
      .addCase(updateRoadmapProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRoadmapProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoadmap = action.payload.roadmap;
        // Update in roadmaps list
        const index = state.roadmaps.findIndex(r => r._id === action.payload.roadmap._id);
        if (index !== -1) {
          state.roadmaps[index] = action.payload.roadmap;
        }
      })
      .addCase(updateRoadmapProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCurrentSessionId,
  clearMessages,
  addMessage,
  setCurrentQuiz,
  clearQuizResult,
  setCurrentRoadmap,
  clearError
} = aiChatSlice.actions;

export default aiChatSlice.reducer;
