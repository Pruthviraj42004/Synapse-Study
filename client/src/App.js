import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthInitializer from './components/Auth/AuthInitializer';
import MatchNotification from './components/Matching/MatchNotification';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import StudyRooms from './pages/StudyRooms/StudyRooms';
import StudyRoom from './pages/StudyRoom/StudyRoom';
import Whiteboard from './pages/Whiteboard/Whiteboard';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';
import ProgrammingPlayground from './pages/Programming/ProgrammingPlayground';
import Programming from './pages/Programming/Programming';
import Newsletters from './pages/Newsletters/Newsletters';
import NewsletterDetail from './pages/Newsletters/NewsletterDetail';
import CreateNewsletter from './pages/Newsletters/CreateNewsletter';
import Resources from './pages/Resources/Resources';
import UploadResource from './pages/Resources/UploadResource';
import ResourceDetail from './pages/Resources/ResourceDetail';
import PeerMatchingPage from './pages/Matching/PeerMatchingPage';
import SmartDrawPage from './pages/SmartDraw/SmartDrawPage';
import JarvisPage from './pages/Jarvis/JarvisPage';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RAGKnowledgePage from './pages/RAGKnowledge/RAGKnowledgePage';

// Services
import { initializeSocket } from './services/socketService';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Initialize socket connection when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket(user._id);
    }
  }, [isAuthenticated, user]);

  // Determine correct dashboard based on role
  const getDashboardRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Initialize authentication state on app load */}
      <AuthInitializer />

      {/* Global match notification listener */}
      <MatchNotification />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={isAuthenticated ? getDashboardRedirect() : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? getDashboardRedirect() : <Register />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Student Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Teacher Dashboard */}
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

            {/* Admin Dashboard */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* Study Room Routes - Student Only (backend enforced) */}
            <Route path="/study-rooms" element={<StudyRooms />} />
            <Route path="/study-room/:roomId" element={<StudyRoom />} />
            <Route path="/whiteboard/:roomId" element={<Whiteboard />} />

            {/* Programming Routes - Student Only (backend enforced) */}
            <Route path="/programming-playground" element={<ProgrammingPlayground />} />
            <Route path="/programming" element={<Programming />} />
            <Route path="/programming/:sessionId" element={<Programming />} />

            {/* Newsletters - Everyone can view, Teachers can create */}
            <Route path="/newsletters" element={<Newsletters />} />
            <Route path="/newsletters/create" element={<CreateNewsletter />} />
            <Route path="/newsletters/:id" element={<NewsletterDetail />} />

            {/* Resources - Everyone can view, Teachers can upload */}
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/upload" element={<UploadResource />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />

            {/* Other Routes */}
            <Route path="/peer-matching" element={<PeerMatchingPage />} />
            <Route path="/smart-draw" element={<SmartDrawPage />} />
            <Route path="/jarvis" element={<JarvisPage />} />
            <Route path="/rag-knowledge" element={<RAGKnowledgePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
}

export default App;