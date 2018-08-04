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
export declare class TypedEvent<TSender, TEvent> {
    private listeners;
    private listenersOncer;
    on: (listener: Listener<TSender, TEvent>) => Disposable;
    once: (listener: Listener<TSender, TEvent>) => void;
    off: (listener: Listener<TSender, TEvent>) => void;
    emit: (sender: TSender, event: TEvent) => void;
    pipe: (te: TypedEvent<TSender, TEvent>) => Disposable;
}
