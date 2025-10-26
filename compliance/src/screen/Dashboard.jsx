import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Supabase from '../SupabaseClient';
import CustomCard from '../components/ui/CustomCard';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await Supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await Supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Indlæser...</div>
      </Container>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">Compliance App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#compliance">Compliance</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Item className="d-flex align-items-center me-3 text-light">
                Velkommen, {user?.user_metadata?.full_name || user?.email}
              </Nav.Item>
              <Button variant="outline-light" onClick={handleLogout}>
                Log ud
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container>
        <Row className="mb-4">
          <Col>
            <h1>Dashboard</h1>
            <p className="text-muted">Velkommen til dit compliance dashboard</p>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-4">
            <CustomCard
              title="Compliance Oversigt"
              onClick={() => alert('Compliance oversigt clicked')}
            />
          </Col>
          <Col md={4} className="mb-4">
            <CustomCard
              title="Rapporter"
              onClick={() => alert('Rapporter clicked')}
            />
          </Col>
          <Col md={4} className="mb-4">
            <CustomCard
              title="Indstillinger"
              onClick={() => alert('Indstillinger clicked')}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Bruger Information</Card.Title>
                <Card.Text>
                  <strong>Email:</strong> {user?.email}<br />
                  <strong>Navn:</strong> {user?.user_metadata?.full_name || 'Ikke angivet'}<br />
                  <strong>Registreret:</strong> {new Date(user?.created_at).toLocaleDateString('da-DK')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Hurtige Handlinger</Card.Title>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={() => alert('Ny compliance check')}>
                    Start Ny Compliance Check
                  </Button>
                  <Button variant="secondary" onClick={() => alert('Se rapporter')}>
                    Se Alle Rapporter
                  </Button>
                  <Button variant="info" onClick={() => alert('Eksporter data')}>
                    Eksporter Data
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;