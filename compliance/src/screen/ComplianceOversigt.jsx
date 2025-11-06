import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Supabase from '../SupabaseClient';

function ComplianceOversigt() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSelectGDPR = () => {
    console.log('GDPR valgt med input:', searchInput);
    // Her kan du tilføje logik for hvad der skal ske når GDPR vælges
    alert(`GDPR valgt! Input: ${searchInput}`);
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">Compliance App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/compliance-oversigt')} active>
                Compliance Oversigt
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
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
            <h1>Compliance Oversigt</h1>
            <p className="text-muted">Administrer dine compliance checks og standarder</p>
          </Col>
        </Row>

        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow">
              <Card.Body className="p-4">
                <Card.Title className="mb-4">Søg og Vælg Compliance Standard</Card.Title>
                
                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label>Søg efter compliance standard</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Indtast søgeord (f.eks. GDPR, ISO 27001, etc.)"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      size="lg"
                    />
                    <Form.Text className="text-muted">
                      Indtast nøgleord for at søge efter relevante compliance standarder
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={handleSelectGDPR}
                    >
                      Vælg GDPR
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Additional Info Card */}
            <Card className="shadow mt-4">
              <Card.Body>
                <Card.Title>Om GDPR</Card.Title>
                <Card.Text>
                  General Data Protection Regulation (GDPR) er EU's forordning om databeskyttelse. 
                  Den beskytter borgernes personlige data og giver dem kontrol over deres egne oplysninger.
                </Card.Text>
                <Card.Text className="mb-0">
                  <strong>Vigtige punkter:</strong>
                  <ul className="mt-2">
                    <li>Databeskyttelse og privatliv</li>
                    <li>Samtykke til databehandling</li>
                    <li>Ret til sletning</li>
                    <li>Dataportabilitet</li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ComplianceOversigt;
