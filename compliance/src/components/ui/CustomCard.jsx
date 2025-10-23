import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


function CustomCard({ title, onClick }) {
    return (
        <Card style={{ width: '40rem' }}>   
            <Card.Body>
                <Button variant="primary" onClick={onClick}>
                    {title}
                </Button>
            </Card.Body>
        </Card>
    );
}

function Cards() {
    // Example of rendering multiple CustomCard components
    const cards = [];
    const numCards = 5; // Number of cards to render
    for (let i = 1; i <= numCards; i++) {
        cards.push(
            <CustomCard
                key={i}
                title={`Card ${i}`}
                onClick={() => alert(`Button ${i} clicked`)}
            />
        );
    }
    return (
        <div>
            {cards}
        </div>          
    );
}

export default CustomCard