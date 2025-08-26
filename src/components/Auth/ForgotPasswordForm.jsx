import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword, clearError } from '../../store/authSlice';
import { verifyOTP } from '../../services/authApi';

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState('email'); // email, otp, reset
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear global error
    if (error) {
      dispatch(clearError());
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTPForm = () => {
    const newErrors = {};
    
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }

    try {
      await dispatch(forgotPassword(formData.email)).unwrap();
      setSuccessMessage('OTP sent to your email address');
      setStep('otp');
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOTPForm()) {
      return;
    }

    try {
      const result = await verifyOTP(formData.email, formData.otp);
      setResetToken(result.data.resetToken);
      setSuccessMessage('OTP verified successfully');
      setStep('reset');
    } catch (error) {
      setErrors({ otp: 'Invalid OTP' });
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResetForm()) {
      return;
    }

    try {
      await dispatch(resetPassword({
        email: formData.email,
        token: resetToken,
        password: formData.newPassword,
      })).unwrap();
      
      setSuccessMessage('Password reset successful! Please sign in with your new password.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  const renderEmailStep = () => (
    <Form onSubmit={handleEmailSubmit}>
      <div className="auth-logo">
        <h1><i className="bi bi-key"></i> Reset Password</h1>
        <p>Enter your email to receive a reset code</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <Form.Group className="mb-4">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          isInvalid={!!errors.email}
          placeholder="Enter your email"
          autoComplete="email"
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit"
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              className="me-2"
            />
            Sending OTP...
          </>
        ) : (
          'Send Reset Code'
        )}
      </Button>

      <div className="text-center">
        <Link to="/login" className="text-decoration-none">
          Back to Sign In
        </Link>
      </div>
    </Form>
  );

  const renderOTPStep = () => (
    <Form onSubmit={handleOTPSubmit}>
      <div className="auth-logo">
        <h1><i className="bi bi-shield-check"></i> Verify OTP</h1>
        <p>Enter the 6-digit code sent to {formData.email}</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <Form.Group className="mb-4">
        <Form.Label>OTP Code</Form.Label>
        <Form.Control
          type="text"
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          isInvalid={!!errors.otp}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className="text-center fs-4 letter-spacing-wide"
        />
        <Form.Control.Feedback type="invalid">
          {errors.otp}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit"
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              className="me-2"
            />
            Verifying...
          </>
        ) : (
          'Verify OTP'
        )}
      </Button>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setStep('email')}
          className="text-decoration-none p-0"
        >
          Back to Email
        </Button>
      </div>

      <div className="mt-3 p-2 bg-light rounded">
        <small className="text-muted d-block text-center">
          <strong>Demo OTP:</strong> 123456
        </small>
      </div>
    </Form>
  );

  const renderResetStep = () => (
    <Form onSubmit={handleResetSubmit}>
      <div className="auth-logo">
        <h1><i className="bi bi-lock-fill"></i> New Password</h1>
        <p>Create your new password</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          isInvalid={!!errors.newPassword}
          placeholder="Enter new password"
          autoComplete="new-password"
        />
        <Form.Control.Feedback type="invalid">
          {errors.newPassword}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          isInvalid={!!errors.confirmPassword}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
        <Form.Control.Feedback type="invalid">
          {errors.confirmPassword}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit"
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              className="me-2"
            />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </Form>
  );

  return (
    <>
      {step === 'email' && renderEmailStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'reset' && renderResetStep()}
    </>
  );
};

export default ForgotPasswordForm;