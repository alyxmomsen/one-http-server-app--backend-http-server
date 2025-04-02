import express, { Response, Express, response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { Hook } from './hook/Hook';

const cors = require('cors');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

/**
 * this types must be sync with other apps
 * */
export enum hooksHandlerState {
    pending,
    updating,
}

/**
 * this types must be sync  with other apps
 * */
export enum EnumHookOpCode {
    add_transaction,
    other,
}

/**
 * this types must be sync  with other apps;
 * returns 
 * */
export type THookResponse = {
    opcode: EnumHookOpCode;
};

/**
 * на фронте это TRequestData
 * this types must be sync  with other appss
 * 
 * 
 */
export type THookRequest = {
    userId:number;
    opcode: EnumHookOpCode;

};

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

    /**
     * test
     * add app hook
     */
    private addHookFromApp() {
        this.hooks.push();
    }

    private executeHooks({ hookOpCode }: { hookOpCode: EnumHookOpCode }) {
        this.hooksHandlerState = hooksHandlerState.updating;
        while (this.hooks.length) {
            const hook = this.hooks.shift();

            if (hook === undefined) continue;

            hook.execute(hookOpCode);
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


        /**
         * this  route for the App
         */
        this.httpServer.post('/api/hook', async (req, res: Response) => {
            const body = req.body;

            console.log('hook request', req.body);

            const opcode = await new Promise<EnumHookOpCode>((res, rej) => {
                const hook = new Hook((opCode: EnumHookOpCode) => res(opCode));
                this.hooks.push(hook);
            });


            /**
             * 
             * response opcode to the back-end App
             * when the hook is resolved
             */
            const response: THookResponse = {
                opcode,
            };

            res.status(219).json(response);
        });


        /**
         * the route for front-end app
         */
        this.httpServer.get('/', async (req, res: Response) => {
            const filecontent = readFileSync(
                path.resolve(this.baseURL, 'dist/index.html'),
                {
                    encoding: 'utf-8',
                }
            );

            res.status(200).send(filecontent);
        });


        /**
         * 
         * route for front-end application
         */
        this.httpServer.post(
            '/api/add-transaction',
            jsonParser,
            (req, res: Response) => {
                /**
                 * на фронте при отправке риквеста данные должны совпадать
                 */
                const body = req.body as THookRequest;

                console.log(body);

                ////////////////////////////////////
                //                                //
                //   код для проверки боди здесь  //
                //                                //
                ////////////////////////////////////

                // резолвим ожидающие хуки для приложения
                // на данный момент во все хуки отправляются одни и те же  параметры
                this.executeHooks({
                    hookOpCode:
                        /* EnumHookOpCode.add_transaction */ body.opcode,
                });

                /**
                 * респонз для фронтенда
                 */
                res.status(200).json({
                    status: 0,
                });
            }
        );
    }
}

const httpserver = new HTTPServer();
httpserver.start();
