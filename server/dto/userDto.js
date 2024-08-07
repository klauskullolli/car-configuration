`use strict`;   

const UserDto = function(db) {
    this.tableName ='User'; 

    if (!db) {
        throw new Error('A database is required');
    }
    this.db = db;

    this.getUserById = async (id) => {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                }else {
                    if (!row) {
                        resolve(null);
                    }
                    else {
                        let user = {
                            id: row?.id,
                            username: row?.username,
                            role: row?.role,  
                            type: row?.type
                        }
                        resolve(user);
                    }

                }
            });
        });
    }; 


    this.getUserByUsername = async (username) => {
        const query = `SELECT * FROM ${this.tableName} WHERE username = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                }else {
                    if (!row) {
                        resolve(null);
                    }
                    else {
                        let user = {
                            id: row?.id,
                            username: row?.username,
                            role: row?.role,  
                            type: row?.type,
                            password: row?.password,
                            salt: row?.salt 
                        }
                        resolve(user);
                    }

                }
            });
        });
    };  


    this.createUser = async (user) => {
        const query = `INSERT INTO ${this.tableName} (username, password, role, type, salt) VALUES (?, ?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(query, [user.username, user.password, user.role, user.type, user.salt], function(err) {
                if (err) {
                    reject(err);
                } else {

                    let result = {
                        id: this.lastID,
                        username: user.username,
                        role: user.role,  
                        type: user.type
                    }

                    resolve(result);
                }
            });
        });
    }

    
    this.updateUser = async (user) => {

        const _this = this;

        let updateString = ``;
        let updateKeys = []
        let values = [];

        for (let key in user) {
            if (user[key] && key !== 'id' && key !== 'password' && key !== 'salt') {
                updateKeys.push(`${key} = ?`);
                values.push(user[key]);
            }
        }

        updateString = updateKeys.join(', ');

        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${_this.tableName} SET ${updateString} WHERE id=?`, [...values, user.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    };


    this.deleteUser = async (id) => {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(id);
                }
            });
        });
    }; 

    
    this.updatePassword = async (user) => {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE ${this.tableName} SET password = ?, salt = ? WHERE id = ?`, [user.password, user.salt, user.id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }; 


}

module.exports = UserDto;