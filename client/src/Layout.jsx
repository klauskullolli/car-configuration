import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import firstServerService from "./services/firstServerService";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthProvider";

const Layout = () => {

    const { auth, setAuth } = useContext(AuthContext);  

    const navigate = useNavigate();

    useEffect(() => {

        const checkAuth = async () => {
            try {
                const service = new firstServerService();
                await service.auth();
                setAuth(true);

            } catch (error) {
                console.log('Error:', error);
                setAuth(false);
                
            }
        }

        checkAuth();

    }, []);



    const logoutHandler = async () => {
        console.log('logoutHandler');
        try {
            const service = new firstServerService();
            await service.logout();
            setAuth(false);
            navigate('/');
        } catch (error) {
            console.log('Error:', error);
        }
    }

    const Headers = () => {

        return (

            <Navbar bg="primary" data-bs-theme="dark" expand="lg">
                <Container fluid>

                    <Nav className="me-auto nav-link-large">
                        <Nav.Link as={Link} to={'/'}  >Home</Nav.Link>
                        {auth && <Nav.Link as={Link} to={'/configuration'}>My Configuration</Nav.Link>}     
                    </Nav>


                    <Nav className="nav-link-large">
                        {auth
                            ? <Nav.Link className="icon-size" onClick={logoutHandler}><i className="bi bi-box-arrow-right logout-icon-size"></i></Nav.Link>
                            : <Nav.Link as={Link} to={'/login'}>Login</Nav.Link>
                        }
                    </Nav>
                </Container>
            </Navbar>
        );
    };


    return (
        <div>
            <Headers />
            <Outlet />
        </div>
    );

};


export default Layout;
