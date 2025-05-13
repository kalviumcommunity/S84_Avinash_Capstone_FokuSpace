import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Handling Google OAuth callback');

    // Extract token from query parameters
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      console.log('Google OAuth successful, token received');
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      console.error('Google OAuth failed: No token received');
      navigate('/login', { state: { error: 'Google login failed' } });
    }
  }, [navigate, location]);

  return <div>Logging in with Google...</div>;
};

export default GoogleCallback;