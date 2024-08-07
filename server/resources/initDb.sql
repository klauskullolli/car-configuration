DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Car;
DROP TABLE IF EXISTS Accessory;
DROP TABLE IF EXISTS Constrain;
DROP TABLE IF EXISTS Configurations;
DROP TABLE IF EXISTS ConfigurationAccessory;
DROP TABLE IF EXISTS TempConfigurationAccessory;


PRAGMA foreign_keys = ON;
-- User table (id, username, password, salt, type, role)
CREATE TABLE User (
    id INTEGER NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    type TEXT NOT NULL,
    role TEXT NOT NULL
);
-- Car table (id, model, engine, price, maxAccessories)
CREATE TABLE Car (
    id INTEGER NOT NULL PRIMARY KEY,
    model TEXT NOT NULL UNIQUE,
    engine INTEGER NOT NULL,
    price INTEGER NOT NULL,
    maxAccessories INTEGER NOT NULL DEFAULT 0
);
-- Accessory table (id, name, price, amount)
CREATE TABLE Accessory (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price INTEGER NOT NULL,
    amount INTEGER NOT NULL
);

-- Constrain table (id, accessoryId, constrainAccessoryId, type)
CREATE TABLE Constrain (
    id INTEGER NOT NULL PRIMARY KEY,
    accessoryId INTEGER NOT NULL,
    constrainAccessoryId INTEGER NOT NULL,
    type TEXT NOT NULL,
    FOREIGN KEY (accessoryId) REFERENCES Accessory(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (constrainAccessoryId) REFERENCES Accessory(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Configurations table (id, userId, carId, status)
CREATE TABLE Configurations (
    id INTEGER NOT NULL PRIMARY KEY,
    userId INTEGER NOT NULL,
    carId INTEGER NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (carId) REFERENCES Car(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ConfigurationAccessory table (id, configurationId, accessoryId)
CREATE TABLE ConfigurationAccessory (
    id INTEGER NOT NULL PRIMARY KEY,
    configurationId INTEGER NOT NULL,
    accessoryId INTEGER,
    FOREIGN KEY (configurationId) REFERENCES Configurations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (accessoryId) REFERENCES Accessory(id) 
);




