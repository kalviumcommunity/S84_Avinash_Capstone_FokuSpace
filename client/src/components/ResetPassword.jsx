import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../api';
import '../index.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ newPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const resetToken = query.get('token');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Reset password attempt');
    if (!formData.newPassword) {
      setError('Please enter a new password');
      setIsLoading(false);
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.newPassword)) {
      setError(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      );
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword: formData.newPassword });
      console.log('Password reset successful');
      alert('Password reset successfully');
      navigate('/login');
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken) {
    console.warn('No reset token, redirecting to reset-password-request');
    navigate('/reset-password-request');
    return null;
  }

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <p>
        Back to <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default ResetPassword;