import morph from 'morphdom';
import * as utils from './utils.js';
import { getWindow } from '../../utils.js';
import { dispatchEvent } from '../../core/impl/utils.js';

export default (getTree) => {
    return async function html(props) {
        const window = await getWindow();
        const tree = await getTree(props);

        if (props.server) {
            const dom = await utils.getVNodeDOM(
                typeof props.boundary === 'function' ? props.boundary(tree) : tree
            );
            props.node.appendChild(dom);
            return { ...props, boundary: props.node.shadowRoot };
        }

        const dom = await utils.getVNodeDOM(tree);
        const fragment = window.document.createDocumentFragment();
        props.boundary && fragment.append(dom);

        morph(props.boundary, fragment, {
            childrenOnly: props.boundary != null,

            getNodeKey(node) {
                if (!(node instanceof HTMLElement)) return null;
                return node.getAttribute('key') ?? null;
            },
            onNodeAdded(node) {
                dispatchEvent(node)('create', { node });
            },
            onNodeDiscarded(node) {
                dispatchEvent(node)('destroy', { node });
            },
            onBeforeElUpdated(from, to) {
                const isSwiss = from instanceof HTMLElement && 'swiss' in from.dataset;
                return isSwiss ? false : to;
            },
        });

        // Attach the required event listeners to the DOM.
        utils.attachEventListeners(tree, props.boundary.firstChild);

        return { ...props, html: getTree };
    };
};
