import { Table, ListGroup, ButtonGroup, Button, Container } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import FirstServerService from '../services/firstServerService';
import {capitalizeWords} from  '../utils/general';


const AccessoriesTable = ({ accessories }) => {


    return (
        <Table striped bordered hover >
            <thead>
                <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>AMOUNT</th>

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
                        </tr>
                    ))}
            </tbody>
        </Table>
    );
};



export default AccessoriesTable;   