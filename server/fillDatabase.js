`use strict`;

const dbManager = require('./utils/db');
const UserDto = require('./dto/userDto');
const ConstrainDto = require('./dto/constrainDto');
const AccessoryDto = require('./dto/accessoryDto');
const CarDto = require('./dto/carDto');
const { generateHash, generateRandom } = require('./utils/security');
const { CustomError } = require('./utils/errorHandle');
const { TYPE, ROLE, CONSTRAIN_TYPE } = require('./utils/general');


const db = dbManager.getSession();
const userDto = new UserDto(db);
const constrainDto = new ConstrainDto(db);
const accessoryDto = new AccessoryDto(db);
const carDto = new CarDto(db);


const users = [
    {
        username: 'user1',
        password: 'user123',
        role: ROLE.USER,
        type: TYPE.GOOD,
        salt: generateRandom(64)
    },
    {
        username: 'user2',
        password: 'user123',
        role: ROLE.USER,
        type: TYPE.GOOD,
        salt: generateRandom(64)
    },
    {
        username: 'user3',
        password: 'user123',
        role: ROLE.USER,
        type: TYPE.NORMAL,
        salt: generateRandom(64)
    },
    {
        username: 'user4',
        password: 'user123',
        role: ROLE.USER,
        type: TYPE.NORMAL,
        salt: generateRandom(64)
    },
    {
        username: 'user5',
        password: 'user123',
        role: ROLE.USER,
        type: TYPE.NORMAL,
        salt: generateRandom(64)
    }
];


const createUsers = async function (users) {
    return new Promise(async (resolve, reject) => {
        try {
            for (let user of users) {
                user.password = generateHash(user.password, user.salt);
                const createdUser = await userDto.createUser(user);
                console.log(`User ${createdUser.username} created successfully`);
            }
            resolve("Users created successfully");
        } catch (err) {
            reject(err);
        }
    });
}


const cars = [
    {
        model: 'Mercedes Benz C-Class',
        engine: 50,
        price: 10000,
        maxAccessories: 4
    },
    {
        model: 'Mercedes Benz E-Class',
        engine: 100,
        price: 12000,
        maxAccessories: 5
    },
    {
        model: 'Mercedes Benz S-Class',
        engine: 150,
        price: 14000,
        maxAccessories: 7

    }
];



const createCars = async function (cars) {
    return new Promise(async (resolve, reject) => {
        try {
            for (let car of cars) {
                await carDto.createCar(car);
                console.log(`Car ${car.model} created successfully`);
            }
            resolve("Cars created successfully");
        } catch (err) {
            reject(err);
        }
    });
}


const accessories = [
    {
        name: 'radio',
        price: 300,
        amount: 20,
    },
    {
        name: 'satellite navigator',
        price: 600,
        amount: 20,
    },
    {
        name: 'bluetooth',
        price: 200,
        amount: 20,
    },
    {
        name: 'power windows',
        price: 200,
        amount: 20,
    },
    {
        name: 'extra front lights',
        price: 150,
        amount: 20,
    },
    {
        name: 'extra rear lights',
        price: 150,
        amount: 20,
    },
    {
        name: 'air conditioning',
        price: 600,
        amount: 20,
    },
    {
        name: 'spare tire',
        price: 200,
        amount: 20,
    },
    {
        name: 'assisted driving',
        price: 1200,
        amount: 20,
    },
    {
        name: 'automatic braking',
        price: 800,
        amount: 20,
    }
];

const createAccessories = async function (accessories) {
    return new Promise(async (resolve, reject) => {
        try {
            for (let accessory of accessories) {
                await accessoryDto.createAccessory(accessory);
                console.log(`Accessory ${accessory.name} created successfully`);
            }
            resolve("Accessories created successfully");
        } catch (err) {
            reject(err);
        }
    });
}


const setConstrains = async function () {
    return new Promise(async (resolve, reject) => {
        try {
            await dbManager.openTransaction(db);
            const bluetooth = await accessoryDto.getAccessoryByName('bluetooth');
            const radio = await accessoryDto.getAccessoryByName('radio');
            const satelliteNavigator = await accessoryDto.getAccessoryByName('satellite navigator');
            const extraFrontLights = await accessoryDto.getAccessoryByName('extra front lights');
            const extraRearLights = await accessoryDto.getAccessoryByName('extra rear lights');
            const airConditioning = await accessoryDto.getAccessoryByName('air conditioning');
            const powerWindows = await accessoryDto.getAccessoryByName('power windows');
            const assistedDriving = await accessoryDto.getAccessoryByName('assisted driving');
            const automaticBraking = await accessoryDto.getAccessoryByName('automatic braking');
            const spareTire = await accessoryDto.getAccessoryByName('spare tire');
            const constrains = [
                {
                    type: CONSTRAIN_TYPE.REQUIRED,
                    accessoryId: bluetooth.id,
                    constrainAccessoryId: radio.id
                },
                {
                    type: CONSTRAIN_TYPE.REQUIRED,
                    accessoryId: satelliteNavigator.id,
                    constrainAccessoryId: bluetooth.id
                },
                {
                    type: CONSTRAIN_TYPE.REQUIRED,
                    accessoryId: extraRearLights.id,
                    constrainAccessoryId: extraFrontLights.id
                },
                {
                    type: CONSTRAIN_TYPE.REQUIRED,
                    accessoryId: airConditioning.id,
                    constrainAccessoryId: powerWindows.id
                },
                {
                    type: CONSTRAIN_TYPE.EXCLUSIVE,
                    accessoryId: assistedDriving.id,
                    constrainAccessoryId: automaticBraking.id
                },
                {
                    type: CONSTRAIN_TYPE.EXCLUSIVE,
                    accessoryId: automaticBraking.id,
                    constrainAccessoryId: assistedDriving.id
                },

                {
                    type: CONSTRAIN_TYPE.EXCLUSIVE,
                    accessoryId: spareTire.id,
                    constrainAccessoryId: airConditioning.id
                },
                {
                    type: CONSTRAIN_TYPE.EXCLUSIVE,
                    accessoryId: airConditioning.id,
                    constrainAccessoryId: spareTire.id
                }
            ];

            for (let constrain of constrains) {
                await constrainDto.createConstrain(constrain);
                console.log(`Constrain created successfully`);
            }

            await dbManager.commitTransaction(db);

            resolve("Constrains created successfully");

        }
        catch (err) {
            dbManager.rollbackTransaction(db);
            reject(err);
        }
    });

}

const fillDatabase = async function () {
    try {


        await createUsers(users);
        await createCars(cars);
        await createAccessories(accessories);
        await setConstrains();



    } catch (err) {
        throw err;
    }
}

fillDatabase().then(() => {
    console.log('Database filled successfully');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});





