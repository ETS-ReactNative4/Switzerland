import { serverOptions } from '../../core/index.js';
import * as utils from './utils.js';

export default (url) => {
    return async function path(props) {
        if (!props.server) return { ...props, path: utils.getPath(url) };

        const path = await import('path');
        const parsed = path.parse(url.replace('file://', ''));
        const relative = path.relative(serverOptions.get('root'), parsed.dir);
        const location = new URL(relative, serverOptions.get('path')).href;

        return {
            ...props,
            path: utils.getPath(location.endsWith('/') ? location : `${location}/`),
        };
    };
};