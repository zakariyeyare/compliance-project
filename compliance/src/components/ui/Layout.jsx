import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Layout({ title, actions, children, fluid = false }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <div className="app-layout">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={NavLink} to="/dashboard">Compliance App</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={NavLink} to="/gdpr-compliance">GDPR Compliance</Nav.Link>
              <Nav.Link as={NavLink} to="/compliance-overview">Compliance Overview</Nav.Link>
              <Nav.Link as={NavLink} to="/reports">All Reports</Nav.Link>
            </Nav>
            <Nav className="ms-auto align-items-center">
              {user && (
                <span className="me-3 text-light small">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              )}
              {user ? (
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Log ud</Button>
              ) : (
                <Button variant="outline-light" size="sm" onClick={() => navigate('/login')}>Log ind</Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid={fluid} className="page-container">
        {(title || actions) && (
          <div className="page-header d-flex align-items-center justify-content-between mb-4">
            {title && <h1 className="page-title m-0">{title}</h1>}
            {actions && <div className="page-actions">{actions}</div>}
          </div>
        )}
        {children}
      </Container>
    </div>
  );
}

export default Layout;
