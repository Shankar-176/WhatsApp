import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { fetchAllUsers } from '../store/userSlice';
import { fetchRecentChats } from '../store/chatSlice';
import Sidebar from '../components/Home/Sidebar';
import MainContent from '../components/Home/MainContent';

const HomePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchAllUsers());
    dispatch(fetchRecentChats());
  }, [dispatch]);

  return (
    <div className="home-container">
      <Container fluid className="h-100 p-0">
        <Row className="h-100 g-0">
          <Col md={4} lg={3} className="d-none d-md-block">
            <Sidebar />
          </Col>
          <Col md={8} lg={9}>
            <MainContent />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;