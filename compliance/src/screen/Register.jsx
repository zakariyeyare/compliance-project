import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Supabase from '../SupabaseClient';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validering
    if (password !== confirmPassword) {
      setError('Adgangskoderne matcher ikke');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Adgangskoden skal være mindst 6 karakterer');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await Supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Konto oprettet! Tjek din email for at bekræfte kontoen.');
        // Optionally redirect to login after a few seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Der opstod en fejl under registrering');
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
                <h2 className="fw-bold">Opret konto</h2>
                <p className="text-muted">Tilmeld dig Compliance App</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-3">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>Fulde navn</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Indtast dit fulde navn"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </Form.Group>

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
                    placeholder="Indtast din adgangskode (min. 6 karakterer)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength="6"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bekræft adgangskode</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Gentag din adgangskode"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Opretter konto...' : 'Opret konto'}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Har du allerede en konto?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Log ind her
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

export default Register;