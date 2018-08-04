export interface Listener<TSender, TEvent> {
    (sender: TSender, event: TEvent): void;
}

export interface Disposable {
    dispose(): void;
}

/**
 * Passes through events as they happen. You will not get events from before you start listening
 *
 * @export
 * @class TypedEvent
 * @template TSender
 * @template TEvent
 */
export class TypedEvent<TSender, TEvent> {
    private listeners: Listener<TSender, TEvent>[] = [];
    private listenersOncer: Listener<TSender, TEvent>[] = [];

    on = (listener: Listener<TSender, TEvent>): Disposable => {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener)
        };
    };

    once = (listener: Listener<TSender, TEvent>): void => {
        this.listenersOncer.push(listener);
    };

    off = (listener: Listener<TSender, TEvent>) => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    };

    emit = (sender: TSender, event: TEvent) => {
        /** Update any general listeners */
        this.listeners.forEach(listener => listener(sender, event));

        /** Clear the `once` queue */
        this.listenersOncer.forEach(listener => listener(sender, event));
        this.listenersOncer = [];
    };

    pipe = (te: TypedEvent<TSender, TEvent>): Disposable => {
        return this.on((s, e) => te.emit(s, e));
    };
}
