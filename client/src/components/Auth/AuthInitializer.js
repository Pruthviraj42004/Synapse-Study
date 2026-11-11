import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../redux/slices/authSlice';

/**
 * Component that initializes authentication state on app startup
 * Checks if there's a token in localStorage and fetches current user data
 */
const AuthInitializer = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If there's a token but not authenticated yet, fetch the user data
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  // This is just an initializer, it doesn't render anything
  return null;
};

export default AuthInitializer;