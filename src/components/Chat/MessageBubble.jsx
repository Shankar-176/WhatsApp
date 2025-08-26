import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner, Alert } from 'react-bootstrap';
import { fetchChatMessages } from '../../store/chatSlice';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';

const MessageList = ({ userId }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { user: currentUser } = useAuth();
  const { markAsRead } = useSocket();
  
  const { currentChat, loading, error } = useSelector((state) => state.chat);
  const [loadingMore, setLoadingMore] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  // Mark messages as read when chat opens or new messages arrive
  useEffect(() => {
    if (currentChat.messages.length > 0 && userId) {
      const unreadMessages = currentChat.messages
        .filter(msg => msg.senderId === userId && !msg.isRead)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages, userId);
      }
    }
  }, [currentChat.messages, userId, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user has scrolled to the top
    if (container.scrollTop === 0 && currentChat.hasMore && !loadingMore) {
      setLoadingMore(true);
      try {
        await dispatch(fetchChatMessages({ 
          userId, 
          page: currentChat.page + 1 
        })).unwrap();
      } catch (error) {
        console.error('Failed to load more messages:', error);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Group messages by sender for better visual organization
  const groupMessages = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const shouldStartNewGroup = !prevMessage || 
        prevMessage.senderId !== message.senderId ||
        (new Date(message.timestamp) - new Date(prevMessage.timestamp)) > 5 * 60 * 1000; // 5 minutes

      if (shouldStartNewGroup) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          senderId: message.senderId,
          messages: [message]
        };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  if (loading && currentChat.messages.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="success" size="sm" />
        <span className="ms-2">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        Failed to load messages: {error}
      </Alert>
    );
  }

  const messageGroups = groupMessages(currentChat.messages);

  return (
    <div 
      className="h-100 overflow-auto p-3"
      ref={messagesContainerRef}
      onScroll={handleScroll}
    >
      {loadingMore && (
        <div className="text-center py-3">
          <Spinner animation="border" variant="success" size="sm" />
          <span className="ms-2 small text-muted">Loading more messages...</span>
        </div>
      )}

      {messageGroups.length === 0 ? (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
          <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
          <h5 className="text-muted">No messages yet</h5>
          <p className="text-muted">Start the conversation with a message!</p>
        </div>
      ) : (
        messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            {group.messages.map((message, messageIndex) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser?.id}
                isFirst={messageIndex === 0}
                isLast={messageIndex === group.messages.length - 1}
              />
            ))}
          </div>
        ))
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;