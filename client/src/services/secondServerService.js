import axios from 'axios';
import config from '../config.js';

const server2 = config?.server2 || 'http://localhost:3002';


const SecondServerService = function (token) {
    this.token = token; 

    this.estimate = async (accessories) => {
        try {
            let response = await axios.post(`${server2}/estimation`, { accessories }, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

}; 

export default SecondServerService;