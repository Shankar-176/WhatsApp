import React, { useEffect } from 'react';

const ImagePreviewModal = ({ imageUrl, onClose, title = 'Image' }) => {
  useEffect(() => {
    // Handle ESC key press to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-preview-backdrop" onClick={handleBackdropClick}>
      <div className="image-preview-content">
        <button
          className="image-preview-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        <img
          src={imageUrl}
          alt={title}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;