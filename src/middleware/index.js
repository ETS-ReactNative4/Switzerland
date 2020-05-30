export function load(name) {
    return async (...args) => {
        const module = await import(`./${name}/index.js`);
        return module.default(...args);
    };
}

export const attrs = load('attrs');
export const boundary = load('boundary');
export const delay = load('delay');
export const html = load('html');
export const loader = load('loader');
export const path = load('path');
export const rescue = load('rescue');
export const window = load('window');
