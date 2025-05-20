import React, { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { getProfile, updateProfile, changePassword, deleteAccount} from '../api';
   import '../index.css';

   const Profile = () => {
     const [user, setUser] = useState(null);
     const [profileData, setProfileData] = useState({ name: '', age: '', profession: '' });
     const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
      const [deletePassword, setDeletePassword] = useState('');
     const [error, setError] = useState('');
       const [success, setSuccess] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const navigate = useNavigate();

     useEffect(() => {
       console.log('Fetching profile');
       const fetchProfile = async () => {
         const token = localStorage.getItem('token');
         console.log('Profile fetch, token:', token ? '[REDACTED]' : 'No token');
         if (!token) {
           console.warn('No token found, redirecting to login');
           navigate('/login');
           return;
         }
         try {
           const user = await getProfile();
           console.log('Profile fetched:', user.email);
           setUser(user);
           setProfileData({
             name: user.name || '',
             age: user.age || '',
             profession: user.profession || '',
           });
         } catch (err) {
           console.error('Fetch profile error:', err);
           setError('Failed to fetch profile');
           localStorage.removeItem('token');
           navigate('/login');
         }
       };
       fetchProfile();
     }, [navigate]);

     const handleChange = (e, setter) =>
       setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

     const handleProfileSubmit = async (e) => {
       e.preventDefault();
         setError('');
       setIsLoading(true);

       console.log('Updating profile:', profileData);
       if (!profileData.name || !profileData.age || !profileData.profession) {
         setError('Please fill in all fields');
         setIsLoading(false);
         return;
       }

       try {
         await updateProfile(profileData);
         console.log('Profile updated');
         setUser({ ...user, ...profileData });
         alert('Profile updated successfully');
       } catch (err) {
         console.error('Update profile error:', err);
         setError(err || 'Failed to update profile');
       } finally {
         setIsLoading(false);
       }
     };

     const handlePasswordSubmit = async (e) => {
       e.preventDefault();
       setError('');
       setIsLoading(true);

       console.log('Changing password');
       if (!passwordData.currentPassword || !passwordData.newPassword) {
         setError('Please fill in all fields');
         setIsLoading(false);
         return;
       }

       try {
         await changePassword(passwordData);
         console.log('Password changed');
         alert('Password changed successfully');
         setPasswordData({ currentPassword: '', newPassword: '' });
       } catch (err) {
         console.error('Change password error:', err);
         setError(err || 'Failed to change password');
       } finally {
         setIsLoading(false);
       }
     };
     
     const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    console.log('Deleting account');
    if (!deletePassword) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      await deleteAccount({ password: deletePassword });
      console.log('Account deleted');
      setSuccess('Account deleted successfully');
      localStorage.removeItem('token');
      localStorage.removeItem('pendingVerificationEmail');
      setSuccess('Account deleted successfully');
      localStorage.removeItem('token');
      localStorage.removeItem('pendingVerificationEmail');
      navigate('/login');
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };


     const handleLogout = () => {
       console.log('Logging out from profile');
       localStorage.removeItem('token');
       localStorage.removeItem('pendingVerificationEmail');
       navigate('/login');
     };

     if (!user) return <div>Loading...</div>;

     return (
       <div className="form-container">
      <h2>Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <p>Email: {user.email}</p>
      <button onClick={handleLogout}>Logout</button>

      <h3>Update Profile</h3>
      <form onSubmit={handleProfileSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={(e) => handleChange(e, setProfileData)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={profileData.age}
            onChange={(e) => handleChange(e, setProfileData)}
            required
            min="18"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Profession:</label>
          <input
            type="text"
            name="profession"
            value={profileData.profession}
            onChange={(e) => handleChange(e, setProfileData)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {!user.isGoogleAccount && (
        <>
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => handleChange(e, setPasswordData)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => handleChange(e, setPasswordData)}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>

          <h3>Delete Account</h3>
          <form onSubmit={handleDeleteSubmit}>
            <div className="form-group">
              <label>Confirm Password:</label>
              <input
                type="password"
                name="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password to confirm"
              />
            </div>
            <button type="submit" disabled={isLoading} className="delete-btn">
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </form>
        </>
      )}
    </div>
     );
   };

   export default Profile;