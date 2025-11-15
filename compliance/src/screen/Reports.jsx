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

  const publishReport = (reportId) => {
    const updatedReports = savedReports.map(report => {
      if (report.id === reportId) {
        return { ...report, status: 'Publiceret', publishedDate: new Date().toISOString() };
      }
      return report;
    });
    
    localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
    alert('Rapporten er nu publiceret!');
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Er du sikker på at du vil slette denne rapport?')) {
      const updatedReports = savedReports.filter(report => report.id !== reportId);
      localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
      setSavedReports(updatedReports);
    }
  };

  const exportReport = (report) => {
    // Opret print-venlig HTML dokument
    const htmlContent = `
<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        @media print {
            @page {
                margin: 2cm;
                size: A4;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .page-break {
                page-break-after: always;
            }
            .no-print {
                display: none;
            }
        }
        
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
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
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
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0066cc;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
            background: #0052a3;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">
        🖨️ Print / Gem som PDF
    </button>
    
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
                <div class="metadata-label">Oprettet Dato</div>
                <div class="metadata-value">${new Date(report.createdDate).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>
        ${report.approvedBy ? `
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Godkendt Af</div>
                <div class="metadata-value">${report.approvedByName}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Godkendt Dato</div>
                <div class="metadata-value">${new Date(report.approvedDate).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>` : ''}
        ${report.publishedDate ? `
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Publiceret Dato</div>
                <div class="metadata-value">${new Date(report.publishedDate).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>` : ''}
    </div>
    
    <div class="section">
        <h2 class="section-title">📋 Compliance Politikker</h2>
        ${generatePoliciesHTML(report.policies)}
    </div>
    
    <div class="footer">
        <p><strong>${report.title}</strong></p>
        <p>Genereret: ${new Date().toLocaleDateString('da-DK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>© ${new Date().getFullYear()} Compliance App - Alle rettigheder forbeholdes</p>
    </div>
</body>
</html>
    `;
    
    // Åbn i nyt vindue til print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Hjælpefunktion til at generere politikker HTML
  function generatePoliciesHTML(policies) {
    let html = '';
    policies.forEach((policy, index) => {
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
    // Opret HTML dokument uden print knap
    const htmlContent = generateViewHTML(report);
    
    // Åbn i nyt vindue
    const viewWindow = window.open('', '_blank');
    viewWindow.document.write(htmlContent);
    viewWindow.document.close();
  };

  // Hjælpefunktion til at generere view HTML (uden print knap)
  const generateViewHTML = (report) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="da">
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
                <div class="metadata-label">Oprettet Dato</div>
                <div class="metadata-value">${new Date(report.createdDate).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>
        ${report.approvedBy ? `
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Godkendt Af</div>
                <div class="metadata-value">${report.approvedByName}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Godkendt Dato</div>
                <div class="metadata-value">${new Date(report.approvedDate).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>` : ''}
        ${report.publishedDate ? `
        <div class="metadata-row">
            <div class="metadata-item">
                <div class="metadata-label">Publiceret Dato</div>
                <div class="metadata-value">${new Date(report.publishedDate).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>` : ''}
    </div>
    
    <div class="section">
        <h2 class="section-title">📋 Compliance Politikker</h2>
        ${generatePoliciesHTML(report.policies)}
    </div>
    
    <div class="footer">
        <p><strong>${report.title}</strong></p>
        <p>Genereret: ${new Date().toLocaleDateString('da-DK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>© ${new Date().getFullYear()} Compliance App - Alle rettigheder forbeholdes</p>
    </div>
</body>
</html>
    `;
    return htmlContent;
  };

  if (loading) {
    return (
      <Layout title="Alle Rapporter">
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2">Indlæser rapporter...</div>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Alle Rapporter">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col md={8}>
            <h1 className="text-primary">
              <i className="fas fa-folder-open me-3"></i>
              Alle Rapporter
            </h1>
            <p className="text-muted">Oversigt over alle dine gemte GDPR compliance rapporter</p>
          </Col>
          <Col md={4} className="text-end">
            <Button 
              variant="outline-secondary" 
              onClick={goToDashboard}
              className="me-2"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Tilbage til Dashboard
            </Button>
            <Button 
              variant="primary" 
              onClick={goToComplianceOverview}
            >
              <i className="fas fa-plus me-2"></i>
              Opret Ny Rapport
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards - kun vis hvis der er rapporter */}
        {savedReports.length > 0 && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <h3 className="text-primary">{savedReports.length}</h3>
                  <p className="text-muted mb-0">Total Rapporter</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <h3 className="text-success">
                    {savedReports.filter(r => r.status === 'Publiceret').length}
                  </h3>
                  <p className="text-muted mb-0">Publicerede</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <h3 className="text-warning">
                    {savedReports.filter(r => r.status === 'Udkast').length}
                  </h3>
                  <p className="text-muted mb-0">Udkast</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-info">
                <Card.Body>
                  <h3 className="text-info">
                    {savedReports.length > 0 ? Math.max(...savedReports.map(r => parseFloat(r.version))).toFixed(1) : '0.0'}
                  </h3>
                  <p className="text-muted mb-0">Seneste Version</p>
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
                  Rapport Oversigt
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {savedReports.length === 0 ? (
                  <div className="p-5 text-center">
                    <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
                    <h4 className="text-muted">Ingen rapporter fundet</h4>
                    <p className="text-muted mb-4">
                      Du har endnu ikke oprettet nogen rapporter. 
                      Gå til Compliance Oversigt for at oprette din første rapport.
                    </p>
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={goToComplianceOverview}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Opret Din Første Rapport
                    </Button>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Version</th>
                        <th>Titel</th>
                        <th>Oprettet</th>
                        <th>Status</th>
                        <th>Standard</th>
                        <th>Politikker</th>
                        <th>Completion</th>
                        <th>Handlinger</th>
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
                                  Godkendt: {new Date(report.approvedDate).toLocaleDateString('da-DK')}
                                </small>
                              </div>
                            )}
                            {report.publishedDate && (
                              <div>
                                <small className="text-info">
                                  <i className="fas fa-globe me-1"></i>
                                  Publiceret: {new Date(report.publishedDate).toLocaleDateString('da-DK')}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <small>
                              {new Date(report.createdDate).toLocaleDateString('da-DK', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                              <br />
                              <span className="text-muted">
                                {new Date(report.createdDate).toLocaleTimeString('da-DK', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </small>
                          </td>
                          <td>
                            <Badge bg={report.status === 'Godkendt' ? 'success' : report.status === 'Publiceret' ? 'info' : 'warning'} className="px-3 py-2">
                              <i className={`fas fa-${report.status === 'Godkendt' ? 'check-circle' : report.status === 'Publiceret' ? 'globe' : 'clock'} me-1`}></i>
                              {report.status}
                            </Badge>
                            {report.approvedBy && (
                              <div className="mt-1">
                                <small className="text-muted">
                                  Godkendt af: {report.approvedByName}
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
                              {report.policies.length} politikker
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
                                Vis
                              </Button>
                              {report.status === 'Godkendt' && (
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => publishReport(report.id)}
                                >
                                  <i className="fas fa-globe me-1"></i>
                                  Publicer
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
                                disabled={report.status === 'Publiceret'}
                              >
                                <i className="fas fa-trash me-1"></i>
                                Slet
                              </Button>
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
                  Hjælp til Rapporter
                </Alert.Heading>
                <hr />
                <ul className="mb-0">
                  <li><strong>Godkendt:</strong> Rapporten er godkendt og klar til publicering. Viser hvem der godkendte og hvornår.</li>
                  <li><strong>Publiceret:</strong> Rapporten er offentliggjort og officiel. Dette låser versionen.</li>
                  <li><strong>Download:</strong> Eksporter rapporten som JSON fil til dokumentation eller backup.</li>
                  <li><strong>Version:</strong> Hver rapport får automatisk et unikt versionsnummer (0.1, 0.2, osv.).</li>
                  <li><strong>Godkendelse:</strong> Alle rapporter skal godkendes før de får et versionsnummer.</li>
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
