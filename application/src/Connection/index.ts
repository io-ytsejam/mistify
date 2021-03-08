import { v4 as uuid } from 'uuid';
import {acceptAnswer, addICE, createAnswer, createOffer} from "../RTC";

const webSocket = new WebSocket('ws://localhost:8080');

// @ts-ignore
window.webSocket = webSocket

let members: Array<string> = []
let rtcPeerConnections = []

export function onConnect(onMembersUpdate: Function) {
  webSocket.onopen = handleOpen(onMembersUpdate)
}

function handleOpen(onMembersUpdate: Function) {
  return function () {
    join()

    webSocket.onmessage = function ({data}) {
      readTextMessage(data, onMembersUpdate)
    }
  }
}

function readTextMessage(message: string, cb: Function) {
  const { key, value } = JSON.parse(message)

  if (key === 'networkMembers') {
    onNetworkMember(value)
  }

  if (key === 'connectWithPeer') {
    console.log('HMMM: ', value)
    alert('HMMM: ' + value)
    handleConnectRequest(value)
  }

  if (key === 'ice') {
    onICE(value)
  }

  function onNetworkMember(value: Array<string>) {
    members = [...value]

    cb(members)
  }
}

function onICE(message: string) {
  const {respondTo: peerID, ice} = JSON.parse(message)

  console.log('RECEIVED: ', {ice})

  addICE(peerID, ice)
}

async function handleConnectRequest(request: string) {
  const {respondTo, answer: answerWithID, offer: offerWithID} = JSON.parse(request)

  if (offerWithID) {
    const {id, offer} = offerWithID
    sendMessageToPeer(respondTo, 'connectWithPeer', {answer: await createAnswer(id, respondTo, offer)})
  } else if (answerWithID) {
    const {id, answer} = answerWithID
    await acceptAnswer(id, respondTo, answer)
  }
}

export function sendICECandidate(id: string, ice: RTCIceCandidate) {
  sendMessageToPeer(id, 'ice', {ice})
}

function join() {
  const id = uuid()

  sessionStorage.setItem('id', id)

  sendMessage('join', id)
}

function sendMessage(key: string, value: any) {
  const message = JSON.stringify({key, value})

  webSocket.send(message)
}

function sendMessageToPeer(id: string, key: string, value: any) {
  const respondTo = sessionStorage.getItem('id')
  sendMessage(key, JSON.stringify({id, respondTo, ...value }))
}

export async function connectWithPeer(id: string) {
  const offer = await createOffer()
  const respondTo = sessionStorage.getItem('id')

  sendMessage("connectWithPeer", JSON.stringify({id, offer, respondTo}))
}

