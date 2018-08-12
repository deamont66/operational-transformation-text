import { SimpleTypedEvent } from '../../src/utils/SimpleTypedEvent';

test('SimpleTypedEvent on', () => {
    const event = new SimpleTypedEvent<number>();

    const listener = jest.fn();
    event.on(listener);
    event.emit(10);
    expect(listener).toBeCalledWith(10);

    listener.mockClear();
    event.off(listener);
    event.emit(11);
    expect(listener).not.toBeCalled();

    listener.mockClear();
    const handler = event.on(listener);
    event.emit(10);
    expect(listener).toBeCalledWith(10);

    listener.mockClear();
    handler.dispose();
    event.emit(11);
    expect(listener).not.toBeCalled();

    listener.mockClear();
    expect(() => event.off(listener)).not.toThrow();
});

test('SimpleTypedEvent once', () => {
    const event = new SimpleTypedEvent<number>();

    const listener = jest.fn();
    event.once(listener);
    event.emit(10);
    expect(listener).toBeCalledWith(10);

    listener.mockClear();
    event.emit(11);
    expect(listener).not.toBeCalled();
});

test('SimpleTypedEvent pipe', () => {
    const event = new SimpleTypedEvent<number>();
    const pipe = new SimpleTypedEvent<number>();

    const listener = jest.fn();
    const handler = pipe.on(listener);
    event.pipe(pipe);

    event.emit(10);
    expect(listener).toBeCalledWith(10);
    handler.dispose();

    listener.mockClear();
    event.emit(11);
    expect(listener).not.toBeCalled();
});
