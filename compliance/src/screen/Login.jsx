import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        // Login successful - navigation will be handled by AuthContext
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Der opstod en fejl under login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Log ind</h2>
                <p className="text-muted">Velkommen tilbage til Compliance App</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email adresse</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Indtast din email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adgangskode</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Indtast din adgangskode"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Logger ind...' : 'Log ind'}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Har du ikke en konto?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Opret konto her
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;