`use strict`;   

const crypto = require('crypto');   
const dayjs = require('dayjs'); 
const Logger = require('./logger');
const {CustomError} = require('./errorHandle');
const jwt = require('jsonwebtoken');
const config = require('../config');    
const { builtinModules } = require('module');




const secret = config?.jwtSecret;
const expiration = config?.jwtExpiration;

const logger = new Logger('security');  

const generateRandom = (length) => crypto.randomBytes(length).toString('base64');


const generateHash = (password, salt) => {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    return hash.digest('base64');
}


const isAuthenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized', type: 'unauthenticated' });
}


const authorized = (req, roles) => {

    if (!req.isAuthenticated()) {
        throw new CustomError('Unauthorized', 'unauthenticated', 401);
    }

    if (!roles.includes(req?.user?.role?.toLowerCase())) {
        throw new CustomError('Forbidden', 'unauthorized', 403);
    }

    logger.debug(`User ${req?.user?.username} is authorized`);
    return true;
}; 

const generateToken = (payload) => {

    if (!payload) {
        throw new Error('payload is required');
    }
    payload.exp = dayjs().add(expiration, 'seconds').unix();
    return jwt.sign(payload, secret);
}

module.exports = { generateRandom, generateHash, isAuthenticatedUser, authorized , generateToken};