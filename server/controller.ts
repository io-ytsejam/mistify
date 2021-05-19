import { WebSocket, WebSocketEvent } from "https://deno.land/std@0.88.0/ws/mod.ts";
import {onConnectWithPeer, onConnectWithRandomPeer, onIce, onJoin, Peer, updatePeerList} from "./managePeers.ts";

export function onTextMessage(message: string, socket: WebSocket) {
  console.debug('HERE COMES A VERY EXPENSIVE MESSAGE!')
  try {
    const {key, value} = JSON.parse(message)
    const peer = new Peer(socket, value)

    if (key === 'join') onJoin(peer, msg => socket.send(msg))
    if (key === 'connectWithPeer') onConnectWithPeer(value, msg => socket.send(msg))
    if (key === 'connectWithRandomPeer') onConnectWithRandomPeer(value)
    if (key === 'ice') onIce(message)
  } catch ({message}) {
    console.warn(message)
  }
}

export function onClosed() {
  updatePeerList()
}