import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { setCurrentChat, fetchChatMessages } from '../store/chatSlice';
import { getUserById } from '../services/userApi';
import { useSocket } from '../context/SocketContext';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import TypingIndicator from '../components/Chat/TypingIndicator';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { joinChat, leaveChat } = useSocket();
  
  const { currentChat, loading, error } = useSelector((state) => state.chat);
  const [chatUser, setChatUser] = React.useState(null);
  const [loadingUser, setLoadingUser] = React.useState(true);

  useEffect(() => {
    if (userId) {
      // Set current chat
      dispatch(setCurrentChat(userId));
      
      // Join chat room for real-time updates
      joinChat(userId);
      
      // Fetch chat messages
      dispatch(fetchChatMessages({ userId, page: 1 }));
      
      // Fetch user details
      fetchUserDetails();
      
      return () => {
        // Leave chat room when component unmounts
        leaveChat(userId);
      };
    }
  }, [userId, dispatch, joinChat, leaveChat]);

  const fetchUserDetails = async () => {
    try {
      setLoadingUser(true);
      const response = await getUserById(userId);
      setChatUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loadingUser) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
        <i className="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
        <h4>User not found</h4>
        <p className="text-muted mb-4">The user you're trying to chat with doesn't exist.</p>
        <Button variant="success" onClick={handleBackToHome}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatHeader user={chatUser} onBack={handleBackToHome} />
      
      <div className="chat-messages">
        <MessageList userId={userId} />
        <TypingIndicator userId={userId} />
      </div>
      
      <MessageInput receiverId={userId} />
    </div>
  );
};

export default ChatPage;