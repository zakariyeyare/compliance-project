import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Supabase from '../SupabaseClient';
import CustomCard from '../components/ui/CustomCard';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await Supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await Supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChooseCompliance = async () => {
    try {
      // Hent nuværende bruger
      const { data: { user: currentUser } } = await Supabase.auth.getUser();
      
      if (!currentUser) {
        alert('Bruger ikke logget ind');
        return;
      }

      // Auto-gem virksomhed med default-navn "My Company"
      const defaultCompanyName = 'My Company';

      const { error } = await Supabase
        .from('companies')
        .insert([
          {
            user_id: currentUser.id,
            company_name: defaultCompanyName,
            compliance_standard: 'GDPR'
          }
        ])
        .select();

      if (error) {
        console.error('Error saving company:', error);
        // Hvis gemning fejler, navigér alligevel (måske allerede gemt tidligere)
        console.warn('Continuing to GDPR despite company save error');
      }

      // Navigér til GDPR compliance
      navigate('/gdpr-compliance');
    } catch (err) {
      console.error('Exception in handleChooseCompliance:', err);
      // Navigér alligevel — fejlen skal ikke blokere flowet
      navigate('/gdpr-compliance');
    }
  };

  const handleViewReports = () => {
    // Hent gemte policies fra localStorage (både gamle og nye format)
    const savedPoliciesData = localStorage.getItem('gdpr_saved_policies');
    const detailedPoliciesData = localStorage.getItem('gdpr_saved_policies_detailed');
    
    let savedPolicies = {};
    let detailedPolicies = {};
    
    if (savedPoliciesData) {
      try {
        savedPolicies = JSON.parse(savedPoliciesData);
      } catch (error) {
        console.error('Error parsing saved policies:', error);
      }
    }
    
    if (detailedPoliciesData) {
      try {
        detailedPolicies = JSON.parse(detailedPoliciesData);
      } catch (error) {
        console.error('Error parsing detailed policies:', error);
      }
    }

    // Naviger til rapport oversigt med gemte policies
    navigate('/compliance-overview', {
      state: {
        fromReports: true,
        savedPolicies: savedPolicies,
        detailedPolicies: detailedPolicies
      }
    });
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Indlæser...</div>
      </Container>
    );
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">Compliance App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link onClick={handleChooseCompliance} style={{ cursor: 'pointer' }}>
                Compliance
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Item className="d-flex align-items-center me-3 text-light">
                Velkommen, {user?.user_metadata?.full_name || user?.email}
              </Nav.Item>
              <Button variant="outline-light" onClick={handleLogout}>
                Log ud
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Row className="mb-4">
          <Col>
            <h1>Dashboard</h1>
            <p className="text-muted">Velkommen til dit compliance dashboard</p>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <CustomCard
              title="Start GDPR Compliance"
              onClick={handleChooseCompliance}
            />
          </Col>
          <Col md={6} className="mb-4">
            <CustomCard
              title="Settings"
              onClick={() => alert('Settings clicked')}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Bruger Information</Card.Title>
                <Card.Text>
                  <strong>Email:</strong> {user?.email}<br />
                  <strong>Navn:</strong> {user?.user_metadata?.full_name || 'Ikke angivet'}<br />
                  <strong>Registreret:</strong> {new Date(user?.created_at).toLocaleDateString('da-DK')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Hurtige Handlinger</Card.Title>
                <div className="d-grid gap-2">
                  <Button variant="secondary" onClick={handleViewReports}>
                    <i className="fas fa-file-alt me-2"></i>
                    Se Alle Rapporter
                  </Button>
                  <Button variant="info" onClick={() => alert('Eksporter data')}>
                    Eksporter Data
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
