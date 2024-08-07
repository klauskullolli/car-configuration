`use strict`;
const express = require('express');
const config = require('./config');
const { verifyToken } = require('./utils/security');
const Logger = require('./utils/logger');
const { CustomError, errorHandle } = require('./utils/errorHandle');
const dayjs = require('dayjs');
const cors = require('cors');
const { removeSpaces, TYPE, randBetween } = require('./utils/general');


const logger = new Logger('server2');

const app = express();
const port = config?.port || 3002;
const host = config?.host || 'localhost';
const corsOptions = config?.corsOptions || { origin: "http://localhost:5173", credentials: true }


app.use(express.json());
app.use(cors(corsOptions));






app.post('/estimation', (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const user = verifyToken(token);

        if (!user) {
            throw new CustomError('Unauthorized', 'invalid_token', 401);
        }
        let accessories = req.body?.accessories || [];

        let total = 0

        for (let accessory of accessories) {
            if (!accessory?.name) {
                throw new CustomError('Accessory name is required', 'validation', 400);
            }
            let name = removeSpaces(accessory?.name);
            total += name.length;
        }

        total = total * 3 + randBetween(1, 90);

        if (user?.type === TYPE.GOOD) {
            total = Math.floor(total / randBetween(1, 4));
        }
        
        let result =  {...req.body, estimation: total} 
        
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandle);

app.listen(port, host, () => {
    logger.info(`Server running at http://${host}:${port}/`);
});

