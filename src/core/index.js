import { getWindow, replaceTemplate } from '../utils.js';
import * as impl from './impl/index.js';
import * as utils from './utils.js';
import defaultController from './defaults/controller.js';
import defaultView from './defaults/view.js';

/**
 * @function create
 * ---
 * Takes the name of the web component and an array of functions that represent the middleware. Each
 * middleware item takes in the accumulated props, and yields props to pass to the next item in the list.
 */
export function create(name, { controller = defaultController, view = defaultView } = {}) {
    const [tag, constuctor, extend] = utils.parseName(name);

    try {
        window.customElements.define(
            window.customElements.get(tag) ? utils.getRandomName() : tag,
            impl.client(constuctor, [controller, view]),
            extend && { extends: extend }
        );
    } finally {
        return impl.server(extend ?? tag, [controller, view], extend ? tag : null);
    }
}

/**
 * @function render
 * ---
 * Takes the component tree and renders it to string for server-side rendering capabilities.
 */
export async function render(app, props = {}, options = utils.getDefaultOptions()) {
    // Render the app using the passed props.
    const node = await app.render(props, options);

    // JSDOM has an issue with appending children to the `template` node, so we merely find and replace
    // at this point to mimick the behaviour.
    return replaceTemplate(node.outerHTML);
}

/**
 * @function renderToStream
 * ---
 * Renders the component tree as usual but yields a readable Node stream that can be piped to the response.
 */
export async function renderToStream(app = {}, props, options = utils.getDefaultOptions()) {
    const { Transform } = await import('stream');
    const stream = new Transform();

    // Push chunks of data into our stream.
    stream._transform = (chunk, _, done) => (this.push(chunk), done());

    async function run() {
        // Invoke the typical `render` function but with an attached stream, and end the stream once
        // the full component tree has been rendered.
        await render(app, props, { ...options, stream });
        stream.end();
    }

    return run(), stream;
}

/**
 * @function preload
 * ---
 * Collates the assets for server-side rendering so that the qualifying nodes can be placed in the head of the
 * document to preload which helps to prevent FOUC.
 */
export async function preload(trees, options = utils.getDefaultOptions()) {
    const window = await getWindow();

    const links = trees
        .flatMap((tree) => tree.match(/<link.+?>/gis))
        .map((link) => {
            if (!link) return;

            // Parse the link DOM string into a HTML node.
            const node = window.document.createElement('div');
            node.innerHTML = link;
            const child = node.firstChild;

            // Parse the anchor and make it a path based on the options.
            const anchor = window.document.createElement('a');
            anchor.setAttribute('href', child.getAttribute('href'));
            child.setAttribute('href', new URL(anchor.pathname, options.path).href);

            // Transform the link into a preload node for the head of the document.
            child.setAttribute('as', 'style');
            child.setAttribute('rel', 'preload');
            child.removeAttribute('key');
            child.removeAttribute('type');

            return child.outerHTML;
        });

    return links.join('\n');
}

/**
 * @function rename
 * ---
 * Allows for the renaming of components, especially if a component has a duplicate name of another. In that case
 * Switzerland will assign a random name to the component, and it's up to the developer to rename it accordingly.
 */
export function rename(component, name) {
    const [controller, view] = component.middleware;
    return create(name, { controller, view });
}

/**
 * @function fetch
 * ---
 * Utility function for unwrapping the `default` export from an asynchronous import, which allows for fetching of
 * components only when they're needed in the current tree.
 */
export async function fetch(importer) {
    return (await importer).default;
}
