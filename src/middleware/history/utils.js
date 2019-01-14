import { toCamelcase, getEventName } from '../../core/utils.js';

export const eventName = getEventName('update-state');

export const createPatch = (getF, types, defaults) => {
    return name => {
        const key = toCamelcase(name).fromSnake();
        const [f] = [].concat(types[key] || (a => a));
        return getF(name) ? f(getF(name)) : defaults[key] || null;
    };
};

export const changeState = ({ dispatch }, fName) => (...params) => {
    window.history[fName](...params);
    dispatch(eventName, { params });
};