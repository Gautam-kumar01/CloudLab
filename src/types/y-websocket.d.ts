declare module 'y-websocket' {
  import * as Y from 'yjs';

  export class WebsocketProvider {
    constructor(serverUrl: string, roomname: string, doc: Y.Doc, options?: any);
    awareness: any;
    destroy(): void;
    on(event: string, callback: Function): void;
    connect(): void;
    disconnect(): void;
  }
}
