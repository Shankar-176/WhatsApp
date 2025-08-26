import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';

const ChatHeader = ({ user, onBack }) => {
  const getUserInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'last seen just now';
    if (diffInMinutes < 60) return `last seen ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `last seen ${Math.floor(diffInMinutes / 60)}h ago`;
    return `last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="chat-header">
      <div className="d-flex align-items-center">
        <Button
          variant="link"
          className="text-white p-0 me-3 border-0 d-md-none"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left fs-5"></i>
        </Button>
        
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
          <div className="user-name text-white">{user.username}</div>
          <div className="chat-status">
            {user.isOnline ? 'online' : formatLastSeen(user.lastSeen)}
          </div>
        </div>
        
        <div className="ms-auto">
          <Button
            variant="link"
            className="text-white p-2 border-0 me-2"
            title="Voice call"
          >
            <i className="bi bi-telephone"></i>
          </Button>
          
          <Button
            variant="link"
            className="text-white p-2 border-0 me-2"
            title="Video call"
          >
            <i className="bi bi-camera-video"></i>
          </Button>
          
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="text-white p-2 border-0 shadow-none"
              id="chat-menu"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <i className="bi bi-person me-2"></i>
                View Profile
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-image me-2"></i>
                Media & Files
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-search me-2"></i>
                Search Messages
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>
                <i className="bi bi-volume-mute me-2"></i>
                Mute Notifications
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-archive me-2"></i>
                Archive Chat
              </Dropdown.Item>
              <Dropdown.Item className="text-danger">
                <i className="bi bi-trash me-2"></i>
                Delete Chat
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;