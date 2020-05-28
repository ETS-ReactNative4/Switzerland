import { create, m } from 'switzerland';
import TodoInput from '../todo-input/index.js';
import TodoList from '../todo-list/index.js';

export default create(
    'todo-app',
    m.window(import.meta.url),
    m.html(({ h }) => {
        return h('section', { class: 'todo-app' }, [
            h(TodoInput),
            h(TodoList),

            h('h1', { part: 'header' }, [
                h('a', { href: 'https://github.com/Wildhoney/Switzerland' }, [
                    h('img', { src: '' }),
                ]),
            ]),
        ]);
    })
);
