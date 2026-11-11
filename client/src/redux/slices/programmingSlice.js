import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const executeCode = createAsyncThunk(
  'programming/executeCode',
  async ({ code, language }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/programming/execute`, { code, language });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'programming/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/programming/sessions`);
      return response.data.sessions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createSession = createAsyncThunk(
  'programming/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/programming/sessions`, sessionData);
      return response.data.session;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSessionById = createAsyncThunk(
  'programming/fetchSessionById',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/programming/sessions/${sessionId}`);
      return response.data.session;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateSession = createAsyncThunk(
  'programming/updateSession',
  async ({ sessionId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/programming/sessions/${sessionId}`, data);
      return response.data.session;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteSession = createAsyncThunk(
  'programming/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/programming/sessions/${sessionId}`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchChallenges = createAsyncThunk(
  'programming/fetchChallenges',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { difficulty, category, search } = filters;
      const queryParams = new URLSearchParams();

      if (difficulty) queryParams.append('difficulty', difficulty);
      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const queryString = queryParams.toString();
      const url = `${API_URL}/programming/challenges${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url);
      return response.data.challenges;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchChallengeById = createAsyncThunk(
  'programming/fetchChallengeById',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/programming/challenges/${challengeId}`);
      return response.data.challenge;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createChallenge = createAsyncThunk(
  'programming/createChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/programming/challenges`, challengeData);
      return response.data.challenge;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  sessions: [],
  currentSession: null,
  challenges: [],
  currentChallenge: null,
  executionResult: null,
  loading: false,
  error: null,
  successMessage: null
};

const programmingSlice = createSlice({
  name: 'programming',
  initialState,
  reducers: {
    clearExecutionResult: (state) => {
      state.executionResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    updateCurrentSessionFile: (state, action) => {
      const { fileId, content } = action.payload;

      if (state.currentSession && state.currentSession.files) {
        const fileIndex = state.currentSession.files.findIndex(f => f._id === fileId);
        if (fileIndex !== -1) {
          state.currentSession.files[fileIndex].content = content;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Execute Code
      .addCase(executeCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeCode.fulfilled, (state, action) => {
        state.loading = false;
        state.executionResult = action.payload.result;
      })
      .addCase(executeCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to execute code';
      })

      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch sessions';
      })

      // Create Session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = [action.payload, ...state.sessions];
        state.currentSession = action.payload;
        state.successMessage = 'Session created successfully';
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create session';
      })

      // Fetch Session By ID
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch session';
      })

      // Update Session
      .addCase(updateSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.sessions = state.sessions.map(session =>
          session._id === action.payload._id ? action.payload : session
        );
        state.successMessage = 'Session updated successfully';
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update session';
      })

      // Delete Session
      .addCase(deleteSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = state.sessions.filter(session => session._id !== action.payload);
        if (state.currentSession && state.currentSession._id === action.payload) {
          state.currentSession = null;
        }
        state.successMessage = 'Session deleted successfully';
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete session';
      })

      // Fetch Challenges
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload;
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch challenges';
      })

      // Fetch Challenge By ID
      .addCase(fetchChallengeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallengeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChallenge = action.payload;
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch challenge';
      })

      // Create Challenge
      .addCase(createChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = [action.payload, ...state.challenges];
        state.currentChallenge = action.payload;
        state.successMessage = 'Challenge created successfully';
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create challenge';
      });
  }
});

export const {
  clearExecutionResult,
  clearError,
  clearSuccessMessage,
  updateCurrentSessionFile
} = programmingSlice.actions;

export default programmingSlice.reducer;