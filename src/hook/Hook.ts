import { EnumHookOpCode } from '..';

export class Hook {
    private handler: (opCode: EnumHookOpCode) => void;

    execute(opCode: EnumHookOpCode) {
        this.handler(opCode);
    }

    constructor(handler: (opCode: EnumHookOpCode) => void) {
        this.handler = handler;
    }
}
