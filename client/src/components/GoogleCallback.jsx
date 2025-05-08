import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Component to handle Google OAuth callback logic
const GoogleCallback = () => {
  const navigate = useNavigate(); // React Router hook to programmatically navigate

  useEffect(() => {
    console.log('Handling Google OAuth callback');

    // Function to process the redirect from Google's OAuth flow
    const handleGoogleRedirect = async () => {
      try {
        // Make a request to the backend server to handle the OAuth callback
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/google/callback`,
          { withCredentials: true } // Send cookies along with the request (important for session auth)
        );

        // Destructure the token from the server's response
        const { token } = response.data;

        console.log('Google OAuth successful, token received');

        // Store the JWT token in localStorage for client-side session management
        localStorage.setItem('token', token);

        // Navigate the user to the dashboard upon successful login
        navigate('/dashboard');
      } catch (err) {
        // If an error occurs during the callback process, log it and redirect to login with error message
        console.error('Google OAuth failed:', err);
        navigate('/login', { state: { error: 'Google login failed' } });
      }
    };

    // Call the function when the component is mounted
    handleGoogleRedirect();
  }, [navigate]);

  // UI shown while processing the Google login
  return <div>Logging in with Google...</div>;
};

export default GoogleCallback;
