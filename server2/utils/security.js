const {CustomError} = require('./errorHandle');
const jwt = require('jsonwebtoken');
const config = require('../config'); 
const Logger = require('./logger');
const dayjs = require('dayjs'); 

const secret = config?.jwtSecret;
const expiration = config?.jwtExpiration;

const logger = new Logger('security');

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, secret);
        if (decoded?.exp < dayjs().unix()) {
            throw new CustomError('Unauthorized', 'invalid_token', 401);
        }
        return decoded;
    } catch (error) {
        throw new CustomError('Unauthorized', `invalid_token`, 401);
    }

}


module.exports = { verifyToken };