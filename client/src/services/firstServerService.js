import axios from 'axios';
import config from '../config.js';

const server1 = config?.server1 || 'http://localhost:3001';

const FirstServerService = function () {
    this.login = async (username, password) => {
        try {
            let response = await axios.post(`${server1}/login`, { username, password }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.logout = async () => {
        try {
            let response = await axios.post(`${server1}/logout`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getCars = async () => {
        try {
            let response = await axios.get(`${server1}/car`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getAccessories = async () => {
        try {
            let response = await axios.get(`${server1}/accessory`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.auth = async () => {
        try {
            let response = await axios.get(`${server1}/auth`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getConfiguration = async () => {
        try {
            let response = await axios.get(`${server1}/configuration`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.createConfiguration = async (carId) => {
        try {
            let response = await axios.post(`${server1}/configuration/car/${carId}`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.checkSafeRemovingAccessory = async (accessories, id) => {
        try {
            let response = await axios.post(`${server1}/configuration/check/remove/${id}`, { accessories }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }; 

    this.checkSafeAddingAccessory = async (accessories, id) => {    
        try {
            let response = await axios.post(`${server1}/configuration/check/add/${id}`, { accessories }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }; 

    this.saveConfiguration = async (accessories) => {
        try {
            let response = await axios.post(`${server1}/configuration/save`, { accessories }, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.generateTokenForServer2 = async () => {    
        try {
            let response = await axios.get(`${server1}/server2-auth`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };


    this.confirmConfigurationComplete = async () => {
        try {
            let response = await axios.post(`${server1}/configuration/complete`, {}, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }; 


    this.deleteConfiguration = async () => {
        try {
            let response = await axios.delete(`${server1}/configuration`, { withCredentials: true });
            return response.data;
        }
        catch (error) {
            throw error;
        }   
    };




};


export default FirstServerService;


