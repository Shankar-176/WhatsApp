import React from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AllUsersList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { allUsers, searchResults, searchQuery, loading, error } = useSelector((state) => state.user);

  const displayUsers = searchQuery ? searchResults : allUsers;
  const filteredUsers = displayUsers.filter(user => user.id !== currentUser?.id);

  const getUserInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleStartChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner animation="border" variant="success" size="sm" />
        <span className="ms-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center p-4 text-muted">
        <i className="bi bi-people fs-1 d-block mb-3"></i>
        {searchQuery ? 'No users found' : 'No users available'}
      </div>
    );
  }

  return (
    <div>
      {searchQuery && (
        <div className="px-3 py-2 bg-light border-bottom">
          <small className="text-muted">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </small>
        </div>
      )}
      
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="user-item d-flex align-items-center"
        >
          <div className="position-relative">
            <div className="user-avatar">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-100 h-100 rounded-circle object-fit-cover"
                />
              ) : (
                getUserInitial(user.username)
              )}
            </div>
            {user.isOnline && <div className="online-indicator"></div>}
          </div>
          
          <div className="user-info">
            <div className="user-name">{user.username}</div>
            <div className="user-status">
              {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
            </div>
          </div>
          
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => handleStartChat(user.id)}
            className="ms-auto"
          >
            <i className="bi bi-chat-dots me-1"></i>
            Chat
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AllUsersList;