const dbManager = require("../utils/db");

`use strict`;

const AccessoryDto = function (db) {
    this.tableName = 'Accessory';
    this.configurationAccessoryTableName = 'ConfigurationAccessory';

    if (!db) {
        throw new Error('A database is required');
    }
    this.db = db;


    this.getAllAccessories = async () => {
        const query = `SELECT * FROM ${this.tableName}`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {

                    if (!rows) {
                        resolve([]);
                    }

                    else {
                        let accessories = rows.map(row => {
                            return {
                                id: row?.id,
                                name: row?.name,
                                price: row?.price,
                                amount: row?.amount
                            }
                        });
                        resolve(accessories);
                    }
                }
            });
        });
    }

    this.getAccessoryById = async (id) => {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    else {
                        let accessory = {
                            id: row?.id,
                            name: row?.name,
                            price: row?.price,
                            amount: row?.amount
                        }
                        resolve(accessory);
                    }

                }
            });
        });
    };

    this.deleteAccessoryById = async (id) => {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.createAccessory = async (accessory) => {
        const query = `INSERT INTO ${this.tableName} (name, price, amount) VALUES (?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [accessory.name, accessory.price, accessory.amount], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        name: accessory.name,
                        price: accessory.price,
                        amount: accessory.amount
                    });
                }
            });
        });
    };

    this.updateAmount = async (id, amount) => {
        const query = `UPDATE ${this.tableName} SET amount = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [amount, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.increaseAmount = async (id, amount) => {
        const query = `UPDATE ${this.tableName} SET amount = amount + ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [amount, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.decreaseAmount = async (id, amount) => {
        const query = `UPDATE ${this.tableName} SET amount = amount - ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [amount, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.updateAmounts = async (accessories) => {
        const query = `UPDATE ${this.tableName} SET amount = ? WHERE id = ?`;
        return new Promise(async (resolve, reject) => {
            try {
                await dbManager.openTransaction(this.db);
                for (let accessory of accessories) {
                    await this.updateAmount(accessory.id, accessory.amount);
                }

                await dbManager.commitTransaction(this.db);
                resolve(true);

            }
            catch (err) {
                await dbManager.rollbackTransaction(this.db);
                reject(err);
            }

        });
    };

    this.getAccessoriesByConfigurationId = async (configurationId) => {
        const query = `SELECT a.id, a.name, a.price, a.amount FROM ${this.configurationAccessoryTableName} ac JOIN ${this.tableName} a ON ac.accessoryId = a.id WHERE ac.configurationId = ?`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [configurationId], async (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve([]);
                    }
                    else {

                        if (!rows || rows.length === 0) {
                            resolve([]);
                        }
                        else {
                            let accessories = rows.map(row => {
                                return {
                                    id: row?.id,
                                    name: row?.name,
                                    price: row?.price,
                                    amount: row?.amount
                                }
                            });
                            resolve(accessories);
                        }
                    }
                }
            });
        });
    };



    this.addAccessoryToConfiguration = async (configurationId, accessory) => {
        const query = `INSERT INTO ${this.configurationAccessoryTableName} (configurationId, accessoryId) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [configurationId, accessory.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

    this.removeAccessoryFromConfiguration = async (configuration, accessory) => {
        const query = `DELETE FROM ${this.configurationAccessoryTableName} WHERE configurationId = ? AND accessoryId = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [configuration.id, accessory.id], function
                (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            }
            );
        }
        );
    };

    this.getAccessoryByName = async (name) => {
        const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(query, [name], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row) {
                        resolve(null);
                    }
                    else {
                        let accessory = {
                            id: row?.id,
                            name: row?.name,
                            price: row?.price,
                            amount: row?.amount
                        }
                        resolve(accessory);
                    }
                }
            });
        });
    };

};

module.exports = AccessoryDto;  