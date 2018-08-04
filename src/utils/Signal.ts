export interface Listener {
    (): void;
}

export interface Disposable {
    dispose(): void;
}

/**
 * Passes through events as they happen. You will not get events from before you start listening
 *
 * @export
 * @class TypedSignal
 */
export class Signal {
    private listeners: Listener[] = [];
    private listenersOncer: Listener[] = [];

    on = (listener: Listener): Disposable => {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener)
        };
    };

    once = (listener: Listener): void => {
        this.listenersOncer.push(listener);
    };

    off = (listener: Listener) => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    };

    emit = () => {
        /** Update any general listeners */
        this.listeners.forEach(listener => listener());

        /** Clear the `once` queue */
        this.listenersOncer.forEach(listener => listener());
        this.listenersOncer = [];
    };

    pipe = (te: Signal): Disposable => {
        return this.on(() => te.emit());
    };
}
