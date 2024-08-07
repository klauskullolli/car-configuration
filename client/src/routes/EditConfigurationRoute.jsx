import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import FirstServerService from "../services/firstServerService";
import { Table, Alert, ButtonGroup, Button, Container, Row, Col, Modal } from "react-bootstrap";
import { capitalizeWords, CONFIGURATION_STATUS } from '../utils/general';



const EditConfiguration = () => {

    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requestError, setRequestError] = useState(null);
    const [configuration, setConfiguration] = useState(null);
    const [accessories, setAccessories] = useState([]);
    const [selectChange, setSelectChange] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const firstServerService = new FirstServerService();

    useEffect(() => {

        const checkAuth = async () => {
            try {
                let data = await firstServerService.auth();
                setAuth(true);
            }
            catch (error) {
                setAuth(false);
                navigate('/login', { state: { from: '/edit-configuration' } });
            }
        };

        const getConfiguration = async () => {
            try {
                let data = await firstServerService.getConfiguration();
                if (data?.status === CONFIGURATION_STATUS.COMPLETE) {
                    navigate('/configuration');
                    return;
                }
                setConfiguration(data);
            }
            catch (error) {

                if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                    setAuth(false);
                    navigate('/login', { state: { from: '/edit-configuration' } });
                    return;
                }

                if (error?.response?.data?.type === 'not_found') {
                    navigate('/configuration');
                    return;
                }

                setRequestError(error?.response?.data?.message || "Something went wrong");
                setShowModal(true);
            }
        };


        const getAccessories = async () => {
            try {
                let data = await firstServerService.getAccessories();
                setAccessories(data);
            }
            catch (error) {
                setRequestError(error?.response?.data?.message || "Something went wrong");
                setShowModal(true);
            }
        };

        checkAuth();
        getConfiguration();
        getAccessories();

        return () => {
            setConfiguration(null);
            setAccessories([]);
            setShowModal(false);
            setRequestError(null);

        }

    }, []);


    const checkIfHaveAccessory = (accessory) => {
        return configuration?.accessories?.find(item => item.id === accessory.id);
    }

    const onAddAccessory = async (accessory) => {
        try {
            setRequestError(null);
            setShowModal(false);

            let maxAccessories = configuration?.car?.maxAccessories || 0;
            if (configuration?.accessories?.length >= maxAccessories) {
                setRequestError(`Limit is ${maxAccessories} Max accessories reached`);
                return;
            }

            if (checkIfHaveAccessory(accessory)) {
                setRequestError('Accessory already added');
                setShowModal(true);
                return;
            }

            let data = await firstServerService.checkSafeAddingAccessory(configuration?.accessories, accessory.id);
            let tempConfiguration = { ...configuration };
            tempConfiguration.accessories.push({ ...accessory });
            tempConfiguration.totalPrice += accessory.price;
            accessories.find(item => item.id === accessory.id).amount -= 1;
            console.log(tempConfiguration);
            setConfiguration(tempConfiguration);
            setSelectChange(true);
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/edit-configuration' } });
                return;
            }
            setRequestError(error?.response?.data?.message || 'Something went wrong');
            setShowModal(true);
        }
    }

    const onRemoveAccessory = async (accessory) => {
        try {
            setRequestError(null);
            console.log('remove accessory', accessory);
            let data = await firstServerService.checkSafeRemovingAccessory(configuration?.accessories, accessory.id);
            let tempConfiguration = { ...configuration };
            tempConfiguration.accessories = tempConfiguration.accessories.filter(item => item.id !== accessory.id);
            tempConfiguration.totalPrice -= accessory.price;
            accessories.find(item => item.id === accessory.id).amount += 1;
            setConfiguration(tempConfiguration);
            setSelectChange(true);
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/edit-configuration' } });
                return;
            }
            setRequestError(error?.response?.data?.message || 'Something went wrong');
            setShowModal(true);
        }
    };

    const onCancel = () => {
        navigate('/configuration');
    };

    const onSave = async () => {
        try {
            setRequestError(null);
            let data = await firstServerService.saveConfiguration(configuration?.accessories);
            setSelectChange(false);
            navigate('/configuration');
        }
        catch (error) {
            console.log(error);
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login', { state: { from: '/edit-configuration' } });
                return;
            }
            setRequestError(error?.response?.data?.message || 'Something went wrong');
            setShowModal(true);
        }
    };


    const onModalClose = () => {
        setShowModal(false);
        console.log('modal close'); 
        setRequestError(null);
    };

    const AccessoriesTable = () => {
        return (
            <Table striped bordered hover >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>AMOUNT</th>
                        <th>ACTION</th>

                    </tr>
                </thead>
                <tbody>

                    {(!accessories || accessories.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No Accessory Found</td></tr> :
                        accessories.map((item, index) => (
                            <tr key={index}>
                                <td>{item?.id}</td>
                                <td>{capitalizeWords(item?.name)}</td>
                                <td>{item?.price} €</td>
                                <td>{item?.amount}</td>
                                <td>
                                    <Button variant='primary' onClick={() => onAddAccessory(item)}><i className="bi bi-plus-circle"></i></Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        );
    };


    const SelectedAccessoriesTable = () => {
        return (
            <Table striped bordered hover >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>

                    {(!configuration?.accessories || configuration?.accessories?.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No Selected Accessories Found</td></tr> :
                        configuration?.accessories.map((item, index) => (
                            <tr key={index}>
                                <td>{item?.id}</td>
                                <td>{capitalizeWords(item?.name)}</td>
                                <td>{item?.price} €</td>
                                <td>
                                    <Button variant='danger' onClick={() => onRemoveAccessory(item)}><i className="bi bi-trash"></i></Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        );
    };

    return (
        <Container fluid>
            <Row className="mt-3 mb-2">
                <h1>Edit Configuration</h1>
            </Row>

            <Row className="mt-3 mb-2">
                <h3>Accessories</h3>
            </Row>

            <Row className="mb-2">
                <Col>
                    <AccessoriesTable />
                </Col>
            </Row>

            <Row className="mt-3 mb-2">
                <h3>Selected Accessories</h3>
            </Row>

            <Row className="mb-2">
                <Col>
                    <SelectedAccessoriesTable />
                </Col>
            </Row>

            <Row className="mb-2 me-3">
                <Col className="d-flex justify-content-end">
                    <h4>Total: {configuration?.totalPrice || 0} €</h4>
                </Col>
            </Row>

            <Row className="mb-2 me-3">
                <Col className="d-flex justify-content-end">
                    <Button variant="danger" className="me-3" onClick={onCancel}>Cancel</Button>
                    <Button variant="success" disabled={!selectChange} onClick={onSave}>Save</Button>
                </Col>
            </Row>

            {
               requestError && <Modal show={showModal} onHide={onModalClose} className="error-modal">
                    <Modal.Header closeButton >
                        <Modal.Title >
                            <p className="error-modal-header">Error <i className="bi bi-ban"></i></p>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="error-modal-body">{requestError}</p>
                    </Modal.Body>

                </Modal>
            }

        </Container>
    )
};

export default EditConfiguration;   