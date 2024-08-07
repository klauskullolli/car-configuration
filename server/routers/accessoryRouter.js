`use strict`;

const express = require('express'); 
const dbManager = require('../utils/db');
const config = require('../config');
const Logger = require('../utils/logger');  
const {CustomError } = require('../utils/errorHandle');   
const {authorized} = require('../utils/security');
const AccessoryDto = require('../dto/accessoryDto');
const ConfigurationDto = require('../dto/configurationDto');    

const accessoryRouter = express.Router();
const generalTimeFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';   
const logger = new Logger('accessoryRouter');
const db = dbManager.getSession();
const accessoryDto = new AccessoryDto(db);
const configurationDto = new ConfigurationDto(db);

accessoryRouter.get('/', async (req, res, next) => {
    try {
        
        const accessories = await accessoryDto.getAllAccessories();
        res.status(200).json(accessories);
    } catch (error) {
        next(error);
    }   
});

accessoryRouter.get('configuration/:id', async (req, res, next) => {
    try {

        let auth = authorized(req, ['user']); 
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }   
        let user = req.user;

        logger.debug(`User ${user.username} is trying to get configuration by id ${req.params.id}`);
   
        const id = Number(req.params.id);
        const configuration = await getUserConfigurationByUserAndId(user, id);

        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }

        const accessories = await accessoryDto.getAccessoriesByConfigurationId(id);
        res.status(200).json(accessories);
    }catch(error){
        next(error);
    }

});

module.exports = accessoryRouter;