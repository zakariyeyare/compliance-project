import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/ui/CustomCard';
import Layout from '../components/ui/Layout';

const GDPRDashboard = ({ orgId = 1 }) => { // Default til orgId 1
  const [gdprData, setGdprData] = useState(null);
  const [expandedControls, setExpandedControls] = useState({});
  const [workingPolicies, setWorkingPolicies] = useState({}); // Tekst der redigeres
  const [savedPolicies, setSavedPolicies] = useState({}); // Tekst der er gemt
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const navigate = useNavigate();

  const loadGDPRData = async () => {
    setLoading(false);
    // Placeholder - implement actual GDPR data loading
  };

  const loadWorkingPolicies = () => {
    // Placeholder - implement actual working policies loading
  };

  const toggleControl = (code) => {
    setExpandedControls(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const showImplementation = (code) => {
    alert(`Vis implementering for ${code}`);
  };

  const handlePolicyChange = (id, value) => {
    setWorkingPolicies(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const savePolicyContent = (id) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedPolicies(prev => ({
        ...prev,
        [id]: workingPolicies[id]
      }));
      localStorage.setItem('gdpr_saved_policies', JSON.stringify({
        ...savedPolicies,
        [id]: workingPolicies[id]
      }));
      setSaving(prev => ({ ...prev, [id]: false }));
    }, 500);
  };

  useEffect(() => {
    loadGDPRData();
    // Forsøg at indlæse gemte policies fra localStorage
    const savedPoliciesData = localStorage.getItem('gdpr_saved_policies');
    if (savedPoliciesData) {
      const parsed = JSON.parse(savedPoliciesData);
      setSavedPolicies(parsed);
      setWorkingPolicies(parsed); // Start med samme data i redigeringsfeltet
    }
    
    if (orgId) {
      loadWorkingPolicies();
    }
  }, [orgId]);

  const handleChooseCompliance = () => {
    navigate('/gdpr-compliance');
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div>Indlæser...</div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Container>
        <Row className="mb-4">
          <Col>
            <h1>Dashboard</h1>
            <p className="text-muted">Welcome to your compliance dashboard</p>
          </Col>
        </Row>
        

        <Row>
          <Col md={4} className="mb-4">
            <CustomCard
              title="Choose Compliance"
              onClick={handleChooseCompliance}
            />
          </Col>
          <Col md={4} className="mb-4">
            <CustomCard
              title="All Reports"
              onClick={() => navigate('/reports')}
            />
          </Col>
          <Col md={4} className="mb-4">
            <CustomCard
              title="Settings"
              onClick={() => alert('Settings clicked')}
            />
          </Col>
        </Row>

      {/* Dashboard Rows */}
      {gdprData?.controls?.map((control) => (
        <div key={control.id} className="dashboard-row mb-4">
          {/* Control Header */}
          <Card className="control-card shadow-sm">
            <Card.Header 
              className="control-header-row"
              onClick={() => toggleControl(control.code)}
              style={{ cursor: 'pointer' }}
            >
              <Row className="align-items-center g-0">
                <Col lg={8} md={7}>
                  <div className="control-title-section">
                    <h5 className="mb-1">
                      <Badge bg="primary" className="me-2">Kontrolmål {control.code}</Badge>
                      <small className="text-muted">
                        (klik for at {expandedControls[control.code] ? 'skjule' : 'vise'} detaljer)
                      </small>
                    </h5>
                    <p className="control-definition mb-0">{control.definition}</p>
                  </div>
                </Col>
                <Col lg={4} md={5} className="text-end">
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      showImplementation(control.code);
                    }}
                    className="me-2"
                  >
                    <i className="fas fa-eye me-1"></i>
                    Vis implementering
                  </Button>
                  <i className={`fas fa-chevron-${expandedControls[control.code] ? 'up' : 'down'} text-muted`}></i>
                </Col>
              </Row>
            </Card.Header>

            {/* Subcontrol Rows */}
            {expandedControls[control.code] && (
              <Card.Body className="p-0">
                {control.subcontrols?.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <i className="fas fa-info-circle me-2"></i>
                    Ingen underkontroller fundet for dette kontrolmål.
                  </div>
                ) : (
                  control.subcontrols?.map((subcontrol, subIdx) => (
                    <div key={subcontrol.id} className="subcontrol-dashboard-row">
                      <Row className="g-0 min-height-120">
                        {/* Underkontrol Column */}
                        <Col lg={3} md={4} className="underkontrol-column">
                          <div className="dashboard-column-content">
                            <div className="dashboard-column-header">
                              <h6 className="fw-bold mb-0">
                                <i className="fas fa-list-ul me-2"></i>
                                Underkontrol
                              </h6>
                            </div>
                            <div className="dashboard-column-body">
                              <Badge bg="secondary" className="fs-6">{subcontrol.code}</Badge>
                            </div>
                          </div>
                        </Col>

                        {/* Aktivitet Column */}
                        <Col lg={5} md={4} className="aktivitet-column">
                          <div className="dashboard-column-content">
                            <div className="dashboard-column-header">
                              <h6 className="fw-bold mb-0">
                                <i className="fas fa-tasks me-2"></i>
                                Aktivitet
                              </h6>
                            </div>
                            <div className="dashboard-column-body">
                              {subcontrol.activities?.length === 0 ? (
                                <p className="text-muted mb-0 fst-italic">
                                  <i className="fas fa-exclamation-triangle me-2"></i>
                                  Ingen aktiviteter defineret
                                </p>
                              ) : (
                                <div className="activities-list">
                                  {subcontrol.activities?.map((activity) => (
                                    <div key={activity.id} className="activity-item mb-2">
                                      <p className="mb-0 activity-description">
                                        <strong>Aktivitet:</strong> {activity.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Col>

                        {/* Politik/evidens Column */}
                        <Col lg={4} md={4} className="politik-column">
                          <div className="dashboard-column-content">
                            <div className="dashboard-column-header">
                              <h6 className="fw-bold mb-0">
                                <i className="fas fa-file-alt me-2"></i>
                                Politik / evidens
                              </h6>
                            </div>
                            <div className="dashboard-column-body">
                              <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Skriv politik / bevis..."
                                value={workingPolicies[subcontrol.id] || ''}
                                onChange={(e) => handlePolicyChange(subcontrol.id, e.target.value)}
                                className="policy-textarea"
                              />
                              <div className="mt-2">
                                <Button
                                  variant={saving[subcontrol.id] ? 'success' : 'primary'}
                                  size="sm"
                                  onClick={() => savePolicyContent(subcontrol.id)}
                                  disabled={saving[subcontrol.id]}
                                  className="save-btn"
                                >
                                  {saving[subcontrol.id] ? (
                                    <>
                                      <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="me-2"
                                      />
                                      Gemmer...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-save me-2"></i>
                                      Gem
                                    </>
                                  )}
                                </Button>
                                {saving[subcontrol.id] && (
                                  <div className="mt-2">
                                    <small className="text-success">
                                      <i className="fas fa-check-circle me-1"></i>
                                      Gemmer dine ændringer...
                                    </small>
                                  </div>
                                )}
                                {!saving[subcontrol.id] && savedPolicies[subcontrol.id] && (
                                  <div className="mt-2 p-2 bg-light border rounded">
                                    <small className="text-muted d-block mb-1">
                                      <strong>Gemt:</strong>
                                    </small>
                                    <small className="text-dark">
                                      {savedPolicies[subcontrol.id]}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      
                      {subIdx < control.subcontrols.length - 1 && (
                        <hr className="subcontrol-divider" />
                      )}
                    </div>
                  ))
                )}
              </Card.Body>
            )}
          </Card>
        </div>
      ))}
      </Container>
    </Layout>
  );
};

export default GDPRDashboard;