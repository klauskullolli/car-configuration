import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import FirstServerService from "../services/firstServerService";
import SecondServerService from "../services/secondServerService";
import { Table, Alert, ButtonGroup, Button, Container, Row, Col } from "react-bootstrap";
import { capitalizeWords, CONFIGURATION_STATUS } from '../utils/general';



const Configuration = () => {

    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requestError, setRequestError] = useState(null);
    const [configuration, setConfiguration] = useState(null);
    const [disableAccessories, setDisableAccessories] = useState(false);
    const [disableConfiguration, setDisableConfiguration] = useState(true);
    const firstServerService = new FirstServerService();


    useEffect(() => {

        const checkAuth = async () => {
            try {
                let data = await firstServerService.auth();
                setAuth(true);
            }
            catch (error) {
                setAuth(false);
                navigate('/login', { state: { from: '/configuration' } });
            }
        };

        const getConfiguration = async () => {
            try {
                let data = await firstServerService.getConfiguration();
                // console.log(data);
                if (data?.status === CONFIGURATION_STATUS.COMPLETE) {
                    let tokenData = await firstServerService.generateTokenForServer2();
                    let secondServerService = new SecondServerService(tokenData?.token);
                    try {
                        let server2Data = await secondServerService.estimate(data?.accessories);
                        data.estimation = server2Data?.estimation;
                    }
                    catch (error) {
                        setRequestError("Could not get estimation from server 2");
                    }
                }
                setConfiguration(data);
            }
            catch (error) {

                if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                    setAuth(false);
                    navigate('/login', { state: { from: '/configuration' } });
                    return;
                }

                setRequestError(error?.response?.data?.message || "Something went wrong");
            }
        }

        checkAuth();
        getConfiguration();

        return () => {
            setConfiguration(null);
            setRequestError(null);
            setDisableAccessories(false);
            setDisableConfiguration(true);
        };
    }, []);


    const onConfigurationButtonClick = async () => {
        try {
            let data = await firstServerService.getConfiguration();
            if (data?.status === CONFIGURATION_STATUS.COMPLETE) {
                let tokenData = await firstServerService.generateTokenForServer2();
                let secondServerService = new SecondServerService(tokenData?.token);
                try {
                    let server2Data = await secondServerService.estimate(data?.accessories);
                    data.estimation = server2Data?.estimation;
                }
                catch (error) {
                    setRequestError("Could not get estimation from server 2");
                }
            }
            setConfiguration(data);
            setDisableConfiguration(true);
            setDisableAccessories(false);
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/configuration' } });
                return;
            }

            setRequestError(error?.response?.data?.message || "Something went wrong");
        }

    };

    const onAccessoriesButtonClick = async () => {
        try {
            let data = await firstServerService.getConfiguration();
            setConfiguration(data);
            setDisableAccessories(true);
            setDisableConfiguration(false);
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/configuration' } });
                return;
            }
            setRequestError(error?.response?.data?.message || "Something went wrong");
        }
    };

    const onConfirmComplete = async () => {
        try {
            let newConfiguration = { ...configuration }; 
            let data = await firstServerService.confirmConfigurationComplete();
            let tokenData = await firstServerService.generateTokenForServer2();
            let secondServerService = new SecondServerService(tokenData?.token);
            try {
                let server2Data = await secondServerService.estimate(data?.accessories);
                newConfiguration.estimation = server2Data?.estimation;
            }
            catch (error) {
                setRequestError("Could not get estimation from server 2");
            }
            
            newConfiguration.status = CONFIGURATION_STATUS.COMPLETE;
            setConfiguration(newConfiguration);
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/configuration' } });
                return;
            }
            setRequestError(error?.response?.data?.message || "Something went wrong");
        }
    };

    const onDeleteConfiguration = async () => {
        try {
            let data = await firstServerService.deleteConfiguration();
            setConfiguration(null);
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/configuration' } });
                return;
            }
            setRequestError(error?.response?.data?.message || "Something went wrong");
        }
    };


    const AccessoriesTable = ({ accessories }) => {


        return (
            <Table striped bordered hover >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                    </tr>
                </thead>
                <tbody>

                    {(!accessories || accessories.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No Accessory Found</td></tr> :
                        accessories.map((item, index) => (
                            <tr key={index}>
                                <td>{item?.id}</td>
                                <td>{capitalizeWords(item?.name)}</td>
                                <td>{item?.price} €</td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        );
    };

    const editConfigurationButtAction = () => {
        navigate('/edit-configuration');
    };

    return (
        <Container fluid>
            <Row className="mt-3 mb-2">
                <h1>My Configuration</h1>
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
                {
                    configuration &&
                    <Col>
                        <ButtonGroup>
                            <Button variant="outline-primary" onClick={onConfigurationButtonClick} disabled={disableConfiguration}>Configuration</Button>
                            <Button variant="outline-primary" onClick={onAccessoriesButtonClick} disabled={disableAccessories}>Accessories</Button>
                        </ButtonGroup>
                    </Col>
                }
            </Row>


            <Row className="mb-2">
                <Col>
                    {
                        disableConfiguration && <Table striped bordered hover >
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>MODEL</th>
                                    <th>MODEL PRICE</th>
                                    <th>ENDING</th>
                                    <th>TOTAL PRICE</th>
                                    <th>STATUS</th>
                                    {configuration?.estimation && <th>PRODUCE ESTIMATION</th>}
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>

                                {!configuration ? <tr><td colSpan='16' className='text-center fs-4'>No Configuration Found</td></tr> :

                                    <tr>
                                        <td>{configuration?.id}</td>
                                        <td>{configuration?.car?.model}</td>
                                        <td>{configuration?.car?.price} €</td>
                                        <td>{configuration?.car?.engine} KW</td>
                                        <td>{configuration?.totalPrice} €</td>
                                        <td>{configuration?.status ? configuration?.status.toUpperCase() : ""}</td>
                                        {configuration?.estimation && <td>{configuration?.estimation} days</td>}
                                        <td>
                                            <ButtonGroup>
                                                {
                                                    !(configuration?.status === CONFIGURATION_STATUS.COMPLETE) &&
                                                    <Button variant='warning' className="me-3" onClick={editConfigurationButtAction}><i className="bi bi-pencil-fill"></i></Button>
                                                }
                                                <Button variant='danger' onClick={onDeleteConfiguration}><i className="bi bi-trash3-fill"></i></Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </Table>
                    }

                    {
                        disableAccessories && <AccessoriesTable accessories={configuration?.accessories} />
                    }
                </Col>
            </Row>

            {
                configuration && !(configuration?.status === CONFIGURATION_STATUS.COMPLETE) &&
                <Row className="mb-2">
                    <Col className="d-flex justify-content-center">
                        <Button variant="primary" onClick={onConfirmComplete}>Confirm Completion</Button>
                    </Col>
                </Row>
            }


        </Container>
    );
};

export default Configuration;
