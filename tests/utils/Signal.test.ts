import { Signal } from '../../src/utils/Signal';

test('Signal on', () => {
    const event = new Signal();

    const listener = jest.fn();
    event.on(listener);
    event.emit();
    expect(listener).toBeCalledWith();

    listener.mockClear();
    event.off(listener);
    event.emit();
    expect(listener).not.toBeCalled();

    listener.mockClear();
    const handler = event.on(listener);
    event.emit();
    expect(listener).toBeCalledWith();

    listener.mockClear();
    handler.dispose();
    event.emit();
    expect(listener).not.toBeCalled();

    listener.mockClear();
    expect(() => event.off(listener)).not.toThrow();
});

test('Signal once', () => {
    const event = new Signal();

    const listener = jest.fn();
    event.once(listener);
    event.emit();
    expect(listener).toBeCalledWith();

    listener.mockClear();
    event.emit();
    expect(listener).not.toBeCalled();
});

test('Signal pipe', () => {
    const event = new Signal();
    const pipe = new Signal();

    const listener = jest.fn();
    const handler = pipe.on(listener);
    event.pipe(pipe);

    event.emit();
    expect(listener).toBeCalledWith();
    handler.dispose();

    listener.mockClear();
    event.emit();
    expect(listener).not.toBeCalled();
});
