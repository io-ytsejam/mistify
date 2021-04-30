import { WebSocket, WebSocketEvent } from "https://deno.land/std@0.88.0/ws/mod.ts";
import {onConnectWithPeer, onIce, onJoin, Peer} from "./managePeers.ts";
import { sendBack } from "./websocket.ts";

export function onTextMessage(message: string, socket: WebSocket) {
  try {
    const {key, value} = JSON.parse(message)
    const peer = new Peer(socket, value)

    if (key === 'join') onJoin(peer, msg => socket.send(msg))
    if (key === 'connectWithPeer') onConnectWithPeer(value, msg => socket.send(msg))
    if (key === 'ice') onIce(message)
  } catch ({message}) {
    console.warn(message)
  }
}