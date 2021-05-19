// onJoin - broadcasting network join should be broadcasted over WebRTC :)

import {AppEvents} from "../../Observe";
import {acceptAnswer, createAnswer, createOffer, pcs} from "../index";
import {sendMessage} from "../../Connection";
import { v4 as uuid } from "uuid";
const userID = localStorage.getItem('id') || ''

export function requestPeerConnectionsList(dc: RTCDataChannel): Promise<MessageEvent<string>> {
  return new Promise(executor)

  function executor(res: (reason: MessageEvent<string>) => void, rej: (reason: unknown) => void) {
    console.debug('%c REQUEST LIST')
    const message = { key: AppEvents.DataChannel.GET_CONNECTIONS }
    dc.send(JSON.stringify(message))
    dc.onmessage = e => res(e)
    dc.onclose = rej
  }
}

export function onPeerConnectionList(e: MessageEvent<string>, dc: RTCDataChannel) {
  console.log({ e, dc })
  const peers = JSON.parse(e.data) as string[]

  peers.filter(id => id !== userID).forEach(peerID => {
    console.debug('%c REQUEST CONNECT WITH: ', peerID)
    connectWithPeerPTPOPS(peerID, dc)
  })
}

function getLabel() {
  const { GET_CONNECTIONS: key } = AppEvents.DataChannel
  const data = {}
  return JSON.stringify({ key, data })
}

export async function connectWithRandomPeer() {
  const offer = await createOffer()
  // Send local peer ID, so remote peer can answer through WebSocket
  const respondTo = localStorage.getItem('id')

  sendMessage("connectWithRandomPeer", JSON.stringify({ offer, respondTo }))
}
