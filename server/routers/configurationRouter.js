`use strict`;

const express = require('express');
const dbManager = require('../utils/db');
const config = require('../config');
const Logger = require('../utils/logger');
const { CustomError } = require('../utils/errorHandle');
const ConfigurationDto = require('../dto/configurationDto');
const AccessoryDto = require('../dto/accessoryDto');
const CarDto = require('../dto/carDto');
const ConstrainDto = require('../dto/constrainDto');
const { authorized } = require('../utils/security');
const dayjs = require('dayjs');
const { capitalizeWords, CONFIGURATION_STATUS } = require('../utils/general');


const configurationRouter = express.Router();
const generalTimeFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';
const logger = new Logger('configurationRouter');
const db = dbManager.getSession();
const configurationDto = new ConfigurationDto(db);
const accessoryDto = new AccessoryDto(db);
const carDto = new CarDto(db);
const constrainDto = new ConstrainDto(db);


configurationRouter.get('/', async (req, res, next) => {
    try {

        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }

        let user = req.user;

        logger.debug(`User ${user.username} is trying to get active configuration`);

        const configuration = await configurationDto.getUserConfiguration(user);



        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }


        res.status(200).json(configuration);
    } catch (error) {
        next(error);
    }
});


configurationRouter.post('/car/:carId', async (req, res, next) => {
    try {

        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }

        let user = req.user;

        logger.debug(`User ${user.username} is trying to create configuration for car id ${req.params.carId}`);

        const carId = Number(req.params.carId);


        const car = await carDto.getCarById(carId);

        if (!car) {
            throw new CustomError('Car not found', 'not_found', 404);

        }

        const existConfig = await configurationDto.getUserConfiguration(user);

        if (existConfig) {
            throw new CustomError('Configuration already exists', 'already_exists', 400);
        }



        const configuration = await configurationDto.createConfiguration(user, carId);

        logger.debug(`Configuration ${configuration.id} created`);

        res.status(200).json(configuration);
    } catch (error) {
        next(error);
    }
});

configurationRouter.delete('/', async (req, res, next) => {
    try {

        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }

        let user = req.user;

        logger.debug(`User ${user.username} is trying to delete configuration by id ${req.params.id}`);

        const configuration = await configurationDto.getUserConfiguration(user);

        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }

        await configurationDto.deleteConfigurationById(configuration.id);
        logger.debug(`Configuration ${configuration.id} deleted`);

        res.status(200).json({ message: 'Configuration deleted', timestamp: dayjs().format(generalTimeFormat) });
    } catch (error) {
        next(error);
    }
});


const checkConstrainsAdd = async (existingIds, added) => {
    try {
        let constrains = await constrainDto.getExclusivityConstrainsFromAccessoryId(added?.id);
        for (let id of existingIds) {
            for (let constrain of constrains) {
                if (constrain.constrainAccessoryId === id) {
                    let acc = await accessoryDto.getAccessoryById(constrain.constrainAccessoryId);  
                    throw new CustomError(`Accessory ${capitalizeWords(acc?.name)} cannot be associated with ${capitalizeWords(added?.name)}`, 'exclusive', 400);
                }
            }
        }

        return true;
    }
    catch (error) {
        throw error;
    }
}

const checkConstrainsRemove = async (existingIds, removed) => {
    try {
        let constrains = await constrainDto.getRequiredConstrainsFromAccessoryId(removed.id);
        for (let id of existingIds) {
            for (let constrain of constrains) {
                if (constrain.accessoryId === id) {
                    let acc = await accessoryDto.getAccessoryById(constrain.accessoryId);
                    throw new CustomError(`Accessory ${capitalizeWords(removed?.name)} cannot be removed. ${capitalizeWords(acc.name)} requires it.`, 'exclusive', 400);
                }
            }
        }

        return true;
    }
    catch (error) {
        throw error;
    }
};


configurationRouter.post('/check/add/:id', async (req, res, next) => {
    try {
        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }
        let user = req.user;

        let addedId = Number(req.params.id);
        let accessories = req?.body?.accessories;

        let configuration = await configurationDto.getUserConfiguration(user);
        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }

        if (configuration.status === CONFIGURATION_STATUS.COMPLETE) {
            throw new CustomError('Configuration already completed', 'already_completed', 400);
        }

        let added = await accessoryDto.getAccessoryById(addedId);
        if (!added) {
            throw new CustomError('Accessory not found', 'not_found', 404);
        }

        if (added.amount <= 0) {
            throw new CustomError('Accessory is out of stock', 'out_of_stock', 400);
        }

        let accessoryIds = accessories.map(accessory => accessory.id);

        if (accessoryIds.includes(addedId)) {
            throw new CustomError('Accessory already exists', 'already_exists', 400);
        }

        if (accessories.length >= configuration.maxAccessories) {
            throw new CustomError(`Accessories limit is ${configuration.maxAccessories}`, 'accessory_limit', 400);
        }

        await checkConstrainsAdd(accessoryIds, added);

        res.status(200).json({ message: 'Accessory can be added successfully', timestamp: dayjs().format(generalTimeFormat) });
    }
    catch (error) {
        next(error);
    }
});


