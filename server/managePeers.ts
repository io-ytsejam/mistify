import { WebSocket, WebSocketEvent, WebSocketMessage } from "https://deno.land/std@0.88.0/ws/mod.ts";
import {sendBack} from "./websocket.ts";

export class Peer {
  constructor(socket: WebSocket, id: string) {
    this.socket = socket;
    this.id = id;
  }

  socket: WebSocket
  id: string
}

let peers: Array<Peer> = []

export function onJoin(peer: Peer, answer: sendBack) {
  updatePeerList(peer)
  broadcastNetworkMembers()

  // answer(JSON.stringify({key: 'networkMembers', value: peers.map(({id}) => id)}))
}

export function onConnectWithPeer(peerIDToConnectWith: string, answer: sendBack) {
  sendMessageToPeer(peerIDToConnectWith, formatMessage('connectWithPeer', "Some want to connect with you"))
}

function updatePeerList(peer: Peer|undefined = undefined) {
  peers = peer ? [...peers.filter(({socket}) => !socket.isClosed), peer] : peers
}

function formatMessage(key: string, value: any) {
  return JSON.stringify({key, value})
}

export function sendMessageToPeer(peerID: string, message: WebSocketMessage) {
  updatePeerList()
  const {socket} = peers.find(({id}) => id === peerID) || {}

  if (!socket) throw Error('Peer is unreachable')

  socket.send(message)
}

function broadcastNetworkMembers() {
  updatePeerList()

  peers.forEach(({socket}) => {
    socket.send(formatMessage('networkMembers', peers.map(({id}) => id)))
  })
}