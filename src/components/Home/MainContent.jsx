import React from 'react';

const MainContent = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center p-4">
      <div className="mb-4">
        <i className="bi bi-chat-dots display-1 text-success opacity-50"></i>
      </div>
      <h3 className="text-muted mb-3">WhatsApp Lite</h3>
      <p className="text-muted mb-4 fs-5">
        Select a chat to start messaging
      </p>
      <div className="text-muted">
        <p className="mb-2">
          <i className="bi bi-shield-check me-2 text-success"></i>
          Your messages are secure and private
        </p>
        <p className="mb-2">
          <i className="bi bi-lightning me-2 text-success"></i>
          Real-time messaging
        </p>
        <p className="mb-0">
          <i className="bi bi-image me-2 text-success"></i>
          Share images up to 5MB
        </p>
      </div>
    </div>
  );
};

export default MainContent;