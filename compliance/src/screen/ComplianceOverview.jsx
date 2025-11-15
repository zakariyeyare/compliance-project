import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Table } from 'react-bootstrap';
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
  const [pendingApproval, setPendingApproval] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadComplianceData();
    loadSavedReports();
    loadCurrentUser();
    loadPendingApproval();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await Supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadPendingApproval = () => {
    const pendingData = localStorage.getItem('gdpr_pending_approval');
    if (pendingData) {
      setPendingApproval(JSON.parse(pendingData));
    }
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
      
      // Hent GDPR struktur
      const gdprResult = await gdprSupabaseService.getGDPRFullStructure();
      setGdprData(gdprResult);
      
      // Hent gemte politikker fra localStorage
      const savedPoliciesData = localStorage.getItem('gdpr_saved_policies');
      if (savedPoliciesData) {
        const parsed = JSON.parse(savedPoliciesData);
        setSavedPolicies(parsed);
        
        // Beregn statistikker (sikr at policy er en streng før trim)
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

  const requestApproval = () => {
    const completedPolicies = getCompletedPolicies();
    
    if (completedPolicies.length === 0) {
      alert('Ingen politikker at sende til godkendelse. Udfyld først nogle politikker.');
      return;
    }

    if (pendingApproval) {
      alert('Der er allerede en rapport til godkendelse. Godkend eller afvis den først.');
      return;
    }

    // Generer versionsnummer for den kommende rapport
    const latestVersion = savedReports.length > 0 
      ? Math.max(...savedReports.map(r => parseFloat(r.version))) 
      : 0;
    const newVersion = (latestVersion + 0.1).toFixed(1);

    const approvalRequest = {
      id: Date.now(),
      version: newVersion,
      title: `GDPR Compliance Rapport v${newVersion}`,
      requestedDate: new Date().toISOString(),
      requestedBy: currentUser?.email || 'Ukendt bruger',
      requestedByName: currentUser?.user_metadata?.full_name || currentUser?.email || 'Ukendt',
      standard: 'GDPR',
      stats: { ...stats },
      policies: completedPolicies,
      status: 'Afventer godkendelse'
    };

    localStorage.setItem('gdpr_pending_approval', JSON.stringify(approvalRequest));
    setPendingApproval(approvalRequest);
    
    alert('Rapporten er sendt til godkendelse!');
  };

  const approveReport = () => {
    if (!pendingApproval) return;

    const approvedReport = {
      ...pendingApproval,
      id: Date.now(),
      approvedDate: new Date().toISOString(),
      approvedBy: currentUser?.email || 'Ukendt godkender',
      approvedByName: currentUser?.user_metadata?.full_name || currentUser?.email || 'Ukendt',
      createdDate: new Date().toISOString(),
      status: 'Godkendt'
    };

    const updatedReports = [...savedReports, approvedReport];
    localStorage.setItem('gdpr_reports', JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
    
    // Fjern pending approval
    localStorage.removeItem('gdpr_pending_approval');
    setPendingApproval(null);
    
    alert(`Rapport v${approvedReport.version} er godkendt og oprettet!`);
  };

  const rejectApproval = () => {
    if (!pendingApproval) return;

    if (window.confirm('Er du sikker på at du vil afvise denne rapport?')) {
      localStorage.removeItem('gdpr_pending_approval');
      setPendingApproval(null);
      alert('Rapporten er afvist.');
    }
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
    const htmlContent = generateReportHTML(report);
    
    // Åbn i nyt vindue til print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Hjælpefunktion til at generere rapport HTML
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
            <div class="metadata-item"><div class="metadata-label">Oprettet Dato</div><div class="metadata-value">${new Date(report.createdDate).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>
        ${report.approvedBy ? `<div class="metadata-row">
            <div class="metadata-item"><div class="metadata-label">Godkendt Af</div><div class="metadata-value">${report.approvedByName}</div></div>
            <div class="metadata-item"><div class="metadata-label">Godkendt Dato</div><div class="metadata-value">${new Date(report.approvedDate).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>` : ''}
        ${report.publishedDate ? `<div class="metadata-row">
            <div class="metadata-item"><div class="metadata-label">Publiceret Dato</div><div class="metadata-value">${new Date(report.publishedDate).toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>` : ''}
    </div>
    <div class="section">
        <h2 class="section-title">📋 Compliance Politikker</h2>
        ${generatePoliciesHTML(report.policies)}
    </div>
    <div class="footer">
        <p><strong>${report.title}</strong></p>
        <p>Genereret: ${new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>© ${new Date().getFullYear()} Compliance App - Alle rettigheder forbeholdes</p>
    </div>
</body>
</html>`;
  };

  const generatePoliciesHTML = (policies) => {
    let html = '';
    policies.forEach((policy, index) => {
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
          <div className="mt-2">Indlæser compliance oversigt...</div>
        </div>
      </Container>
    );
  }

  const completedPolicies = getCompletedPolicies();

  return (
    <Layout title="Compliance Oversigt">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col md={8}>
            <h1 className="text-primary">GDPR Compliance Oversigt</h1>
            <p className="text-muted">Oversigt over dine gemte compliance politikker</p>
          </Col>
          <Col md={4} className="text-end">
            <Button 
              variant="outline-secondary" 
              onClick={goBackToGDPR}
              className="me-2"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Tilbage til GDPR
            </Button>
            <Button 
              variant="warning" 
              onClick={requestApproval}
              disabled={completedPolicies.length === 0 || pendingApproval !== null}
              className="me-2"
            >
              <i className="fas fa-paper-plane me-2"></i>
              Send til Godkendelse
            </Button>
          </Col>
        </Row>

        {/* Pending Approval Section */}
        {pendingApproval && (
          <Row className="mb-4">
            <Col>
              <Alert variant="warning">
                <Alert.Heading>
                  <i className="fas fa-clock me-2"></i>
                  Rapport Afventer Godkendelse
                </Alert.Heading>
                <hr />
                <Row>
                  <Col md={8}>
                    <p className="mb-2">
                      <strong>Version:</strong> <Badge bg="primary">v{pendingApproval.version}</Badge>
                    </p>
                    <p className="mb-2">
                      <strong>Titel:</strong> {pendingApproval.title}
                    </p>
                    <p className="mb-2">
                      <strong>Anmodet af:</strong> {pendingApproval.requestedByName} ({pendingApproval.requestedBy})
                    </p>
                    <p className="mb-2">
                      <strong>Anmodet dato:</strong> {new Date(pendingApproval.requestedDate).toLocaleString('da-DK')}
                    </p>
                    <p className="mb-2">
                      <strong>Politikker:</strong> {pendingApproval.policies.length} stk
                    </p>
                    <p className="mb-0">
                      <strong>Completion:</strong> {pendingApproval.stats.percentage}% ({pendingApproval.stats.completed}/{pendingApproval.stats.total})
                    </p>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button 
                      variant="success" 
                      onClick={approveReport}
                      className="me-2 mb-2"
                      size="lg"
                    >
                      <i className="fas fa-check me-2"></i>
                      Godkend Rapport
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={rejectApproval}
                      size="lg"
                    >
                      <i className="fas fa-times me-2"></i>
                      Afvis
                    </Button>
                  </Col>
                </Row>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h3 className="text-primary">{stats.completed}</h3>
                <p className="text-muted mb-0">Udfyldte Politikker</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-info">
              <Card.Body>
                <h3 className="text-info">{stats.total}</h3>
                <p className="text-muted mb-0">Total Politikker</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-success">
              <Card.Body>
                <h3 className="text-success">{stats.percentage}%</h3>
                <p className="text-muted mb-0">Færdiggørelsesgrad</p>
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
                <strong>Fantastisk!</strong> Du har udfyldt alle GDPR politikker.
              </Alert>
            ) : stats.percentage >= 50 ? (
              <Alert variant="warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Godt arbejde!</strong> Du har udfyldt {stats.percentage}% af politikkerne. 
                Fortsæt med at færdiggøre de resterende.
              </Alert>
            ) : (
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Kom i gang!</strong> Du har udfyldt {stats.percentage}% af politikkerne. 
                Der er stadig meget arbejde at gøre.
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
                    Gemte Rapporter ({savedReports.length})
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover>
                    <thead className="table-light">
                      <tr>
                        <th>Version</th>
                        <th>Titel</th>
                        <th>Oprettet</th>
                        <th>Status</th>
                        <th>Politikker</th>
                        <th>Handlinger</th>
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
                              {new Date(report.createdDate).toLocaleDateString('da-DK', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </td>
                          <td>
                            <Badge bg={report.status === 'Publiceret' ? 'success' : 'warning'}>
                              {report.status}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="info">
                              {report.policies.length} politikker
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {report.status === 'Udkast' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => publishReport(report.id)}
                                >
                                  <i className="fas fa-check me-1"></i>
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
                  Udfyldte Politikker ({completedPolicies.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {completedPolicies.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
                    <h5>Ingen politikker udfyldt endnu</h5>
                    <p>Gå tilbage til GDPR Compliance for at udfylde dine politikker.</p>
                    <Button variant="primary" onClick={goBackToGDPR}>
                      <i className="fas fa-plus me-2"></i>
                      Start med at udfylde politikker
                    </Button>
                  </div>
                ) : (
                  <Table responsive striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Kontrolmål</th>
                        <th>Underkontrol</th>
                        <th>Politik / Evidens</th>
                        <th>Aktiviteter</th>
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
                                Ingen aktiviteter
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
    </Layout>
  );
}

export default ComplianceOverview;
