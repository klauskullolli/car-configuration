import { useState } from 'react'
import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap'
import './App.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthProvider';
import Layout from './Layout';
import Login from './routes/LoginRoute';
import Cars from './routes/CarsRoute';  
import Configuration from './routes/ConfigurationRoute';
import EditConfiguration from './routes/EditConfigurationRoute';


function App() {

  function NotFound() {
    return (
      <Container fluid className='mt-5'>
        <div className='alert-component'>
          <center>
            <Row className='mb-5'>
            </Row>
            <Row className='mb-5'>
            </Row>
            <Row>
              <Col>
                <Alert variant='danger' >
                  <Alert.Heading ><h2>404</h2></Alert.Heading>
                  <p className='h3'>Page Not Found!</p>
                </Alert>
              </Col>
            </Row>
          </center>

        </div>
      </Container>
    )
  };

  return (

    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route path='/' element={<Cars/>} />
            <Route path='/cars' element={<Cars />} />
            <Route path='/configuration' element={<Configuration />} />
            <Route path='/edit-configuration' element={<EditConfiguration />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>


  )
}

export default App
