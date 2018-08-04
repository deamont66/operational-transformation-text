import { TypedEvent } from '../../src/utils/TypedEvent';

test('TypedEvent on', () => {
    const event = new TypedEvent<string, number>();

    const listener = jest.fn();
    event.on(listener);
    event.emit('me', 10);
    expect(listener).toBeCalledWith('me', 10);

    listener.mockClear();
    event.off(listener);
    event.emit('me', 11);
    expect(listener).not.toBeCalled();

    listener.mockClear();
    const handler = event.on(listener);
    event.emit('me', 10);
    expect(listener).toBeCalledWith('me', 10);

    listener.mockClear();
    handler.dispose();
    event.emit('me', 11);
    expect(listener).not.toBeCalled();

    listener.mockClear();
    expect(() => event.off(listener)).not.toThrow();
});

test('TypedEvent once', () => {
    const event = new TypedEvent<string, number>();

    const listener = jest.fn();
    event.once(listener);
    event.emit('me', 10);
    expect(listener).toBeCalledWith('me', 10);

    listener.mockClear();
    event.emit('me', 11);
    expect(listener).not.toBeCalled();
});

test('TypedEvent pipe', () => {
    const event = new TypedEvent<string, number>();
    const pipe = new TypedEvent<string, number>();

    const listener = jest.fn();
    const handler = pipe.on(listener);
    event.pipe(pipe);

    event.emit('me', 10);
    expect(listener).toBeCalledWith('me', 10);
    handler.dispose();

    listener.mockClear();
    event.emit('me', 11);
    expect(listener).not.toBeCalled();
});
