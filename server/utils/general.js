`use strict`;

const ROLE = {
    ADMIN: 'admin',
    USER: 'user'
};

const TYPE = {
    NORMAL: 'normal',
    GOOD: 'good',
};

const CONFIGURATION_STATUS = {
    COMPLETE: 'complete',
    INCOMPLETE: 'incomplete'
};

const CONSTRAIN_TYPE = {
    REQUIRED: 'required',
    EXCLUSIVE: 'exclusive'
};


const capitalizeWords = (str) => {
    if (!str) {
        return '';
    }   
    return str.replace(/\b\w/g, l => l.toUpperCase());
}; 

module.exports = {
    ROLE,
    TYPE,
    CONFIGURATION_STATUS, 
    CONSTRAIN_TYPE, 
    capitalizeWords
};