configurationRouter.post('/check/remove/:id', async (req, res, next) => {
    try {
        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }
        let user = req.user;

        let removedId = Number(req.params.id);
        let accessories = req?.body?.accessories || [];

        let configuration = await configurationDto.getUserConfiguration(user);
        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }

        if (configuration.status === CONFIGURATION_STATUS.COMPLETE) {
            throw new CustomError('Configuration already completed', 'already_completed', 400);
        }

        let removed = await accessoryDto.getAccessoryById(removedId);
        if (!removed) {
            throw new CustomError('Accessory not found', 'not_found', 404);
        }

        if (accessories.length <= 0) {
            throw new CustomError('No accessories to remove', 'not_found', 404);
        }

        let accessoryIds = accessories.map(accessory => accessory.id);

        if (!accessoryIds.includes(removedId)) {
            throw new CustomError('Accessory does not exist', 'not_found', 404);
        }

        await checkConstrainsRemove(accessoryIds, removed);

        res.status(200).json({ message: 'Accessory can be removed successfully', timestamp: dayjs().format(generalTimeFormat) });

    } catch (error) {
        next(error);
    }
});

configurationRouter.post("/save", async (req, res, next) => {
    try {
        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }
        let user = req.user;
        let accessories = req?.body?.accessories || [];

        let configuration = await configurationDto.getUserConfiguration(user);

        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }

        if (configuration.status === CONFIGURATION_STATUS.COMPLETE) {
            throw new CustomError('Configuration already completed', 'already_completed', 400);
        }

        let accessoryIds = accessories.map(accessory => accessory.id);
        let uniqueIds = [...new Set(accessoryIds)];

        if (uniqueIds.length != accessoryIds.length) {
            throw new CustomError('Duplicate accessories', 'duplicate', 400);
        }

        if (accessories.length == 0) {
            await configurationDto.deleteConfigurationAccessories(configuration.id);
            res.status(200).json({ message: 'Configuration saved', timestamp: dayjs().format(generalTimeFormat) });
        }
        else {

            let val = await configurationDto.deleteConfigurationAccessories(configuration.id);

            let acc = await accessoryDto.getAllAccessories(); 

            for(let ac of accessories){
                let accessoryId = ac.id; 
                
                let accessory = await accessoryDto.getAccessoryById(accessoryId);

                if (!accessory) {
                    throw new CustomError('Accessory not found', 'not_found', 404);
                }   

                if (accessory.amount <= 0) {
                    throw new CustomError('Accessory is out of stock', 'out_of_stock', 400);
                }

                const exclusiveConstrains = await constrainDto.getExclusivityConstrainsFromAccessoryId(accessoryId);
             
                for(let constrain of exclusiveConstrains){
                    if(accessoryIds.includes(constrain.constrainAccessoryId)){
                        let acc = await accessoryDto.getAccessoryById(constrain.constrainAccessoryId);  
                        throw new CustomError(`Accessory ${capitalizeWords(accessory.name)} cannot be associated with ${capitalizeWords(acc.name)}`, 'exclusive', 400);
                    }
                }
      
                const requiredConstrains = await constrainDto.getRequiringConstrainsFromAccessoryId(accessoryId);

                for (let required of requiredConstrains) {
                    if (!accessoryIds.includes(required.constrainAccessoryId)) {
                        let reqAcc = await accessoryDto.getAccessoryById(required.constrainAccessoryId);    
                        throw new CustomError(`Accessory ${capitalizeWords(accessory.name)} requires ${capitalizeWords(reqAcc.name)}`, 'required', 400);
                    }
                }

            }


            await configurationDto.saveConfigurationAccessories(configuration.id, accessories);

            res.status(200).json({ message: 'Configuration saved', timestamp: dayjs().format(generalTimeFormat) });

        }
    }
    catch (error) {
        next(error);
    }
});


configurationRouter.post('/complete', async (req, res, next) => {
    try {
        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 401);
        }
        let user = req.user;

        let configuration = await configurationDto.getUserConfiguration(user);

        if (!configuration) {
            throw new CustomError('Configuration not found', 'not_found', 404);
        }

        if (configuration.status === 'completed') {
            throw new CustomError('Configuration already completed', 'already_completed', 400);
        }

        await configurationDto.completeConfiguration(configuration);

        res.status(200).json({ message: 'Configuration completed', timestamp: dayjs().format(generalTimeFormat) });

    } catch (error) {
        next(error);
    }
});







module.exports = configurationRouter;


