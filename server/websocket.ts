// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// @ts-ignore
import { acceptWebSocket, isWebSocketCloseEvent, isWebSocketPingEvent, WebSocket } from "https://deno.land/std@0.88.0/ws/mod.ts";

import {onTextMessage} from "./controller.ts";

export type sendBack = (msg: string) => void

export default async function websocket(socket: WebSocket) {
  console.log("socket connected!");
  try {
    for await (const ev of socket) {
      if (typeof ev === "string") {
        onTextMessage(ev, socket)
      } else if (ev instanceof Uint8Array) {
        // binary message.
      } else if (isWebSocketPingEvent(ev)) {
        // ping.
        const [, body] = ev;
      } else if (isWebSocketCloseEvent(ev)) {
        // close.
        const { code, reason } = ev;
        console.log("ws:Close", code, reason);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!socket.isClosed) {
      await socket.close(1000).catch(console.error);
    }
  }
}