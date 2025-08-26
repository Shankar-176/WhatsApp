import React, { useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="auth-card">
              {message && (
                <Alert variant="success" className="mb-4">
                  {message}
                </Alert>
              )}
              <LoginForm />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;