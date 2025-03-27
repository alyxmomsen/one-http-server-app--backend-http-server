export class Hook {
    private handler: () => void;

    execute() {
        this.handler();
    }

    constructor(handler: () => void) {
        this.handler = handler;
    }
}
