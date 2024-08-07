import { useState, useEffect, useContext} from "react";
import { Container, Row, Col, Button, Alert, FormControl ,ButtonGroup } from "react-bootstrap";
import { AuthContext } from "../context/AuthProvider";  
import { useNavigate } from "react-router-dom";
import FirstServerService from "../services/firstServerService";
import CarsTable from "../components/CarsTableComponent";
import AccessoriesTable from "../components/AccessoriesTableComponent";



const Cars = () => {

    const { auth, setAuth } = useContext(AuthContext);  
    const navigate = useNavigate();
    const [requestError, setRequestError] = useState(null);
    const [cars, setCars] = useState([]);
    const [accessories, setAccessories] = useState([]);
    const [showCars, setShowCars] = useState(true); 
    const [showAccessories, setShowAccessories] = useState(false);
    const [disableAccessories, setDisableAccessories] = useState(false);    
    const [disableCars, setDisableCars] = useState(true);  

    const firstServerService = new FirstServerService();    

    useEffect(() => {

        const fetchCars = async () => { 
            try {
                let data = await firstServerService.getCars();
                setCars(data);
            }
            catch (error) {
                setRequestError(error.message);
            }   
        }

        fetchCars(); 
        
        
        return () => {
            setCars([]);
            setAccessories ([]);
            setRequestError(null);  
            setShowCars(true);
            setShowAccessories(false);  

        }
    }, []);    


    const onAccessoriesButtonClick = async () => {
        try {
            let data = await firstServerService.getAccessories();
            setAccessories(data);
            setShowCars(false);
            setShowAccessories(true);
            setDisableAccessories(true);
            setDisableCars(false);
        }
        catch (error) {
            setRequestError(error.message);
        }   
    }; 

    const onCarsButtonClick = async () => {
        try {
            let data = await firstServerService.getCars();
            setCars(data);
            setShowCars(true);
            setShowAccessories(false);
            setDisableAccessories(false);
            setDisableCars(true);
        }
        catch (error) {
            setRequestError(error.message);
        }   
    }; 
   
    return (
        <Container fluid>
        <Row className="mt-3 mb-2">
            <h1>Cars and Accessories</h1>
        </Row>


        <Row className="mb-2">
            <Col>
                {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible>
                    <p>
                        {requestError}
                    </p>
                </Alert>}
            </Col>
        </Row>

        <Row className="mb-5">
            <Col>
                <ButtonGroup>
                    <Button variant="outline-primary" onClick={onCarsButtonClick} disabled={disableCars}>Cars</Button>
                    <Button variant="outline-primary" onClick={onAccessoriesButtonClick} disabled={disableAccessories}>Accessories</Button>
                </ButtonGroup>
            </Col>
        </Row>

        <Row className="mb-2">  
            <Col>
                {showCars &&  <CarsTable cars={cars} setCars={setCars} setError={setRequestError} />}
                {showAccessories && <AccessoriesTable accessories={accessories}/>}
            </Col>
            
        </Row>


    </Container>
    ); 
}

export default Cars;