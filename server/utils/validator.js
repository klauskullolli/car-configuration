`use strict`;

const { body } = require('express-validator');

const loginValidator = [
    body('username')
        .exists().withMessage("username is required")
        .notEmpty().withMessage("username not empty")
        .isString().withMessage("username should be a string")
        .escape(),

    body('password')
        .exists().withMessage("password is required")
        .notEmpty().withMessage("password not empty")
        .isString().withMessage("password should be a string")
        .escape(),
]; 


module.exports = { loginValidator };