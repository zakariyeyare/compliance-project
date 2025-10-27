// layout kun for brugere
import { Col, Container, Row } from 'react-bootstrap';
import UserFooter from '../footers/UserFooter';
import UserHeader from '../headers/UserHeader';

const UserLayout = ({ children }) => {
  return (
    <>
      <UserHeader />
      <Container fluid className="mt-4 mb-4">
        <Row>
          <Col>
            {children}
          </Col>
        </Row>
      </Container>
      <UserFooter />
    </>
  );
};

export default UserLayout;