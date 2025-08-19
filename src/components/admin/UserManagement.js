import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config';
import { Helmet } from 'react-helmet';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        return;
      }

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          throw new Error('Failed to fetch users');
        }
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="lds-roller">
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <Helmet>
        <title>User Management | Zorbas' Kitchen</title>
        <meta name="description" content="Manage registered users" />
      </Helmet>

      <div className="container">
        <h2>User Management</h2>
        <p className="subtitle">Manage all registered users in the system</p>
        
        <div className="controls-section">
          <div className="search-control">
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-control"
            >
              <option value="createdAt">Registration Date</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="isAdmin">Admin Status</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-control"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Admins</h3>
            <p>{users.filter(user => user.isAdmin).length}</p>
          </div>
          <div className="stat-card">
            <h3>Regular Users</h3>
            <p>{users.filter(user => !user.isAdmin).length}</p>
          </div>
        </div>

        {filteredAndSortedUsers.length === 0 ? (
          <p className="no-users">No users found matching your search criteria</p>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>About</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map(user => (
                  <tr key={user._id} className={user.isAdmin ? 'admin-row' : ''}>
                    <td className="user-info">
                      <div className="user-avatar">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <strong>{user.username}</strong>
                        {user.isAdmin && <span className="admin-badge">Admin</span>}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <div className="about-text">
                        {user.about ? (
                          user.about.length > 50 ? 
                            `${user.about.substring(0, 50)}...` : 
                            user.about
                        ) : (
                          <span className="no-about">No description</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
