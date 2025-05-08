import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../api';
import '../index.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Fetching users for dashboard');
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        console.log('Users fetched:', response.users.length);
        setUsers(response.users || []);
      } catch (err) {
        console.error('Fetch users error:', err);
        setError(err || 'Failed to load users');
        if (err === 'Session expired. Please log in again.') {
          navigate('/login');
        }
      }
    };
    fetchUsers();
  }, [navigate]);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {error && <p className="error-message">{error}</p>}
      <h3>All Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} ({user.email}) - {user.profession}, Age: {user.age}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;