`use strict`;

const CarDto = function (db) {
    this.tableName = 'Car';
    if (!db) {
        throw new Error('A database is required');
    }
    this.db = db;


    this.getAllCars = async () => {
        const query = `SELECT * FROM ${this.tableName}`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (!rows) {
                        resolve([]);
                    } else {
                        if (!rows) {
                            resolve([]);

                        } else {
                            let cars = rows.map(row => {
                                return {
                                    id: row?.id,
                                    model: row?.model,
                                    engine: row?.engine,
                                    price: row?.price,
                                    maxAccessories: row?.maxAccessories || 0    
                                }
                            });
                            resolve(cars);
                        }
                    }
                }
            });
        });
    }

    this.getCarById = async (id) => {
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
                        let car = {
                            id: row?.id,
                            model: row?.model,
                            engine: row?.engine,
                            price: row?.price,
                            maxAccessories: row?.maxAccessories || 0
                        }
                        resolve(car);
                    }
                }
            });
        });
    };


    this.deleteCarById = async (id) => {
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

    this.createCar = async (car) => {
        const query = `INSERT INTO ${this.tableName} (model, engine, price, maxAccessories) VALUES (?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [car.model, car.engine, car.price, car.maxAccessories], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        model: car.model,
                        engine: car.engine,
                        price: car.price,
                        maxAccessories: car.maxAccessories || 0
                    });
                }
            });
        });
    };
}

module.exports = CarDto;