/** Data interchange using RTC, glue code between RTC logic and WebSocket signaling */

import {
  acceptAnswer,
  addICE,
  broadCastMessage,
  createAnswer,
  createOffer,
  pcs
} from "../RTC";

import {handleReceivedLibrary, handleRemoveSeeder, propagateLibrary} from "../LibraryController";
import {AppEvents, observeApp} from "../Observe";
import {
  connectWithRandomPeer,
  onPeerConnectionList,
  requestPeerConnectionsList
} from "../RTC/PeerToPeerOverPeerSignaling";
import lodash from "lodash";

const { hostname } = window.location
const webSocket = new WebSocket(`ws://${hostname}:8080`);
const userID = localStorage.getItem('id')

onConnect(onMembersUpdate)

function onMembersUpdate(peers: Array<string>) {
  // Because user joining the network initialize connections with others,
  // we call it only on first update.



  const numberOfConnectedPCS = pcs.filter(filterConnectedPCS).length

  console.log({ numberOfConnectedPCS })

  const connectedPcs = pcs.filter(filterConnectedPCS) || []
  if (connectedPcs.length)
    connectedPcs
      .forEach(({dataChannel}) => {
        if (!dataChannel) return
        requestPeerConnectionsList(dataChannel).then(e => onPeerConnectionList(e, dataChannel))
      })

  if (numberOfConnectedPCS > 0) return

  connectWithRandomPeer()
  addListeners()

  function filterConnectedPCS({ pc }: PeerConnection) {
    return pc.connectionState === 'connected'
  }
}

function connectWithPeers(peers: Array<string>) {
  peers
    .filter(peer => peer !== userID) // We don't want to connect with ourselves
    .forEach(connectWithPeer)
}

function sendMembersUpdate({ detail }: CustomEvent) {
  (detail as RTCDataChannel).send(JSON.stringify({ key: AppEvents.DataChannel.MEMBERS_UPDATE, data: pcs.map(({ peerID }) => peerID)}))
}

function addListeners() {
  observeApp.addEventListener(AppEvents.DATA_CHANNEL_OPEN, propagateLibrary)
  observeApp.addEventListener(AppEvents.DATA_CHANNEL_OPEN, sendMembersUpdate as EventListener)
  observeApp.addEventListener(AppEvents.DataChannel.RECEIVED_REMOTE_LIBRARY, handleReceivedLibrary as EventListener)
  observeApp.addEventListener(AppEvents.DataChannel.DELETE_SEEDER, handleRemoveSeeder as EventListener)
  observeApp.addEventListener(AppEvents.DataChannel.GET_CONNECTIONS, handleGetConnections as EventListener)
  observeApp.addEventListener(AppEvents.DataChannel.REDIRECT_OFFER, handleRedirectOffer as EventListener)
  observeApp.addEventListener(AppEvents.DataChannel.MEMBERS_UPDATE, () => {
    onMembersUpdate(pcs.map(({peerID}) => peerID))
  })
}

function handleRedirectOffer({ detail }: CustomEvent) {
  const { offerWithID, offerer, respondTo, redirectTo } = JSON.parse(detail)

  const { dataChannel: dc } = pcs.find(({ peerID, dataChannel }) => peerID === redirectTo && dataChannel?.readyState === 'open') || {}
  const message = JSON.stringify({ key: 'REDIRECTED_OFFER', data: { offerer, offerWithID, respondTo: userID } })

  console.debug('REDIRECT OFFER', dc, detail)

  if (!dc) return



  // LEGIT DC
  dc.send(message)

  // handleConnectRequestPTPOPS(dc, JSON.stringify({ data: { offerWithID, dc } }))
}

function handleGetConnections({ detail: dc }: CustomEvent) {
  (dc as RTCDataChannel).send(
    JSON.stringify(
      lodash.uniq( // For some reason it happens that peer is connected twice with the same peer, so uniq
        pcs
          .filter(({ peerID, pc }) => peerID && pc.connectionState === 'connected')
          .map(({ peerID }) => peerID)
      )))
}

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

  // console.log('RECEIVED: ', {ice})

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

export function sendMessage(key: string, value: any) {
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

