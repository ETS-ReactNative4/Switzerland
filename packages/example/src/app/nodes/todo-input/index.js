import { create } from '@switzerland/core';
import html from '@switzerland/vdom';
import styles from './styles.css';
import store from '../../utils/store';

create(
    'todo-input',
    store,
    html(({ value, redux, render }) => (
        <form
            onsubmit={event => (
                event.preventDefault(), redux.actions.add(value)
            )}
            novalidate
        >
            <style type="text/css">{styles.toString()}</style>
            <input
                required
                type="text"
                name="todo"
                autoFocus="on"
                autoComplete="off"
                placeholder="What do you need to do?"
                value={value}
                oninput={({ target }) => render({ value: target.value })}
            />
            <button
                type="submit"
                class="add"
                disabled={!(value && value.trim())}
            />
        </form>
    ))
);
