import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Supabase from '../SupabaseClient';
import CustomCard from '../components/ui/CustomCard';
import Layout from '../components/ui/Layout';

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
            <p className="text-muted">Velkommen til dit compliance dashboard</p>
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
              title="Alle Rapporter"
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
                  <Button variant="primary" onClick={handleChooseCompliance}>
                    <i className="fas fa-shield-alt me-2"></i>
                    Start GDPR Compliance
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/reports')}>
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
    </Layout>
  );
}

export default Dashboard;
