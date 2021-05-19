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

export function   onConnectWithRandomPeer(message: string) {
  const { respondTo: sender } = JSON.parse(message)
  if (!peers.length) return
  const connectedPeers = peers.filter(({ id, socket }) => id !== sender && !socket.isClosed)
  if (!connectedPeers.length) return
  const { id: receiverID } = connectedPeers.length === 1 ?
    connectedPeers[0] :
    connectedPeers[Math.round(Math.random() * (connectedPeers.length - 1))]

  if (!receiverID) return

  sendMessageToPeer(receiverID, JSON.stringify({ key: 'connectWithPeer', value: message}))
}

export function onConnectWithPeer(message: string, answer: sendBack) {
  const {id: receiverID} = JSON.parse(message)
  sendMessageToPeer(receiverID, JSON.stringify({ key: 'connectWithPeer', value: message}))
}

export function onIce(message: string) {
  const {value} = JSON.parse(message)
  const { id: receiverID, ice, respondTo } = JSON.parse(value)
  const messageToSend = JSON.stringify({
    key: 'ice',
    value: JSON.stringify({
      ice,
      respondTo
    })
  })
  sendMessageToPeer(receiverID, messageToSend)
}

export function updatePeerList(peer: Peer|undefined = undefined) {
  peers = peer ? [...peers.filter(({socket}) => !socket.isClosed), peer] : peers
}

function formatMessage(key: string, value: any) {
  return JSON.stringify({key, value})
}

export function sendMessageToPeer(peerID: string, message: WebSocketMessage) {
  updatePeerList()
  const { socket } = peers.find(({id, socket}) => id === peerID && !socket.isClosed) || {}

  if (!socket) return console.error('Peer is unreachable')

  socket.send(message)
}

function broadcastNetworkMembers() {
  updatePeerList()

  peers.forEach(({socket}) => {
    socket.send(formatMessage('networkMembers', peers.map(({id}) => id)))
  })
}