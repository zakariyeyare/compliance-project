import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Tilf├©j navigation
import gdprSupabaseService from '../components/gdbrSupabase';
import '../styles/Gdpr.css';

const GDPRDashboard = ({ orgId = 1 }) => {
  const navigate = useNavigate(); // Navigation hook
  const [gdprData, setGdprData] = useState(null);
  const [expandedControls, setExpandedControls] = useState({});
  const [workingPolicies, setWorkingPolicies] = useState({});
  const [savedPolicies, setSavedPolicies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [saveMode, setSaveMode] = useState('local');

  useEffect(() => {
    loadGDPRData();
    // Fors├©g at indl├ªse gemte policies fra localStorage
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

  const loadGDPRData = async () => {
    try {
      setLoading(true);
      const data = await gdprSupabaseService.getGDPRFullStructure();
      setGdprData(data);
      
      // Auto-expand first control for demo
      if (data?.controls?.length > 0) {
        setExpandedControls({ [data.controls[0].code]: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkingPolicies = async () => {
    try {
      const policies = await gdprSupabaseService.getWorkingPolicies(orgId);
      const policiesMap = {};
      policies.forEach(policy => {
        policiesMap[policy.subcontrol_id] = policy.content;
      });
      setWorkingPolicies(policiesMap);
    } catch (err) {
      console.error('Error loading policies:', err);
      setWorkingPolicies({});
    }
  };

  const toggleControl = (controlCode) => {
    setExpandedControls(prev => ({
      ...prev,
      [controlCode]: !prev[controlCode]
    }));
  };

  const handlePolicyChange = (subcontrolId, content) => {
    setWorkingPolicies(prev => ({
      ...prev,
      [subcontrolId]: content
    }));
  };

  const savePolicyContent = async (subcontrolId, ordinal, subcontrol, control) => {
    try {
      setSaving(prev => ({ ...prev, [subcontrolId]: true }));
      
      const contentToSave = workingPolicies[subcontrolId] || '';
      
      // Opret detaljeret policy objekt med kontrolmål information
      const policyData = {
        content: contentToSave,
        subcontrolCode: subcontrol?.code || 'Ukendt',
        controlCode: control?.code || 'Ukendt',
        controlTitle: control?.definition || 'Ingen definition',
        savedAt: new Date().toISOString()
      };
      
      if (saveMode === 'local') {
        // Gem lokalt i browseren med detaljeret information
        const existingPolicies = localStorage.getItem('gdpr_saved_policies_detailed');
        let detailedPolicies = {};
        
        if (existingPolicies) {
          try {
            detailedPolicies = JSON.parse(existingPolicies);
          } catch (e) {
            console.error('Error parsing existing policies:', e);
          }
        }
        
        detailedPolicies[subcontrolId] = policyData;
        localStorage.setItem('gdpr_saved_policies_detailed', JSON.stringify(detailedPolicies));
        
        // Gem også i modificeret format hvor vi inkluderer kontrolmål kode i indholdet
        const updatedSavedPolicies = {
          ...savedPolicies,
          [subcontrolId]: {
            content: contentToSave,
            controlCode: control?.code || `A.${ordinal}`,
            controlTitle: control?.definition || 'Kontrolmål'
          }
        };
        localStorage.setItem('gdpr_saved_policies', JSON.stringify(updatedSavedPolicies));
        setSavedPolicies(prev => ({
          ...prev,
          [subcontrolId]: contentToSave
        }));
        
        setTimeout(() => {
          setSaving(prev => ({ ...prev, [subcontrolId]: false }));
        }, 800);
      } else {
        // Fors├©g at gemme i database
        await gdprSupabaseService.upsertWorkingPolicy(
          orgId,
          subcontrolId,
          contentToSave,
          ordinal
        );
        
        setSavedPolicies(prev => ({
          ...prev,
          [subcontrolId]: contentToSave
        }));
        
        setTimeout(() => {
          setSaving(prev => ({ ...prev, [subcontrolId]: false }));
        }, 1500);
      }
      
    } catch (err) {
      console.error('Fejl ved gemning:', err);
      
      // Fallback til lokal gemning hvis database fejler
      const updatedSavedPolicies = {
        ...savedPolicies,
        [subcontrolId]: workingPolicies[subcontrolId] || ''
      };
      localStorage.setItem('gdpr_saved_policies', JSON.stringify(updatedSavedPolicies));
      setSavedPolicies(updatedSavedPolicies);
      setSaveMode('local');
      
      alert('Database fejl - dine ├ªndringer gemmes lokalt i browseren. Kontakt administrator for at fikse database problemet.');
      setSaving(prev => ({ ...prev, [subcontrolId]: false }));
    }
  };

  const showImplementation = (controlCode) => {
    // Saml alle policies for dette kontrolmål
    const controlData = gdprData?.controls?.find(control => control.code === controlCode);
    const controlPolicies = {};
    
    controlData?.subcontrols?.forEach(subcontrol => {
      if (workingPolicies[subcontrol.id] || savedPolicies[subcontrol.id]) {
        controlPolicies[subcontrol.id] = {
          code: subcontrol.code,
          activity: subcontrol.activities?.[0]?.description || 'Ingen aktivitet defineret',
          policy: workingPolicies[subcontrol.id] || savedPolicies[subcontrol.id] || ''
        };
      }
    });

    // Naviger til compliance oversigt med politik data
    navigate('/compliance-overview', {
      state: {
        fromGDPR: true,
        selectedControl: controlCode,
        controlTitle: controlData?.definition,
        policies: controlPolicies
      }
    });
  };

  // Navigation til compliance oversigt
  const goToComplianceOverview = () => {
    navigate('/compliance-overview');
  };

  // Navigation tilbage til dashboard
  const goBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Navigation til rapport oversigt
  const goToReports = () => {
    // Hent gemte policies fra localStorage (både gamle og nye format)
    const savedPoliciesData = localStorage.getItem('gdpr_saved_policies');
    const detailedPoliciesData = localStorage.getItem('gdpr_saved_policies_detailed');
    
    let savedPoliciesReport = {};
    let detailedPoliciesReport = {};
    
    if (savedPoliciesData) {
      try {
        savedPoliciesReport = JSON.parse(savedPoliciesData);
      } catch (error) {
        console.error('Error parsing saved policies:', error);
      }
    }
    
    if (detailedPoliciesData) {
      try {
        detailedPoliciesReport = JSON.parse(detailedPoliciesData);
      } catch (error) {
        console.error('Error parsing detailed policies:', error);
      }
    }

    // Naviger til rapport oversigt med gemte policies
    navigate('/compliance-overview', {
      state: {
        fromReports: true,
        savedPolicies: savedPoliciesReport,
        detailedPolicies: detailedPoliciesReport
      }
    });
  };

  // Beregn antal gemte policies
  const getSavedPoliciesCount = () => {
    return Object.values(savedPolicies).filter(policy => policy && policy.trim() !== '').length;
  };

  // Beregn total antal subcontrols
  const getTotalSubcontrolsCount = () => {
    let total = 0;
    gdprData?.controls?.forEach(control => {
      total += control.subcontrols?.length || 0;
    });
    return total;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Indl├ªser GDPR dashboard...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Fejl ved indl├ªsning</Alert.Heading>
          <p>Kunne ikke indl├ªse GDPR compliance data: {error}</p>
          <Button variant="outline-danger" onClick={loadGDPRData}>
            Pr├©v igen
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="gdpr-dashboard mt-4">
      {/* Header med navigation */}
      <div className="dashboard-header mb-4">
        <Row className="align-items-center">
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              onClick={goBackToDashboard}
              className="mb-2 mb-md-0"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Tilbage
            </Button>
          </Col>
          <Col md={6}>
            <h2 className="text-primary mb-1">{gdprData?.title}</h2>
            <p className="text-muted mb-0">
              Standard: <strong>{gdprData?.code}</strong> | 
              Kontrolmål: <strong>{gdprData?.controls?.length || 0}</strong>
            </p>
          </Col>
          <Col md={2} className="text-center">
            <Button 
              variant="outline-primary" 
              onClick={goToReports}
              className="mb-2 mb-md-0"
              size="sm"
            >
              <i className="fas fa-file-alt me-2"></i>
              Se Rapporter
            </Button>
          </Col>
          <Col md={2} className="text-end">
            <Badge bg="info" className="fs-6 px-3 py-2">
              GDPR Compliance Dashboard
            </Badge>
          </Col>
        </Row>
      </div>

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
                      <Badge bg="primary" className="me-2">Kontrolm├Ñl {control.code}</Badge>
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
                    Ingen underkontroller fundet for dette kontrolm├Ñl.
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
                                  onClick={() => savePolicyContent(subcontrol.id, subIdx + 1, subcontrol, control)}
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
                                      Gemmer dine ├ªndringer...
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

      {gdprData?.controls?.length === 0 && (
        <Alert variant="info" className="text-center">
          <h5>Ingen kontrolm├Ñl fundet</h5>
          <p>Der blev ikke fundet nogen GDPR kontrolm├Ñl i databasen.</p>
        </Alert>
      )}

      {/* Next knap til compliance oversigt */}
      <div className="mt-5 mb-4">
        <Card className="border-success">
          <Card.Body className="text-center">
            <h5 className="text-success mb-3">
              <i className="fas fa-check-circle me-2"></i>
              F├ªrdig med at udfylde politikker?
            </h5>
            <p className="text-muted mb-3">
              Du har udfyldt <strong>{getSavedPoliciesCount()}</strong> ud af <strong>{getTotalSubcontrolsCount()}</strong> politikker.
              Se dit compliance oversigt og eksporter dine politikker.
            </p>
            <Button 
              variant="success" 
              size="lg" 
              onClick={goToComplianceOverview}
              className="px-5"
            >
              <i className="fas fa-arrow-right me-2"></i>
              N├ªste: Se Compliance Oversigt
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default GDPRDashboard;
