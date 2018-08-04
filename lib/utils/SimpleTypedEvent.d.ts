export interface Listener<T> {
    (event: T): void;
}
export interface Disposable {
    dispose(): void;
}
/**
 * Passes through events as they happen. You will not get events from before you start listening
 *
 * @export
 * @class SimpleTypedEvent
 * @template T
 */
export declare class SimpleTypedEvent<T> {
    private listeners;
    private listenersOncer;
    on: (listener: Listener<T>) => Disposable;
    once: (listener: Listener<T>) => void;
    off: (listener: Listener<T>) => void;
    emit: (event: T) => void;
    pipe: (te: SimpleTypedEvent<T>) => Disposable;
}
