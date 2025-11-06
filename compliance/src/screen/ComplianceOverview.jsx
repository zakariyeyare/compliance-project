import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ComplianceOverview() {
  // Mock data - i virkeligheden ville dette komme fra den forrige skærm/database
  const [selectedCompliance] = useState({
    A1: {
      selected: true,
      title: "Data Protection Impact Assessment (DPIA)",
      userNote: "Vi har gennemført DPIA for alle nye projekter og dokumenteret risikovurderinger i vores compliance system."
    },
    A2: {
      selected: false,
      title: "Privacy Policy & Data Processing Records",
      userNote: ""
    },
    A3: {
      selected: true,
      title: "Data Subject Rights & Consent Management", 
      userNote: "Implementeret automatisk consent management system med mulighed for brugere at trække samtykke tilbage."
    }
  });

  const [approved, setApproved] = useState(false);
  const navigate = useNavigate();

  const handleApprove = () => {
    setApproved(true);
    // Her kan du tilføje logik til at gemme godkendelse til database
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const selectedItems = Object.entries(selectedCompliance).filter(([key, item]) => item.selected);

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col lg={11}>
          {/* Header */}
          <div className="text-center mb-3">
            <h5 className="text-primary fw-bold mb-2">
              Oversigt over dine implementerede compliance elementer
            </h5>
            
          </div>

          {/* Success Alert */}
          {approved && (
            <Alert variant="success" className="mb-3 py-2">
              <strong>✅ Godkendt!</strong> Din compliance oversigt er godkendt og gemt.
            </Alert>
          )}

          {/* Compliance Overview - Kompakt layout */}
          <Row className="g-3 mb-3">
            {Object.entries(selectedCompliance)
              .filter(([key, item]) => item.selected)
              .map(([key, item]) => (
              <Col md={12} key={key}>
                <Card className="border-success h-100">
                  <Card.Body className="p-3">
                    <Row className="align-items-start">
                      <Col xs={3} className="text-center">
                        <span className="text-success" style={{ fontSize: '2rem' }}>✅</span>
                        <h4 className="fw-bold text-success mb-1">{key}</h4>
                        <Badge bg="success" className="small">Implementeret</Badge>
                      </Col>
                      <Col xs={9}>
                        <h6 className="mb-2 text-dark">{item.title}</h6>
                        {item.userNote ? (
                          <div>
                            <small className="text-primary fw-bold">📝 Noter:</small>
                            <div className="bg-light p-2 rounded mt-1">
                              <small className="text-dark">{item.userNote}</small>
                            </div>
                          </div>
                        ) : (
                          <small className="text-muted fst-italic">
                            Implementeret uden specifikke noter
                          </small>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Summary Stats - Kompakt */}
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Card className="text-center border-success">
                <Card.Body className="py-2">
                  <h4 className="text-success mb-1">{selectedItems.length}</h4>
                  <small className="text-muted">Implementerede Elementer</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-primary">
                <Card.Body className="py-2">
                  <h4 className="text-primary mb-1">
                    {selectedItems.filter(([key, item]) => item.userNote).length}
                  </h4>
                  <small className="text-muted">Med Detaljerede Noter</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-info">
                <Card.Body className="py-2">
                  <h4 className="text-info mb-1">100%</h4>
                  <small className="text-muted">Implementering Status</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Action Buttons - Kompakt */}
          <Row>
            <Col className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                disabled={approved}
              >
                ← Tilbage til Dashboard
              </Button>
              
              <Button 
                variant="success" 
                onClick={handleApprove}
                disabled={approved}
                className="px-4"
              >
                {approved ? 'Godkendt ✅' : '📋 Godkend Compliance Oversigt'}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default ComplianceOverview;