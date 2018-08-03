import { TypedEvent } from '../../src/utils/TypedEvent';

test('TestEvent on', () => {
    const event = new TypedEvent<number>();

    const listener = jest.fn();
    event.on(listener);
    event.emit(10);
    expect(listener).toBeCalledWith(10);

    event.off(listener);
    event.emit(11);
    expect(listener).not.toBeCalledWith(11);

    const handler = event.on(listener);
    event.emit(10);
    expect(listener).toBeCalledWith(10);
    handler.dispose();
    event.emit(11);
    expect(listener).not.toBeCalledWith(11);

    expect(() => event.off(listener)).not.toThrow();
});

test('TestEvent once', () => {
    const event = new TypedEvent<number>();

    const listener = jest.fn();
    event.once(listener);
    event.emit(10);
    expect(listener).toBeCalledWith(10);
    event.emit(11);
    expect(listener).not.toBeCalledWith(11);
});

test('TestEvent pipe', () => {
    const event = new TypedEvent<number>();
    const pipe = new TypedEvent<number>();

    const listener = jest.fn();
    const handler = pipe.on(listener);
    event.pipe(pipe);

    event.emit(10);
    expect(listener).toBeCalledWith(10);
    handler.dispose();

    event.emit(11);
    expect(listener).not.toBeCalledWith(11);
});
