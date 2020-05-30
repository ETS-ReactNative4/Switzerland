import * as u from './utils.js';
import * as impl from './impl/index.js';

export { meta, Cancel } from './utils.js';

/**
 * @function init ∷ String → String → Boolean → (String → String)
 * ---
 * Utility function for referencing paths inside of your custom components. Allows you to encapsulate
 * the components by using the `import.meta.url` (or `document.currentScript` for non-module includes).
 * Detects when the component is being used on a different host where absolute paths will be used instead
 * of relative ones to allow components to be rendered cross-domain.
 */
export const init = (componentUrl, pathConfig) => (resourcePath) => {
    if (typeof require === 'undefined' || !pathConfig || pathConfig.forceBrowser) {
        return new URL(resourcePath, componentUrl).href;
    }

    const componentPath = new URL(componentUrl).pathname;
    const path = require('path');
    const relativePath = path.relative(pathConfig.rootPath(path.resolve), componentPath);
    const urlPath = new URL(relativePath, pathConfig.url);
    return new URL(resourcePath, urlPath).href;
};

/**
 * @function create ∷ Props p ⇒ String → [(p → Promise p)] → String
 * ---
 * Takes the name of the web component and an array of functions that represent the middleware. Each
 * middleware item takes in the accumulated props, and yields props to pass to the next item in the list.
 */
export const create = (name, ...middleware) => {
    try {
        const [tag, extension, tagExtend] = u.parseTagName(name);
        window.customElements.define(
            tag,
            impl.base(extension, middleware),
            tagExtend && { extends: tagExtend }
        );
        return tag;
    } catch {
        return impl.server(name, middleware);
    }
};

/**
 * @function alias ∷ String → String → String
 * ---
 * Takes the name of an existing custom element, and creates a clone of it under a different name. No attempt
 * to find a unique name takes place in this function, and so if the new custom component name already exists, a
 * native ungraceful `customElements` exception will be thrown.
 */
export const alias = (name, alias) => {
    const CustomElement = window.customElements.get(name);
    const instance = new CustomElement();
    const [, extension] = u.parseTagName(alias);
    window.customElements.define(alias, impl.alias(extension, instance));
    return alias;
};