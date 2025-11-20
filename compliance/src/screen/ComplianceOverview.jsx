import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import gdprSupabaseService from '../components/gdbrSupabase';
import Layout from '../components/ui/Layout';
import Supabase from '../SupabaseClient';

function ComplianceOverview() {
  const [savedPolicies, setSavedPolicies] = useState({});
  const [gdprData, setGdprData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, total: 0, percentage: 0 });
  const [savedReports, setSavedReports] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadComplianceData();
    loadSavedReports();
    loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await Supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadSavedReports = () => {
    const reportsData = localStorage.getItem('gdpr_reports');
    if (reportsData) {
      const parsed = JSON.parse(reportsData);
      setSavedReports(parsed);
    }
  };

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Fetch GDPR structure
      const gdprResult = await gdprSupabaseService.getGDPRFullStructure();
      setGdprData(gdprResult);
      
      // Fetch saved policies from localStorage
      const savedPoliciesData = localStorage.getItem('gdpr_saved_policies');
      if (savedPoliciesData) {
        const parsed = JSON.parse(savedPoliciesData);
        setSavedPolicies(parsed);
        
        // Calculate statistics (ensure policy is a string before trim)
        const completed = Object.values(parsed)
          .filter((policy) => typeof policy === 'string' && policy.trim() !== '')
          .length;
        const total = getTotalSubcontrolsCount(gdprResult);
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setStats({ completed, total, percentage });
      }
    } catch (err) {
      console.error('Error loading compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSubcontrolsCount = (data) => {
    let total = 0;
    data?.controls?.forEach(control => {
      total += control.subcontrols?.length || 0;
    });
    return total;
  };

  const getCompletedPolicies = () => {
    const completed = [];
    gdprData?.controls?.forEach(control => {
      control.subcontrols?.forEach(subcontrol => {
        const policy = savedPolicies[subcontrol.id];
        if (typeof policy === 'string' && policy.trim() !== '') {
          completed.push({
            controlCode: control.code,
            controlDefinition: control.definition,
            subcontrolCode: subcontrol.code,
            policy: policy,
            activities: subcontrol.activities || []
          });
        }
      });
    });
    return completed;
  };

  const goBackToGDPR = () => {
    navigate('/gdpr-compliance');
  };

  const handleCreateReport = () => {
    setShowCreateModal(true);
    // Generate automatic title
    const latestVersion = savedReports.length > 0 
      ? Math.max(...savedReports.map(r => parseFloat(r.version))) 
      : 0;
    const newVersion = (latestVersion + 0.1).toFixed(1);
    setNewReportTitle(`GDPR Compliance Rapport v${newVersion}`);
  };

  const confirmCreateReport = () => {
    const completedPolicies = getCompletedPolicies();
    
    if (completedPolicies.length === 0) {
      alert('No policies to save. Please fill out some policies first.');
      setShowCreateModal(false);
      return;
    }

    // Generate version number
    const latestVersion = savedReports.length > 0 
      ? Math.max(...savedReports.map(r => parseFloat(r.version))) 
      : 0;
    const newVersion = (latestVersion + 0.1).toFixed(1);

    const newReport = {
      id: Date.now(),
      version: newVersion,
      title: newReportTitle || `GDPR Compliance Report v${newVersion}`,
      createdDate: new Date().toISOString(),
      requestedBy: currentUser?.email || 'Unknown user',
      requestedByName: currentUser?.user_metadata?.full_name || currentUser?.email || 'Unknown',
      standard: 'GDPR',
      stats: { ...stats },
      policies: completedPolicies,
      status: 'Draft'
    };

    const updatedReports = [...savedReports, newReport];
    localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
    setShowCreateModal(false);
    setNewReportTitle('');
    
    alert(`Report "${newReport.title}" has been created as draft!`);
  };

  const approveIndividualReport = (reportId) => {
    const updatedReports = savedReports.map(report => {
      if (report.id === reportId) {
        return { 
          ...report, 
          status: 'Approved',
          approvedBy: currentUser?.email || 'Unknown user',
          approvedByName: currentUser?.user_metadata?.full_name || currentUser?.email || 'Unknown',
          approvedDate: new Date().toISOString()
        };
      }
      return report;
    });
    
    localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
    alert('The report has been approved!');
  };

  const publishReport = (reportId) => {
    const updatedReports = savedReports.map(report => {
      if (report.id === reportId) {
        return { ...report, status: 'Published', publishedDate: new Date().toISOString() };
      }
      return report;
    });
    
    localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
    alert('The report has been published!');
  };

  const deleteReport = (reportId) => {
    const report = savedReports.find(r => r.id === reportId);
    
    // Check if report is approved or published
    if (report.status === 'Approved' || report.status === 'Published') {
      alert('This report cannot be deleted because it has been approved or published!');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updatedReports = savedReports.filter(report => report.id !== reportId);
      localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
      setSavedReports(updatedReports);
    }
  };

  const exportReport = (report) => {
    // Create print-friendly HTML document
    const htmlContent = generateReportHTML(report);
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper function to generate report HTML
  const generateReportHTML = (report) => {
    return `
<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        @media print {
            @page { margin: 2cm; size: A4; }
            body { margin: 0; padding: 0; }
            .page-break { page-break-after: always; }
            .no-print { display: none; }
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background: #fff; }
        .header { text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0066cc; margin: 0; font-size: 32px; }
        .header .version { background: #0066cc; color: white; padding: 5px 15px; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: bold; }
        .metadata { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #0066cc; }
        .metadata-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
        .metadata-item { padding: 10px; background: white; border-radius: 5px; }
        .metadata-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .metadata-value { color: #333; font-size: 16px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .stat-number { font-size: 36px; font-weight: bold; margin: 10px 0; }
        .stat-label { font-size: 14px; opacity: 0.9; }
        .section { margin-bottom: 40px; }
        .section-title { color: #0066cc; font-size: 24px; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-bottom: 20px; }
        .policy-item { padding: 20px; border-bottom: 1px solid #eee; background: #fff; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .policy-item:last-child { border-bottom: 1px solid #ddd; }
        .policy-content { padding: 15px; line-height: 1.8; color: #333; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
        .status-godkendt { background: #28a745; color: white; }
        .status-publiceret { background: #17a2b8; color: white; }
        .print-button { position: fixed; top: 20px; right: 20px; background: #0066cc; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
        .print-button:hover { background: #0052a3; }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print / Gem som PDF</button>
    <div class="header">
        <h1>${report.title}</h1>
        <div class="version">Version ${report.version}</div>
        <div style="margin-top: 15px;">
            <span class="status-badge status-${report.status.toLowerCase().replace(' ', '-')}">${report.status}</span>
        </div>
    </div>
    <div class="metadata">
        <div class="metadata-row">
            <div class="metadata-item"><div class="metadata-label">Created Date</div><div class="metadata-value">${new Date(report.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>
        ${report.approvedBy ? `<div class="metadata-row">
            <div class="metadata-item"><div class="metadata-label">Approved By</div><div class="metadata-value">${report.approvedByName}</div></div>
            <div class="metadata-item"><div class="metadata-label">Approved Date</div><div class="metadata-value">${new Date(report.approvedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>` : ''}
        ${report.publishedDate ? `<div class="metadata-row">
            <div class="metadata-item"><div class="metadata-label">Published Date</div><div class="metadata-value">${new Date(report.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>` : ''}
    </div>
    <div class="section">
        <h2 class="section-title">📋 Compliance Policies</h2>
        ${generatePoliciesHTML(report.policies)}
    </div>
    <div class="footer">
        <p><strong>${report.title}</strong></p>
        <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>© ${new Date().getFullYear()} Compliance App - All rights reserved</p>
    </div>
</body>
</html>`;
  };

  const generatePoliciesHTML = (policies) => {
    let html = '';
    policies.forEach((policy) => {
      html += `<div class="policy-item">
          <div class="policy-content">${policy.policy}</div>
      </div>`;
    });
    return html;
  };


  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2">Loading compliance overview...</div>
        </div>
      </Container>
    );
  }

  const completedPolicies = getCompletedPolicies();

  return (
    <Layout title="Compliance Overview">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col md={12} lg={8}>
            <h1 className="text-primary">GDPR Compliance Overview</h1>
            <p className="text-muted">Overview of your saved compliance policies</p>
          </Col>
          <Col md={12} lg={4} className="text-lg-end">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              <Button 
                variant="outline-secondary" 
                onClick={goBackToGDPR}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to GDPR
              </Button>
              <Button 
                variant="success" 
                onClick={handleCreateReport}
                disabled={completedPolicies.length === 0}
              >
                <i className="fas fa-plus me-2"></i>
                Create New Report
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h3 className="text-primary">{stats.completed}</h3>
                <p className="text-muted mb-0">Completed Policies</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-info">
              <Card.Body>
                <h3 className="text-info">{stats.total}</h3>
                <p className="text-muted mb-0">Total Policies</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-success">
              <Card.Body>
                <h3 className="text-success">{stats.percentage}%</h3>
                <p className="text-muted mb-0">Completion Rate</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progress Alert */}
        <Row className="mb-4">
          <Col>
            {stats.percentage === 100 ? (
              <Alert variant="success">
                <i className="fas fa-check-circle me-2"></i>
                <strong>Fantastic!</strong> You have completed all GDPR policies.
              </Alert>
            ) : stats.percentage >= 50 ? (
              <Alert variant="warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Good work!</strong> You have completed {stats.percentage}% of the policies. 
                Continue to finish the remaining ones.
              </Alert>
            ) : (
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Get started!</strong> You have completed {stats.percentage}% of the policies. 
                There is still a lot of work to do.
              </Alert>
            )}
          </Col>
        </Row>

        {/* Saved Reports Section */}
        {savedReports.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-folder-open me-2"></i>
                    Saved Reports ({savedReports.length})
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover>
                    <thead className="table-light">
                      <tr>
                        <th>Version</th>
                        <th>Title</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Policies</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedReports.sort((a, b) => parseFloat(b.version) - parseFloat(a.version)).map((report) => (
                        <tr key={report.id}>
                          <td>
                            <Badge bg="primary" className="fs-6">
                              v{report.version}
                            </Badge>
                          </td>
                          <td><strong>{report.title}</strong></td>
                          <td>
                            <small className="text-muted">
                              {new Date(report.createdDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </td>
                          <td>
                            <Badge bg={
                              report.status === 'Published' ? 'success' : 
                              report.status === 'Approved' ? 'info' : 
                              'warning'
                            }>
                              {report.status}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="info">
                              {report.policies.length} policies
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {report.status === 'Draft' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => approveIndividualReport(report.id)}
                                  title="Approve this report"
                                >
                                  <i className="fas fa-check-circle me-1"></i>
                                  Approve
                                </Button>
                              )}
                              {report.status === 'Approved' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => publishReport(report.id)}
                                  title="Publish this approved report"
                                >
                                  <i className="fas fa-check me-1"></i>
                                  Publish
                                </Button>
                              )}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => exportReport(report)}
                              >
                                <i className="fas fa-download me-1"></i>
                                Download
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => deleteReport(report.id)}
                                disabled={report.status === 'Approved' || report.status === 'Published'}
                                title={report.status === 'Approved' || report.status === 'Published' ? 'Approved/Published reports cannot be deleted' : 'Delete this report'}
                              >
                                <i className="fas fa-trash me-1"></i>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Completed Policies Table */}
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Completed Policies ({completedPolicies.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {completedPolicies.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
                    <h5>No policies completed yet</h5>
                    <p>Go back to GDPR Compliance to fill out your policies.</p>
                    <Button variant="primary" onClick={goBackToGDPR}>
                      <i className="fas fa-plus me-2"></i>
                      Start filling out policies
                    </Button>
                  </div>
                ) : (
                  <Table responsive striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Control Objective</th>
                        <th>Subcontrol</th>
                        <th>Policy / Evidence</th>
                        <th>Activities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedPolicies.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Badge bg="primary" className="me-2">
                              {item.controlCode}
                            </Badge>
                            <small className="text-muted d-block">
                              {item.controlDefinition.substring(0, 100)}...
                            </small>
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {item.subcontrolCode}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              {item.policy.length > 150 ? 
                                `${item.policy.substring(0, 150)}...` : 
                                item.policy
                              }
                            </div>
                          </td>
                          <td>
                            {item.activities.length === 0 ? (
                              <small className="text-muted fst-italic">
                                No activities
                              </small>
                            ) : (
                              <div>
                                {item.activities.map((activity) => (
                                  <Badge 
                                    key={activity.id} 
                                    bg="outline-info" 
                                    className="me-1 mb-1"
                                  >
                                    {activity.description.substring(0, 30)}...
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal til at oprette ny rapport */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-file-alt me-2"></i>
            Create New Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Report Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter report title"
                value={newReportTitle}
                onChange={(e) => setNewReportTitle(e.target.value)}
                autoFocus
              />
              <Form.Text className="text-muted">
                The report will be created as a draft
              </Form.Text>
            </Form.Group>
            <Alert variant="info">
              <small>
                <strong>Info:</strong> The report contains {completedPolicies.length} completed policies ({stats.percentage}% complete)
              </small>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmCreateReport}>
            <i className="fas fa-save me-2"></i>
            Create Report
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default ComplianceOverview;
