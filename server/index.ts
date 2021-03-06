// @ts-ignore
import { serve } from "https://deno.land/std@0.88.0/http/server.ts";

// @ts-ignore
import { acceptWebSocket, isWebSocketCloseEvent, isWebSocketPingEvent, WebSocket,  } from "https://deno.land/std@0.88.0/ws/mod.ts";

import websocket from "./websocket.ts";

if (import.meta.main) {
  /** websocket echo server */
  const port = Deno.args[0] || "8080";
  console.log(`websocket server is running on :${port}`);
  for await (const req of serve(`:${port}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
      .then(websocket)
      .catch(async (err: Error) => {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      });
  }
}