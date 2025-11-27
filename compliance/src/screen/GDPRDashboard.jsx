import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Tilføj navigation
import gdprSupabaseService from '../components/gdbrSupabase';
import Layout from '../components/ui/Layout';
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

  const loadGDPRData = useCallback(async () => {
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
  }, []);

  const loadWorkingPolicies = useCallback(async () => {
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
  }, [orgId]);

  useEffect(() => {
    loadGDPRData();
    // Attempt to load saved policies from localStorage
    const savedPoliciesData = localStorage.getItem('gdpr_saved_policies');
    if (savedPoliciesData) {
      const parsed = JSON.parse(savedPoliciesData);
      setSavedPolicies(parsed);
      setWorkingPolicies(parsed); // Start with same data in editing field
    }
    
    if (orgId) {
      loadWorkingPolicies();
    }
  }, [orgId, loadGDPRData, loadWorkingPolicies]);

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

  const savePolicyContent = async (subcontrolId, ordinal) => {
    try {
      setSaving(prev => ({ ...prev, [subcontrolId]: true }));
      
      const contentToSave = workingPolicies[subcontrolId] || '';
      
      // Check if there is content to save
      if (!contentToSave.trim()) {
        alert('Cannot save an empty policy. Please write some content first.');
        setSaving(prev => ({ ...prev, [subcontrolId]: false }));
        return;
      }
      
      if (saveMode === 'local') {
        // Save locally in browser
        const updatedSavedPolicies = {
          ...savedPolicies,
          [subcontrolId]: contentToSave
        };
        localStorage.setItem('gdpr_saved_policies', JSON.stringify(updatedSavedPolicies));
        setSavedPolicies(updatedSavedPolicies);
        
        setTimeout(() => {
          setSaving(prev => ({ ...prev, [subcontrolId]: false }));
        }, 800);
      } else {
        // Attempt to save in database
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
      console.error('Error saving:', err);
      
      // Fallback to local saving if database fails
      const updatedSavedPolicies = {
        ...savedPolicies,
        [subcontrolId]: workingPolicies[subcontrolId] || ''
      };
      localStorage.setItem('gdpr_saved_policies', JSON.stringify(updatedSavedPolicies));
      setSavedPolicies(updatedSavedPolicies);
      setSaveMode('local');
      
      alert('Database error - your changes are saved locally in the browser. Contact administrator to fix database issue.');
      setSaving(prev => ({ ...prev, [subcontrolId]: false }));
    }
  };

  const showImplementation = (controlCode) => {
    alert(`Showing implementation for Control ${controlCode}`);
  };


  // Navigation back to dashboard
  const goBackToDashboard = () => {
    navigate('/dashboard');
  };

  const goToComplianceOverview = () => {
    navigate('/compliance-overview');
  };

  // Calculate number of saved policies
  const getSavedPoliciesCount = () => {
    return Object.values(savedPolicies).filter(policy => policy && typeof policy === 'string' && policy.trim() !== '').length;
  };

  // Delete a saved policy
  const deletePolicy = (subcontrolId) => {
    const updatedSavedPolicies = { ...savedPolicies };
    delete updatedSavedPolicies[subcontrolId];
    
    const updatedWorkingPolicies = { ...workingPolicies };
    delete updatedWorkingPolicies[subcontrolId];
    
    localStorage.setItem('gdpr_saved_policies', JSON.stringify(updatedSavedPolicies));
    setSavedPolicies(updatedSavedPolicies);
    setWorkingPolicies(updatedWorkingPolicies);
  };

  // Calculate total number of subcontrols
  const getTotalSubcontrolsCount = () => {
    let total = 0;
    gdprData?.controls?.forEach(control => {
      total += control.subcontrols?.length || 0;
    });
    return total;
  };

  if (loading) {
    return (
      <Layout title="GDPR Compliance" fluid>
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Loading GDPR dashboard...</div>
          </div>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Loading Error</Alert.Heading>
          <p>Could not load GDPR compliance data: {error}</p>
          <Button variant="outline-danger" onClick={loadGDPRData}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Layout title="GDPR Compliance" fluid>
    <Container fluid className="gdpr-dashboard mt-4">
      {/* Header with navigation */}
      <div className="dashboard-header mb-4">
        <Row className="align-items-center">
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              onClick={goBackToDashboard}
              className="mb-2 mb-md-0"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </Button>
          </Col>
          <Col md={6}>
            <h2 className="text-primary mb-1">{gdprData?.title}</h2>
            <p className="text-muted mb-0">
              Standard: <strong>{gdprData?.code}</strong> | 
              Controls: <strong>{gdprData?.controls?.length || 0}</strong>
            </p>
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
              <Badge bg="info" className="fs-6 px-3 py-2">
                GDPR Compliance Dashboard
              </Badge>
              <Button 
                variant="primary"
                onClick={goToComplianceOverview}
              >
                <i className="fas fa-arrow-right me-2"></i>
                Continue to Overview
              </Button>
            </div>
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
                      <Badge bg="primary" className="me-2">Control {control.code}</Badge>
                      <small className="text-muted">
                        (click to {expandedControls[control.code] ? 'hide' : 'show'} details)
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
                    Show Implementation
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
                    No subcontrols found for this control.
                  </div>
                ) : (
                  control.subcontrols?.map((subcontrol, subIdx) => (
                    <div key={subcontrol.id} className="subcontrol-dashboard-row">
                      <Row className="g-0 min-height-120">
                        {/* Subcontrol Column */}
                        <Col lg={3} md={4} className="underkontrol-column">
                          <div className="dashboard-column-content">
                            <div className="dashboard-column-header">
                              <h6 className="fw-bold mb-0">
                                <i className="fas fa-list-ul me-2"></i>
                                Subcontrol
                              </h6>
                            </div>
                            <div className="dashboard-column-body">
                              <Badge bg="secondary" className="fs-6">{subcontrol.code}</Badge>
                            </div>
                          </div>
                        </Col>

                        {/* Activity Column */}
                        <Col lg={5} md={4} className="aktivitet-column">
                          <div className="dashboard-column-content">
                            <div className="dashboard-column-header">
                              <h6 className="fw-bold mb-0">
                                <i className="fas fa-tasks me-2"></i>
                                Activity
                              </h6>
                            </div>
                            <div className="dashboard-column-body">
                              {subcontrol.activities?.length === 0 ? (
                                <p className="text-muted mb-0 fst-italic">
                                  <i className="fas fa-exclamation-triangle me-2"></i>
                                  No activities defined
                                </p>
                              ) : (
                                <div className="activities-list">
                                  {subcontrol.activities?.map((activity) => (
                                    <div key={activity.id} className="activity-item mb-2">
                                      <p className="mb-0 activity-description">
                                        <strong>Activity:</strong> {activity.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Col>

                        {/* Policy/Evidence Column */}
                        <Col lg={4} md={4} className="politik-column">
                          <div className="dashboard-column-content">
                            <div className="dashboard-column-header">
                              <h6 className="fw-bold mb-0">
                                <i className="fas fa-file-alt me-2"></i>
                                Policy / Evidence
                              </h6>
                            </div>
                            <div className="dashboard-column-body">
                              <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Write policy / evidence..."
                                value={workingPolicies[subcontrol.id] || ''}
                                onChange={(e) => handlePolicyChange(subcontrol.id, e.target.value)}
                                className="policy-textarea"
                              />
                              <div className="mt-2">
                                <Button
                                  variant={saving[subcontrol.id] ? 'success' : (savedPolicies[subcontrol.id] && typeof savedPolicies[subcontrol.id] === 'string' && savedPolicies[subcontrol.id].trim() !== '' ? 'warning' : 'primary')}
                                  size="sm"
                                  onClick={() => savePolicyContent(subcontrol.id, subIdx + 1)}
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
                                      Saving...
                                    </>
                                  ) : savedPolicies[subcontrol.id] && typeof savedPolicies[subcontrol.id] === 'string' && savedPolicies[subcontrol.id].trim() !== '' ? (
                                    <>
                                      <i className="fas fa-edit me-2"></i>
                                      Update
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-save me-2"></i>
                                      Save
                                    </>
                                  )}
                                </Button>
                                {saving[subcontrol.id] && (
                                  <div className="mt-2">
                                    <small className="text-success">
                                      <i className="fas fa-check-circle me-1"></i>
                                      Saving your changes...
                                    </small>
                                  </div>
                                )}
                                {!saving[subcontrol.id] && savedPolicies[subcontrol.id] && typeof savedPolicies[subcontrol.id] === 'string' && savedPolicies[subcontrol.id].trim() !== '' && (
                                  <div className="mt-2 p-2 bg-light border rounded">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                      <small className="text-muted">
                                        <strong>Saved:</strong>
                                      </small>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => deletePolicy(subcontrol.id)}
                                        className="py-0 px-2"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        <i className="fas fa-trash me-1"></i>
                                        Delete
                                      </Button>
                                    </div>
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
          <h5>No Controls Found</h5>
          <p>No GDPR controls were found in the database.</p>
        </Alert>
      )}

      {/* Next button to compliance overview */}
      <div className="mt-5 mb-4">
        <Card className="border-success">
          <Card.Body className="text-center">
            <h5 className="text-success mb-3">
              <i className="fas fa-check-circle me-2"></i>
              Done filling out policies?
            </h5>
            <p className="text-muted mb-3">
              You have completed <strong>{getSavedPoliciesCount()}</strong> out of <strong>{getTotalSubcontrolsCount()}</strong> policies.
              View your compliance overview and export your policies.
            </p>
            <Button 
              variant="success"
              onClick={goToComplianceOverview}
            >
              <i className="fas fa-arrow-right me-2"></i>
              Continue to Overview
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
    </Layout>
  );
};

export default GDPRDashboard;