`use strict`;

const ROLE = {
    ADMIN: 'admin',
    USER: 'user'
};

const TYPE = {
    NORMAL: 'normal',
    GOOD: 'good',
};


const randBetween = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
};


const removeSpaces = (str) => {
    if (!str) {
        return '';
    }
    return str.replace(/[\s\r\n]+/g, '');
};

module.exports = { ROLE, TYPE, randBetween, removeSpaces };