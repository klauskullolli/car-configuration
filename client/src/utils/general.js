
const capitalizeWords = (str) => {
    if (!str) {
        return '';
    }  
    return str.replace(/\b\w/g, l => l.toUpperCase());
}


const CONFIGURATION_STATUS = {
    COMPLETE: 'complete',
    INCOMPLETE: 'incomplete'
};




export { capitalizeWords, CONFIGURATION_STATUS };