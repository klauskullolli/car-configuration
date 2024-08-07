import { Table, ListGroup, ButtonGroup, Button, Container } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import FirstServerService from '../services/firstServerService';


const CarsTable = ({ cars, setCats, setError }) => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const firstServerService = new FirstServerService();

    const configureCar = async (id) => {
        console.log('configure car', id);

        try {
            if (!auth) {
                navigate('/login');
                return;
            }   

            let data = await firstServerService.createConfiguration(id);
            console.log('data', data);
            navigate('/configuration');
        }
        catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'unauthenticated') {
                setAuth(false);
                navigate('/login');
                return;
            }
            setError(error?.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <Table striped bordered hover >
            <thead>
                <tr>
                    <th>ID</th>
                    <th>MODEL</th>
                    <th>ENGINE</th>
                    <th>PRICE</th>
                    <th>SELECT</th>
                </tr>
            </thead>
            <tbody>

                {(!cars || cars.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No Car Found</td></tr> :
                    cars.map((item, index) => (
                        <tr key={index}>
                            <td>{item?.id}</td>
                            <td>{item?.model}</td>
                            <td>{item?.engine} KW</td>
                            <td>{item?.price} €</td>
                            <td>
                                <Button variant='primary' onClick={() => configureCar(item?.id)}>Configure</Button>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </Table>
    );
};



export default CarsTable;   