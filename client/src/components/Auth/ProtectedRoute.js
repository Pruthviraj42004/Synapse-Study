import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

/**
 * Protected route component that:
 * - Shows a loading spinner when auth state is being determined
 * - Redirects to login if not authenticated
 * - Renders the child routes if authenticated
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth);

  // Show loading spinner while:
  // 1. Auth state is explicitly loading, OR
  // 2. We have a token but auth state is still being determined
  if (loading || (token && !isAuthenticated)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;