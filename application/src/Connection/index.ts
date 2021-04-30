/** Glue code between RTC logic and WebSocket signaling */

import { acceptAnswer, addICE, createAnswer, createOffer } from "../RTC";

const { hostname } = window.location
const webSocket = new WebSocket(`ws://${hostname}:8080`);

// @ts-ignore
window.webSocket = webSocket

/** Hook-up all logic with WebSocket */
export function onConnect(onMembersUpdate: Function) {
  webSocket.onopen = onOpen

  function onOpen () {
    join()
    webSocket.onmessage = onMessage
  }

  function onMessage ({data}: {data: any}) {
    readServiceMessage(data, onMembersUpdate)
  }
}

function readServiceMessage(message: string, cb: Function) {
  const { key, value } = JSON.parse(message) as { key: string, value: any }
  const service: Record<string, Function> = {
    'networkMembers': onNetworkMember,
    'connectWithPeer': handleConnectRequest,
    'ice': onICE
  }

  service[key](value)

  function onNetworkMember(value: Array<string>) {
    cb([...value])
  }
}

function onICE(message: string) {
  const {respondTo: peerID, ice} = JSON.parse(message)

  console.log('RECEIVED: ', {ice})

  addICE(peerID, ice)
}

/** Connection data exchange. Create or accept RTC answer */
async function handleConnectRequest(request: string) {
  const {respondTo, answer: answerWithID, offer: offerWithID} = JSON.parse(request)

  if (offerWithID) {
    const {id, offer} = offerWithID
    const answer = await createAnswer(id, respondTo, offer)
    sendServiceMessageToPeer(respondTo, 'connectWithPeer', {answer})
  } else if (answerWithID) {
    const {id, answer} = answerWithID
    await acceptAnswer(id, respondTo, answer).catch(console.warn)
  }
}

export function sendICECandidate(id: string, ice: RTCIceCandidate) {
  sendServiceMessageToPeer(id, 'ice', {ice})
}

function join() {
  const id = localStorage.getItem('id')
  if (!id) return

  sendMessage('join', id)
}

function sendMessage(key: string, value: any) {
  const message = JSON.stringify({key, value})

  webSocket.send(message)
}

/** Send service message to peer using WebSocket.
 *  Peer will get sender ID, so them can reply.
 * @param {string} id Message receiver
 * @param {string} key Type of action message is regarding
 * @param {any} value Message data  */
function sendServiceMessageToPeer(id: string, key: string, value: any) {
  const respondTo = localStorage.getItem('id')
  sendMessage(key, JSON.stringify({id, respondTo, ...value }))
}

/** Initialize RTC connection by sending new offer */
export async function connectWithPeer(id: string) {
  const offer = await createOffer()
  // Send local peer ID, so remote peer can answer through WebSocket
  const respondTo = localStorage.getItem('id')

  sendMessage("connectWithPeer", JSON.stringify({id, offer, respondTo}))
}

