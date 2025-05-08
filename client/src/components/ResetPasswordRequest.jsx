import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPasswordRequest } from '../api';
import '../index.css';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Password reset request for:', email);
    if (!email) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    try {
      await resetPasswordRequest({ email });
      console.log('Reset link sent to:', email);
      alert('Password reset link sent to your email');
      navigate('/login');
    } catch (err) {
      console.error('Reset password request error:', err);
      setError(err || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <p>
        Back to <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default ResetPasswordRequest;