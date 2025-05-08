// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', age: '', profession: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await getProfile(token);
        setUser(response.data);
        setProfileData({
          name: response.data.name || '',
          age: response.data.age || '',
          profession: response.data.profession || '',
        });
      } catch (err) {
        setError('Failed to fetch profile');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e, setter) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(token, profileData);
      setUser({ ...user, ...profileData });
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(token, passwordData);
      alert('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Email: {user.email}</p>
      <button onClick={handleLogout}>Logout</button>

      <h3>Update Profile</h3>
      <form onSubmit={handleProfileSubmit}>
        {['name', 'age', 'profession'].map((field) => (
          <div key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <input
              type={field === 'age' ? 'number' : 'text'}
              name={field}
              value={profileData[field]}
              onChange={(e) => handleChange(e, setProfileData)}
              required
            />
          </div>
        ))}
        <button type="submit">Update Profile</button>
      </form>

      <h3>Change Password</h3>
      <form onSubmit={handlePasswordSubmit}>
        <div>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={(e) => handleChange(e, setPasswordData)}
            required
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={(e) => handleChange(e, setPasswordData)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default Profile;
