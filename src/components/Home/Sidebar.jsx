import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../store/authSlice';
import UserSearch from './UserSearch';
import AllUsersList from './AllUsersList';
import RecentChatsList from './RecentChatsList';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/login');
  };

  const getUserInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="user-avatar me-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-100 h-100 rounded-circle object-fit-cover"
              />
            ) : (
              getUserInitial(user?.username)
            )}
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-0 text-white">{user?.username}</h6>
            <small className="text-white-50">Online</small>
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="text-white p-0 border-0 shadow-none"
              id="user-menu"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <i className="bi bi-person me-2"></i>
                Profile
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-gear me-2"></i>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <UserSearch />
      </div>

      {/* Tab Navigation */}
      <div className="px-3 py-2 bg-light border-bottom">
        <div className="btn-group w-100" role="group">
          <Button
            variant={activeTab === 'chats' ? 'success' : 'outline-success'}
            size="sm"
            onClick={() => setActiveTab('chats')}
          >
            <i className="bi bi-chat-dots me-1"></i>
            Chats
          </Button>
          <Button
            variant={activeTab === 'users' ? 'success' : 'outline-success'}
            size="sm"
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i>
            All Users
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="flex-grow-1 overflow-auto">
        {activeTab === 'chats' ? <RecentChatsList /> : <AllUsersList />}
      </div>
    </div>
  );
};

export default Sidebar; 