import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Handling Google OAuth callback');
    const handleGoogleRedirect = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/google/callback`,
          { withCredentials: true }
        );
        const { token } = response.data;
        console.log('Google OAuth successful, token received');
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } catch (err) {
        console.error('Google OAuth failed:', err);
        navigate('/login', { state: { error: 'Google login failed' } });
      }
    };
    handleGoogleRedirect();
  }, [navigate]);

  return <div>Logging in with Google...</div>;
};

export default GoogleCallback;

