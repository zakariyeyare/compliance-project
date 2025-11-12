import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

function ComplianceOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check hvis vi kommer fra GDPR Dashboard med specifikt kontrolmål
  const [fromGDPR, setFromGDPR] = useState(false);
  const [fromReports, setFromReports] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [controlTitle, setControlTitle] = useState('');
  const [policies, setPolicies] = useState({});
  const [savedPoliciesReport, setSavedPoliciesReport] = useState({});
  const [detailedPoliciesReport, setDetailedPoliciesReport] = useState({});

  useEffect(() => {
    if (location.state?.fromGDPR && location.state?.selectedControl) {
      setFromGDPR(true);
      setSelectedControl(location.state.selectedControl);
      setControlTitle(location.state?.controlTitle || '');
      setPolicies(location.state?.policies || {});
    } else if (location.state?.fromReports) {
      setFromReports(true);
      setSavedPoliciesReport(location.state?.savedPolicies || {});
      setDetailedPoliciesReport(location.state?.detailedPolicies || {});
    }
  }, [location]);

  // Mock data - i virkeligheden ville dette komme fra den forrige skærm/database
  const [selectedCompliance] = useState({
    A1: {
      selected: true,
      title: "Data Protection Impact Assessment (DPIA)",
      userNote: "Vi har gennemført DPIA for alle nye projekter og dokumenteret risikovurderinger i vores compliance system.",
      controlCode: "A.1"
    },
    A2: {
      selected: false,
      title: "Privacy Policy & Data Processing Records",
      userNote: "",
      controlCode: "A.2"
    },
    A3: {
      selected: true,
      title: "Data Subject Rights & Consent Management", 
      userNote: "Implementeret automatisk consent management system med mulighed for brugere at trække samtykke tilbage.",
      controlCode: "A.3"
    }
  });

  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    // Her kan du tilføje logik til at gemme godkendelse til database
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleBack = () => {
    if (fromGDPR) {
      navigate('/gdpr-compliance');
    } else {
      navigate('/dashboard');
    }
  };

  const selectedItems = Object.entries(selectedCompliance).filter(([key, item]) => item.selected);

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col lg={11}>
          {/* Header */}
          <div className="text-center mb-3">
            <h5 className="text-primary fw-bold mb-2">
              {fromGDPR && selectedControl ? 
                `Implementering oversigt for Kontrolmål ${selectedControl}` :
                fromReports ? 
                'Oversigt over dine gemte rapporter og policies' :
                'Oversigt over dine implementerede compliance elementer'
              }
            </h5>
            
            {fromGDPR && (
              <Alert variant="info" className="py-2 mb-3">
                <small>
                  <strong>📋 GDPR Compliance:</strong> Du ser nu implementeringen for det valgte kontrolmål fra GDPR Dashboard
                </small>
              </Alert>
            )}

            {fromReports && (
              <Alert variant="primary" className="py-2 mb-3">
                <small>
                  <strong>📊 Rapport Oversigt:</strong> Her er alle de policies og noter du har gemt i systemet
                </small>
              </Alert>
            )}
            
          </div>

          {/* Success Alert */}
          {approved && (
            <Alert variant="success" className="mb-3 py-2">
              <strong>✅ Godkendt!</strong> Din compliance oversigt er godkendt og gemt.
            </Alert>
          )}

          {/* GDPR Politik/Evidens visning */}
          {fromGDPR && policies && Object.keys(policies).length > 0 && (
            <div className="mb-4">
              <h6 className="text-primary fw-bold mb-3">
                📋 Politik / Evidens for Kontrolmål {selectedControl}
              </h6>
              <div className="bg-light p-3 rounded">
                <p className="text-dark mb-3">
                  <strong>Kontrolmål:</strong> {controlTitle}
                </p>
                
                {Object.entries(policies).map(([subcontrolId, data]) => (
                  <Card key={subcontrolId} className="mb-3 border-info">
                    <Card.Body className="p-3">
                      <Row>
                        <Col md={3}>
                          <Badge bg="info" className="mb-2">Underkontrol {data.code}</Badge>
                          <p className="small text-muted mb-0">
                            <strong>Aktivitet:</strong> {data.activity}
                          </p>
                        </Col>
                        <Col md={9}>
                          <h6 className="text-primary mb-2">Politik / Evidens:</h6>
                          <div className="bg-white p-2 border rounded">
                            <p className="mb-0 text-dark">{data.policy}</p>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rapport visning af gemte policies */}
          {fromReports && (
            <div className="mb-4">
              <h6 className="text-primary fw-bold mb-3">
                📊 Gemte Policies og Noter
              </h6>
              
              {Object.keys(savedPoliciesReport).length === 0 && Object.keys(detailedPoliciesReport).length === 0 ? (
                <Alert variant="info" className="text-center">
                  <h6>Ingen gemte policies fundet</h6>
                  <p className="mb-0">Du har ikke gemt nogen policies endnu. Gå til GDPR Dashboard for at begynde at arbejde med compliance policies.</p>
                </Alert>
              ) : (
                <div className="bg-light p-3 rounded">
                  {Object.entries(savedPoliciesReport).map(([subcontrolId, policyData], index) => {
                    // Check om det er den nye objekt struktur
                    const isObjectData = typeof policyData === 'object' && policyData.content;
                    const controlCode = isObjectData ? policyData.controlCode : `A.${index + 1}`;
                    const content = isObjectData ? policyData.content : policyData;
                    const title = isObjectData ? policyData.controlTitle : 'Kontrolmål';
                    
                    return (
                      <Card key={subcontrolId} className="mb-3 border-primary">
                        <Card.Body className="p-3">
                          <Row>
                            <Col md={2} className="text-center">
                              <Badge bg="primary" className="fs-5 px-3 py-2">{controlCode}</Badge>
                            </Col>
                            <Col md={10}>
                              <h6 className="text-primary mb-2">{title}</h6>
                              <div className="bg-white p-3 border rounded">
                                <p className="mb-0 text-dark">{content}</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    );
                  })}
                  
                  <div className="mt-3 p-2 bg-info bg-opacity-10 border border-info rounded">
                    <small className="text-info">
                      <i className="fas fa-info-circle me-1"></i>
                      <strong>Total antal policies:</strong> {Object.keys(savedPoliciesReport).length}
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Compliance Overview - Kompakt layout (kun hvis ikke fra GDPR eller Reports) */}
          {!fromGDPR && !fromReports && (
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
          )}

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
                ← {fromGDPR ? 'Tilbage til GDPR Dashboard' : 'Tilbage til Dashboard'}
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