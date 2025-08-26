import React, { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { sendMessage } from '../../store/chatSlice';
import { uploadImage } from '../../services/chatApi';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import ImagePreviewModal from './ImagePreviewModal';

const MessageInput = ({ receiverId }) => {
  const dispatch = useDispatch();
  const { sendMessage: socketSendMessage, setTyping } = useSocket();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle typing indicator
  const handleTypingStart = () => {
    setTyping(receiverId, true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setTyping(receiverId, false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleTypingStop = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    setTyping(receiverId, false);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTypingStart();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setShowImagePreview(true);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setShowImagePreview(false);
  };

  const handleSendMessage = async () => {
    const messageText = message.trim();
    
    if (!messageText && !selectedImage) {
      return;
    }

    // Stop typing indicator
    handleTypingStop();

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        setUploading(true);
        try {
          const uploadResponse = await uploadImage(selectedImage);
          imageUrl = uploadResponse.data.imageUrl;
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image. Please try again.');
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // Prepare message data
      const messageData = {
        receiverId,
        content: messageText,
        messageType: imageUrl ? 'image' : 'text',
        imageUrl,
        timestamp: new Date().toISOString(),
      };

      // Send via socket for real-time delivery
      socketSendMessage(messageData);
      
      // Also send via API for persistence
      dispatch(sendMessage(messageData));

      // Clear input
      setMessage('');
      handleRemoveImage();
      
      // Focus back to textarea
      textareaRef.current?.focus();
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isDisabled = uploading || (!message.trim() && !selectedImage);

  return (
    <>
      <div className="message-input-container">
        {/* Image preview banner */}
        {selectedImage && (
          <div className="bg-light border-top p-2 d-flex align-items-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="rounded"
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <span className="ms-2 flex-grow-1 text-truncate">
              {selectedImage.name}
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={handleRemoveImage}
              className="text-danger p-1"
            >
              <i className="bi bi-x-circle"></i>
            </Button>
          </div>
        )}

        <div className="d-flex align-items-end">
          {/* Attachment button */}
          <div className="input-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Attach image"
            >
              {uploading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-paperclip"></i>
              )}
            </button>
          </div>

          {/* Message input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
            rows="1"
            disabled={uploading}
          />

          {/* Send button */}
          <div className="input-actions">
            <button
              type="button"
              className="action-btn"
              onClick={handleSendMessage}
              disabled={isDisabled}
              title="Send message"
            >
              <i className="bi bi-send"></i>
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Image preview modal */}
      {showImagePreview && imagePreview && (
        <ImagePreviewModal
          imageUrl={imagePreview}
          onClose={() => setShowImagePreview(false)}
          title="Image Preview"
        />
      )}
    </>
  );
};

export default MessageInput;