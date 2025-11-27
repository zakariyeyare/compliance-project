import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';

function Reports() {
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = () => {
    try {
      const reportsData = localStorage.getItem('gdpr_reports');
      if (reportsData) {
        const parsed = JSON.parse(reportsData);
        setSavedReports(parsed);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const goToComplianceOverview = () => {
    navigate('/compliance-overview');
  };

  const openReceipt = (report) => {
    const requesterName = report.requestedByName || report.requestedBy || 'Ukendt bruger';
    const approvalName = report.approvedByName || report.approvedBy || 'Ikke godkendt endnu';
    const resolvedDate = report.publishedDate || report.approvedDate || report.createdDate;

    const receiptPayload = {
      name: requesterName,
      standard: report.standard || 'GDPR',
      dato: resolvedDate,
      godkendtAf: approvalName,
      report,
    };

    try {
      localStorage.setItem('gdpr_last_receipt', JSON.stringify(receiptPayload));
    } catch (error) {
      console.error('Kunne ikke gemme rapporten til kvittering', error);
    }

    navigate('/udskriv', { state: receiptPayload });
  };

  // Helper function to generate policies HTML
  function generatePoliciesHTML(policies) {
    let html = '';
    policies.forEach((policy) => {
      html += `
        <div class="policy-item">
          <div class="policy-content">
            ${policy.policy}
          </div>
        </div>
      `;
    });
    
    return html;
  }

  const viewReportDetails = (report) => {
    // Create HTML document without print button
    const htmlContent = generateViewHTML(report);
    
    // Open in new window
    const viewWindow = window.open('', '_blank');
    viewWindow.document.write(htmlContent);
    viewWindow.document.close();
  };

  // Helper function to generate view HTML (without print button)
  const generateViewHTML = (report) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #0066cc;
            margin: 0;
            font-size: 32px;
        }
        
        .header .version {
            background: #0066cc;
            color: white;
            padding: 5px 15px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
            font-weight: bold;
        }
        
        .metadata {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #0066cc;
        }
        
        .metadata-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .metadata-item {
            padding: 10px;
            background: white;
            border-radius: 5px;
        }
        
        .metadata-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .metadata-value {
            color: #333;
            font-size: 16px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            color: #0066cc;
            font-size: 24px;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .policy-item {
            padding: 20px;
            border-bottom: 1px solid #eee;
            background: #fff;
            margin-bottom: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        
        .policy-item:last-child {
            border-bottom: 1px solid #ddd;
        }
        
        .policy-content {
            padding: 15px;
            line-height: 1.8;
            color: #333;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .status-godkendt {
            background: #28a745;
            color: white;
        }
        
        .status-publiceret {
            background: #17a2b8;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <div class="version">Version ${report.version}</div>
        <div style="margin-top: 15px;">
            <span class="status-badge status-${report.status.toLowerCase().replace(' ', '-')}">
                ${report.status}
            </span>
        </div>
    </div>
    
    <div class="metadata">
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Created Date</div>
                <div class="metadata-value">${new Date(report.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>
        ${report.approvedBy ? `
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Approved By</div>
                <div class="metadata-value">${report.approvedByName}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Approved Date</div>
                <div class="metadata-value">${new Date(report.approvedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>` : ''}
        ${report.publishedDate ? `
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Published Date</div>
                <div class="metadata-value">${new Date(report.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>` : ''}
    </div>
    
    <div class="section">
        <h2 class="section-title">📋 Compliance Policies</h2>
        ${generatePoliciesHTML(report.policies)}
    </div>
    
    <div class="footer">
        <p><strong>${report.title}</strong></p>
        <p>Generated: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>© ${new Date().getFullYear()} Compliance App - All rights reserved</p>
    </div>
</body>
</html>
    `;
    return htmlContent;
  };

  if (loading) {
    return (
      <Layout title="All Reports">
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2">Loading reports...</div>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="All Reports">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col md={8}>
            <h1 className="text-primary">
              <i className="fas fa-folder-open me-3"></i>
              All Reports
            </h1>
            <p className="text-muted">Overview of all your saved GDPR compliance reports</p>
          </Col>
          <Col md={4} className="text-end">
            <Button 
              variant="outline-secondary" 
              onClick={goToDashboard}
              className="me-2"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards - only show if there are reports */}
        {savedReports.length > 0 && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <h3 className="text-primary">{savedReports.length}</h3>
                  <p className="text-muted mb-0">Total Reports</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <h3 className="text-success">
                    {savedReports.filter(r => r.status === 'Published').length}
                  </h3>
                  <p className="text-muted mb-0">Published</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <h3 className="text-warning">
                    {savedReports.filter(r => r.status === 'Draft').length}
                  </h3>
                  <p className="text-muted mb-0">Drafts</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-info">
                <Card.Body>
                  <h3 className="text-info">
                    {savedReports.length > 0 ? Math.max(...savedReports.map(r => parseFloat(r.version))).toFixed(1) : '0.0'}
                  </h3>
                  <p className="text-muted mb-0">Latest Version</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Reports Table */}
        <Row>
          <Col>
            <Card>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-file-alt me-2"></i>
                  Report Overview
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {savedReports.length === 0 ? (
                  <div className="p-5 text-center">
                    <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
                    <h4 className="text-muted">No reports found</h4>
                    <p className="text-muted mb-4">
                      You haven't created any reports yet. 
                      Go to Compliance Overview to create your first report.
                    </p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Version</th>
                        <th>Title</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Standard</th>
                        <th>Policies</th>
                        <th>Completion</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedReports.sort((a, b) => parseFloat(b.version) - parseFloat(a.version)).map((report) => (
                        <tr key={report.id}>
                          <td>
                            <Badge bg="primary" className="fs-6 px-3 py-2">
                              v{report.version}
                            </Badge>
                          </td>
                          <td>
                            <strong>{report.title}</strong>
                            {report.approvedDate && (
                              <div>
                                <small className="text-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Approved: {new Date(report.approvedDate).toLocaleDateString('en-US')}
                                </small>
                              </div>
                            )}
                            {report.publishedDate && (
                              <div>
                                <small className="text-info">
                                  <i className="fas fa-globe me-1"></i>
                                  Published: {new Date(report.publishedDate).toLocaleDateString('en-US')}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <small>
                              {new Date(report.createdDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                              <br />
                              <span className="text-muted">
                                {new Date(report.createdDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </small>
                          </td>
                          <td>
                            <Badge bg={report.status === 'Approved' ? 'success' : report.status === 'Published' ? 'info' : 'warning'} className="px-3 py-2">
                              <i className={`fas fa-${report.status === 'Approved' ? 'check-circle' : report.status === 'Published' ? 'globe' : 'clock'} me-1`}></i>
                              {report.status}
                            </Badge>
                            {report.approvedBy && (
                              <div className="mt-1">
                                <small className="text-muted">
                                  Approved by: {report.approvedByName}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {report.standard}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="info" className="px-3 py-2">
                              {report.policies.length} policies
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress" style={{ width: '100px', height: '20px' }}>
                                <div 
                                  className={`progress-bar ${report.stats.percentage === 100 ? 'bg-success' : 'bg-warning'}`}
                                  role="progressbar" 
                                  style={{ width: `${report.stats.percentage}%` }}
                                  aria-valuenow={report.stats.percentage} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                >
                                  {report.stats.percentage}%
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => viewReportDetails(report)}
                              >
                                <i className="fas fa-eye me-1"></i>
                                View
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => openReceipt(report)}
                              >
                                <i className="fas fa-download me-1"></i>
                                Download
                              </Button>
                              {report.status === 'Approved' && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={goToComplianceOverview}
                                >
                                  <i className="fas fa-arrow-right me-1"></i>
                                  Go to Overview to Publish
                                </Button>
                              )}
                            </div>
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

        {/* Help Section */}
        {savedReports.length > 0 && (
          <Row className="mt-4">
            <Col>
              <Alert variant="info">
                <Alert.Heading>
                  <i className="fas fa-info-circle me-2"></i>
                  Report Help
                </Alert.Heading>
                <hr />
                <ul className="mb-0">
                  <li><strong>Approved:</strong> The report is approved and ready for publishing. Go to Compliance Overview to publish it.</li>
                  <li><strong>Published:</strong> The report is published and official. This locks the version.</li>
                  <li><strong>Download:</strong> Export the report as print-friendly HTML for documentation or backup.</li>
                  <li><strong>View:</strong> See the report's full content in a new window.</li>
                  <li><strong>Version:</strong> Each report automatically gets a unique version number (0.1, 0.2, etc.).</li>
                  <li><strong>Approval:</strong> All reports must be approved before they get a version number.</li>
                </ul>
              </Alert>
            </Col>
          </Row>
        )}
      </Container>
    </Layout>
  );
}

export default Reports;
