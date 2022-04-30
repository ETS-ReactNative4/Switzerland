import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import fmt from 'string-template';
import { render } from 'switzerland';
import todoApp from '../nodes/todo-app';

const app = express();
app.use(cors());
app.use(compression());

const root = path.resolve('./example');
const vendor = path.resolve('./src');

const options = {
    path: process.env.DOMAIN ? `https://${process.env.DOMAIN}/` : 'http://localhost:3000/',
    root: path.resolve('./example'),
};

app.get('*', (_, response, next) => {
    response.header('Service-Worker-Allowed', '/');
    next();
});

app.get('/', async (_, response) => {
    const html = fs.readFileSync(`${root}/index.html`, 'utf-8');
    const todos = await render(todoApp({ name: 'Imogen', age: '2' }), options);
    response.send(fmt(html, { todos }));
});

app.use('/vendor', express.static(vendor));
app.use(express.static(root));

app.listen(3000);
