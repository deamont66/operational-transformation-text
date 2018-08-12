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
export declare class Signal {
    private listeners;
    private listenersOncer;
    on: (listener: Listener) => Disposable;
    once: (listener: Listener) => void;
    off: (listener: Listener) => void;
    emit: () => void;
    pipe: (te: Signal) => Disposable;
}
