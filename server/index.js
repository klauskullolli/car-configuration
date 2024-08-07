'use strict';
const express = require('express');
const config = require('./config');
const Logger = require('./utils/logger');
const cors = require('cors');
const { errorHandle, CustomError } = require('./utils/errorHandle');
const session = require('express-session');
const { generateRandom, generateHash, isAuthenticatedUser, authorized, generateToken } = require('./utils/security');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dayjs = require('dayjs');
const carRouter = require('./routers/carRouter');
const accessoryRouter = require('./routers/accessoryRouter');
const configurationRouter = require('./routers/configurationRouter');
const {validationResult} = require('express-validator');
const {loginValidation} = require('./utils/validator');    
const UserDto = require('./dto/userDto');
const dbManager = require('./utils/db');       


const generalTimeFormat = config?.generalTimeFormat || 'YYYY-MM-DD HH:mm:ss';
const logger = new Logger('server')
const corsOptions = config?.corsOptions || { origin: "http://localhost:5173", credentials: true }
const db = dbManager.getSession();  
const userDto = new UserDto(db);


const app = express()
app.use(cors(corsOptions))
app.use(express.json())
app.use(
    session({
        secret: generateRandom(64),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await userDto.getUserByUsername(username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.', type: 'unauthenticated' });
        }
        if (user.password !== generateHash(password, user.salt)) {
            return done(null, false, { message: 'Incorrect password.', type: 'unauthenticated' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.post('/login',  (req, res, next) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation Error: ', JSON.stringify(errors.array()));
        throw new CustomError('Validation Error', 'validation', 400);
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.status(401).json(info); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            logger.debug(`User ${user.username} logged in`);
            return res.json({
                id: user.id,
                username: user.username,
                role: user.role
            });
        });
    })(req, res, next);
});


app.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ message: 'Internal Server Error', type: 'internal', timestamp: dayjs().format(generalTimeFormat)});
      } else {
        logger.debug('User logged out');
        res.json({ message: 'Logout successful' });
      }
    });
  });
  

app.get('/auth', (req, res, next) => {
    try {
        if (!req.isAuthenticated()) {
            throw new CustomError('Unauthorized', 'unauthenticated', 401);
        }
        logger.debug(`User ${req?.user?.username} is authenticated`);
        res.json({
            message: 'Authenticated',
            timestamp: dayjs().format(generalTimeFormat),
        });
    } catch (err) {
        next(err);
    }
});


app.get('/server2-auth', (req, res, next) => {
    try {
        let auth = authorized(req, ['user']);
        if (!auth) {
            throw new CustomError('Unauthorized', 'unauthorized', 403);
        }
        let user = req?.user;

        let payload = { username: user.username, role: user.role, type: user.type };
        let token = generateToken(payload);

        logger.debug(`Token generated for user ${user.username}`);

        res.json({ token: token, timestamp: dayjs().format(generalTimeFormat) });

    }
    catch (err) {
        next(err);
    }

});



app.use('/car', carRouter);
app.use('/accessory', accessoryRouter);
app.use('/configuration', configurationRouter);

app.use(errorHandle)

const port = config?.port || 3001
const host = config?.host || 'localhost'

app.listen(port, host, () => {
    logger.info(`Server running at http://${host}:${port}/`);
});



