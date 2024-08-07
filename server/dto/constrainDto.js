`use strict`;
const { CONSTRAIN_TYPE } = require('../utils/general');

const ConstrainDto = function (db) {
    this.tableName = 'Constrain';
    if (!db) {
        throw new Error('A database is required');
    }
    this.db = db;

    this.getAllConstrains = async () => {
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
                        let constrains = rows.map(row => {

                            let constrain = {
                                id: row?.id,
                                type: row?.type,
                                accessoryId: row?.accessoryId,
                                constrainAccessoryId: row?.constrainAccessoryId
                            }
                            return constrain;
                        });
                        resolve(constrains);
                    }
                }
            });
        });
    };

    this.getConstrainsFromAccessoryId = async (accessoryId) => {
        const query = `SELECT * FROM ${this.tableName} WHERE  accessoryId = ?`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [accessoryId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve([]);
                    }
                    else {
                        let constrains = rows.map(row => {

                            let constrain = {
                                id: row?.id,
                                type: row?.type,
                                accessoryId: row?.accessoryId,
                                constrainAccessoryId: row?.constrainAccessoryId
                            }
                            return constrain;
                        });
                        resolve(constrains);
                    }
                }
            });
        });
    };

    this.getExclusivityConstrainsFromAccessoryId = async (accessoryId) => {
        const query = `SELECT * FROM ${this.tableName} WHERE  accessoryId = ? and type = ?`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [accessoryId, CONSTRAIN_TYPE.EXCLUSIVE], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve([]);
                    }
                    else {
                        let constrains = rows.map(row => {

                            let constrain = {
                                id: row?.id,
                                type: row?.type,
                                accessoryId: row?.accessoryId,
                                constrainAccessoryId: row?.constrainAccessoryId
                            }
                            return constrain;
                        });
                        resolve(constrains);
                    }
                }
            });
        });
    };

    this.getRequiredConstrainsFromAccessoryId = async (accessoryId) => {
        const query = `SELECT * FROM ${this.tableName} WHERE  constrainAccessoryId = ? and type = ?`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [accessoryId, CONSTRAIN_TYPE.REQUIRED], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve([]);
                    }
                    else {

                        let constrains = rows.map(row => {

                            let constrain = {
                                id: row?.id,
                                type: row?.type,
                                accessoryId: row?.accessoryId,
                                constrainAccessoryId: row?.constrainAccessoryId
                            }
                            return constrain;
                        });
                        resolve(constrains);
                    }
                }
            });
        });
    };


    this.getRequiringConstrainsFromAccessoryId = async (accessoryId) => {
        const query = `SELECT * FROM ${this.tableName} WHERE  accessoryId = ? and type = ?`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [accessoryId, CONSTRAIN_TYPE.REQUIRED], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows || rows.length === 0) {
                        resolve([]);
                    }
                    else {
                        let constrains = rows.map(row => {

                            let constrain = {
                                id: row?.id,
                                type: row?.type,
                                accessoryId: row?.accessoryId,
                                constrainAccessoryId: row?.constrainAccessoryId
                            }
                            return constrain;
                        });
                        resolve(constrains);
                    }
                }
            });
        });
    };

    this.createConstrain = async (constrain) => {
        const query = `INSERT INTO ${this.tableName} (type, accessoryId, constrainAccessoryId) VALUES (?,
            ?, ?)`;

        return new Promise((resolve, reject) => {
            this.db.run(query, [constrain.type, constrain.accessoryId, constrain.constrainAccessoryId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        type: constrain.type,
                        accessoryId: constrain.accessoryId,
                        constrainAccessoryId: constrain.constrainAccessoryId
                    });
                }
            });
        });

    };



}

module.exports = ConstrainDto;  