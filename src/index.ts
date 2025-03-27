import express, { Response, Express, response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { Hook } from './hook/Hook';

const cors = require('cors');

export enum hooksHandlerState {
    pending,
    updating,
}

class HTTPServer {
    private counter: number;
    private ram: number[];
    private baseURL: string;
    private httpServer: Express;

    private hooks: Hook[];

    private hooksHandlerState: hooksHandlerState;

    private update() {
        this.counter += 1;
    }

    private executeHooks() {
        this.hooksHandlerState = hooksHandlerState.updating;
        while (this.hooks.length) {
            const hook = this.hooks.shift();

            if (hook === undefined) continue;

            hook.execute();
        }
        this.hooksHandlerState = hooksHandlerState.pending;
    }

    async start() {
        this.httpServer.listen(3000, /* '0.0.0.0' */ 'localhost', () => {
            console.log('server is running on port ' + 3000);
        });

        while (true) {
            this.update();
            await new Promise<void>((res, rej) => {
                setTimeout(() => res(), 0);
            });
        }
    }

    constructor() {
        this.hooksHandlerState = hooksHandlerState.pending;

        this.hooks = [];

        this.httpServer = express();

        this.httpServer.use(cors());

        this.ram = [];
        this.counter = 0;

        this.baseURL =
            'C:/Users/user/Desktop/projects/javascript/sandbox/cash-flow-app-practice/anotheronesite/frontend/';

        this.httpServer.get('/api/bundle.js', async (req, res: Response) => {
            const filecontent = readFileSync(
                path.resolve(this.baseURL, 'dist/bundle.js'),
                {
                    encoding: 'utf-8',
                }
            );

            res.header({
                'content-type': 'text/javascript',
            });

            res.status(222).send(filecontent);
        });

        this.httpServer.post('/api/hook', async (req, res: Response) => {

            const body = req.body ;


            console.log('hook request' , req.body);

            await new Promise<void>((res, rej) => {
                const hook = new Hook(() => res());
                this.hooks.push(hook);
            });

            res.status(219).json({
                foo: 'bar',
            });
        });

        this.httpServer.get('/', async (req, res: Response) => {
            const filecontent = readFileSync(
                path.resolve(this.baseURL, 'dist/index.html'),
                {
                    encoding: 'utf-8',
                }
            );

            res.status(200).send(filecontent);
        });

        this.httpServer.post('/api/add-transaction', (req, res: Response) => {
            this.executeHooks();

            res.status(200).json({
                status: 0,
            });
        });
    }
}

const httpserver = new HTTPServer();
httpserver.start();
