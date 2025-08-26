import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RecentChatsList = () => {
  const navigate = useNavigate();
  const { recentChats, loading, error } = useSelector((state) => state.chat);

  const getUserInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    // Show date for older messages
    return messageTime.toLocaleDateString();
  };

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner animation="border" variant="success" size="sm" />
        <span className="ms-2">Loading chats...</span>
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

  if (recentChats.length === 0) {
    return (
      <div className="text-center p-4 text-muted">
        <i className="bi bi-chat-dots fs-1 d-block mb-3"></i>
        <p>No recent chats</p>
        <small>Start a conversation with someone!</small>
      </div>
    );
  }

  return (
    <div>
      {recentChats.map((chat) => (
        <div
          key={chat.userId}
          className="chat-item d-flex align-items-center"
          onClick={() => handleChatClick(chat.userId)}
        >
          <div className="position-relative">
            <div className="user-avatar">
              {chat.avatar ? (
                <img 
                  src={chat.avatar} 
                  alt={chat.username}
                  className="w-100 h-100 rounded-circle object-fit-cover"
                />
              ) : (
                getUserInitial(chat.username)
              )}
            </div>
            {chat.isOnline && <div className="online-indicator"></div>}
          </div>
          
          <div className="user-info">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="user-name">{chat.username}</div>
              <div className="chat-time">{formatTime(chat.lastMessageTime)}</div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="chat-preview text-truncate">
                {chat.lastMessage || 'No messages yet'}
              </div>
              {chat.unreadCount > 0 && (
                <div className="unread-count">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentChatsList;