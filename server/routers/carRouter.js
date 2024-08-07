`use strict`;

const express = require('express');
const dbManager = require('../utils/db');
const config = require('../config');
const Logger = require('../utils/logger');
const {CustomError } = require('../utils/errorHandle');
const {authorized} = require('../utils/security');
const CarDto = require('../dto/carDto');

const carRouter = express.Router();
const generalTimeFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';
const logger = new Logger('carRouter');
const db = dbManager.getSession();
const carDto = new CarDto(db);

carRouter.get('/', async (req, res, next) => {
    try {
        const cars = await carDto.getAllCars();
        res.status(200).json(cars);
    } catch (error) {
        next(error);
    }       
});   

module.exports = carRouter;
