import { AbstractLocalClient } from './AbstractLocalClient';
import { TextOperation } from '../operations/TextOperation';
import { Selection } from '../operations/Selection';

export interface ClientState {
    applyClient(client: AbstractLocalClient, operation: TextOperation): ClientState;
    applyServer(client: AbstractLocalClient, operation: TextOperation): ClientState;
    serverAck(client: AbstractLocalClient): ClientState;
    transformSelection(selection: Selection): Selection;
    resend(client: AbstractLocalClient): void;
}

export class Synchronized implements ClientState {
    applyClient(client: AbstractLocalClient, operation: TextOperation): ClientState {
        // When the user makes an edit, send the operation to the server and
        // switch to the 'AwaitingConfirm' state
        client.sendOperation(client.revision, operation);
        return new AwaitingConfirm(operation);
    }

    applyServer(client: AbstractLocalClient, operation: TextOperation): ClientState {
        // When we receive a new operation from the server, the operation can be
        // simply applied to the current document
        client.applyOperation(operation);
        return this;
    }

    serverAck(client: AbstractLocalClient): ClientState {
        throw new Error('There is no pending operation (client is not expecting server ack).');
    }

    transformSelection(selection: Selection): Selection {
        // Nothing to do because the latest server state and client state are the same.
        return selection;
    }

    resend(): void {}
}

export const synchronizedInstance = new Synchronized();

export class AwaitingConfirm implements ClientState {
    outstanding: TextOperation;

    constructor(outstanding: TextOperation) {
        this.outstanding = outstanding;
    }

    applyClient(client: AbstractLocalClient, operation: TextOperation) {
        // When the user makes an edit, don't send the operation immediately,
        // instead switch to 'AwaitingWithBuffer' state
        return new AwaitingWithBuffer(this.outstanding, operation);
    }

    applyServer(client: AbstractLocalClient, operation: TextOperation): ClientState {
        // This is another client's operation. Visualization:
        //
        //                   /\
        // this.outstanding /  \ operation
        //                 /    \
        //                 \    /
        //  pair[1]         \  / pair[0] (new outstanding)
        //  (can be applied  \/
        //  to the client's
        //  current document)
        const pair = TextOperation.transform(this.outstanding, operation);
        client.applyOperation(pair[1]);
        return new AwaitingConfirm(pair[0]);
    }

    serverAck(client: AbstractLocalClient) {
        // The client's operation has been acknowledged
        // => switch to synchronized state
        return synchronizedInstance;
    }

    transformSelection(selection: Selection) {
        return selection.transform(this.outstanding);
    }

    resend(client: AbstractLocalClient) {
        // The confirm didn't come because the client was disconnected.
        // Now that it has reconnected, we resend the outstanding operation.
        client.sendOperation(client.revision, this.outstanding);
    }
}

export class AwaitingWithBuffer implements ClientState {
    outstanding: TextOperation;
    buffer: TextOperation;

    constructor(outstanding: TextOperation, buffer: TextOperation) {
        // Save the pending operation and the user's edits since then
        this.outstanding = outstanding;
        this.buffer = buffer;
    }

    applyClient(client: AbstractLocalClient, operation: TextOperation) {
        // Compose the user's changes onto the buffer
        var newBuffer = this.buffer.compose(operation);
        return new AwaitingWithBuffer(this.outstanding, newBuffer);
    }

    applyServer(client: AbstractLocalClient, operation: TextOperation) {
        // Operation comes from another client
        //
        //                       /\
        //     this.outstanding /  \ operation
        //                     /    \
        //                    /\    /
        //       this.buffer /  \* / pair1[0] (new outstanding)
        //                  /    \/
        //                  \    /
        //          pair2[1] \  / pair2[0] (new buffer)
        // the transformed    \/
        // operation -- can
        // be applied to the
        // client's current
        // document
        //
        // * pair1[1]
        const pair1 = TextOperation.transform(this.outstanding, operation);
        const pair2 = TextOperation.transform(this.buffer, pair1[1]);
        client.applyOperation(pair2[1]);
        return new AwaitingWithBuffer(pair1[0], pair2[0]);
    }

    serverAck(client: AbstractLocalClient) {
        // The pending operation has been acknowledged
        // => send buffer
        client.sendOperation(client.revision, this.buffer);
        return new AwaitingConfirm(this.buffer);
    }

    transformSelection(selection: Selection) {
        return selection.transform(this.outstanding).transform(this.buffer);
    }

    resend(client: AbstractLocalClient) {
        // The confirm didn't come because the client was disconnected.
        // Now that it has reconnected, we resend the outstanding operation.
        client.sendOperation(client.revision, this.outstanding);
    }
}
