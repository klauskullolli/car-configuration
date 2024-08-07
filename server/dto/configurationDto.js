`use strict`;

const AccessoryDto = require('./accessoryDto');
const CarDto = require('./carDto');
const { CONFIGURATION_STATUS } = require('../utils/general');
const dbManager = require('../utils/db');

const ConfigurationDto = function (db) {

    this.tableName = 'Configurations';

    this.accessoryTableName = 'Accessory';

    this.configurationAccessoryTableName = 'ConfigurationAccessory';


    if (!db) {
        throw new Error('A database is required');
    }
    this.db = db;

    this.getUserConfiguration = async (user) => {
        const query = `SELECT * FROM ${this.tableName} WHERE userId = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(query, [user.id], async (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    else {

                        try {
                            let configuration = {
                                id: row?.id,
                                status: row?.status
                            };
                            const carDto = new CarDto(this.db);
                            const accessoryDto = new AccessoryDto(this.db);
                            configuration.car = await carDto.getCarById(row.carId);
                            let accessories = await accessoryDto.getAccessoriesByConfigurationId(row.id);
                            let total = configuration?.car?.price || 0;
                            accessories.forEach(accessory => {
                                total += accessory.price;
                            });
                            configuration.accessories = accessories;
                            configuration.totalPrice = total;
                            resolve(configuration);

                        }
                        catch (err) {
                            reject(err);
                        }
                    }
                }
            });
        });
    };


    this.getUserConfigurationByUserAndId = async (user, id) => {
        const query = `SELECT * FROM ${this.tableName} WHERE userId = ? and id = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(query, [user.id], async (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    else {

                        if (!row) {
                            resolve(null);
                        }
                        else {
                            try {
                                let configuration = {
                                    id: row?.id,
                                    status: row?.status
                                };
                                const carDto = new CarDto(this.db);
                                const accessoryDto = new AccessoryDto(this.db);
                                configuration.car = await carDto.getCarById(row.carId);
                                configuration.accessories = await accessoryDto.getAccessoriesByConfigurationId(row.id);
                                let total = configuration?.car?.price || 0;
                                configuration.accessories.forEach(accessory => {
                                    total += accessory.price;
                                });
                                configuration.totalPrice = total;
                                resolve(configuration);
                            }
                            catch (err) {
                                reject(err);
                            }
                        }
                    }

                }
            });
        });
    };

    this.createConfiguration = async (user, carId) => {
        const query = `INSERT INTO ${this.tableName} (userId, carId, status) VALUES (?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [user.id, carId, CONFIGURATION_STATUS.INCOMPLETE], function (err) {
                if (err) {
                    reject(err);
                } else {

                    resolve({
                        id: this.lastID,
                        userId: user.id,
                        carId: carId,
                        status: CONFIGURATION_STATUS.INCOMPLETE
                    });
                }
            });
        });
    };


    this.deleteConfigurationById = async (id) => {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const accessoryDto = new AccessoryDto(this.db);

        return new Promise(async (resolve, reject) => {
            try {
                let accessories = [];

                accessories = await accessoryDto.getAccessoriesByConfigurationId(id);

                for (let accessory of accessories) {
                    await accessoryDto.increaseAmount(accessory.id, 1);
                }

                this.db.run(query, [id], async function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        try {


                            resolve(true);
                        } catch (err) {
                            reject(err);
                        }

                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };


    this.deleteConfigurationAccessoriesByConfigurationId = async (configurationId) => {
        const query = `DELETE FROM ${this.configurationAccessoryTableName} WHERE configurationId = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [configurationId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.deleteConfigurationAccessories = async (configurationId) => {
        const accessoryDto = new AccessoryDto(this.db);
        return new Promise(async (resolve, reject) => {
            try {
                let accessories = [];

                await dbManager.openTransaction(this.db);
                accessories = await accessoryDto.getAccessoriesByConfigurationId(configurationId);
                await this.deleteConfigurationAccessoriesByConfigurationId(configurationId);
                for (let accessory of accessories) {
                    await accessoryDto.increaseAmount(accessory.id, 1);
                }
                await dbManager.commitTransaction(this.db);
                resolve(true)
            }
            catch (err) {
                await dbManager.rollbackTransaction(this.db); 
                reject(err);
            }
        });
    };


    this.saveConfigurationAccessories = async (configurationId, accessories) => {
        const accessoryDto = new AccessoryDto(this.db);
        return new Promise(async (resolve, reject) => {
            try {
                await dbManager.openTransaction(this.db);
                for (let accessory of accessories) {
                    await accessoryDto.addAccessoryToConfiguration(configurationId, accessory);

                    await accessoryDto.decreaseAmount(accessory.id, 1);
                }
                await dbManager.commitTransaction(this.db);
                resolve(true);
            }
            catch (err) {
                await dbManager.rollbackTransaction(this.db);
                reject(err);
            }
        }
        );
    };


    this.completeConfiguration = async (configuration) => {
        const query = `UPDATE ${this.tableName} SET status = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [CONFIGURATION_STATUS.COMPLETE, configuration.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

};

module.exports = ConfigurationDto;