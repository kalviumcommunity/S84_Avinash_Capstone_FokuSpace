import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../api';
import '../index.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');

  useEffect(() => {
    console.log('VerifyOtp mounted, email:', email);
    if (!email) {
      console.warn('No email provided for OTP verification');
      setError('No email provided. Please register again.');
      setTimeout(() => navigate('/register'), 3000);
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Submitting OTP for:', email);
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      
      setIsLoading(false);
      return;
    
    }

    try {
      await verifyOtp({ email, otp });
      console.log('OTP verified for:', email);
      localStorage.removeItem('pendingVerificationEmail');
      alert('Email verified successfully');
      navigate('/login');
    } catch (err) {
      console.error('OTP verification error:', err);
      if (err === 'User already verified.') {
        setError('Account already verified. Please log in.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(err || 'OTP verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsResending(true);

    console.log('Resending OTP for:', email);
    try {
      await resendOtp({ email });
      console.log('New OTP sent for:', email);
      alert('New OTP has been sent to your email');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="form-container">
      <h2>Verify OTP</h2>
      <p>An OTP has been sent to {email}</p>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <button onClick={handleResendOtp} disabled={isResending}>
        {isResending ? 'Sending...' : 'Resend OTP'}
      </button>
    </div>
  );
};

export default VerifyOtp;