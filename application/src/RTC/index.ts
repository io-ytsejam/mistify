import { v4 as uuid } from 'uuid';
import {sendICECandidate} from "../Connection";

interface PeerConnection {
  pc: RTCPeerConnection
  id: string
  peerID: string,
  dataChannel?: RTCDataChannel
}

export { pcs, observeConnections }

const observeConnections = new EventTarget()
const pcs: Array<PeerConnection> = []
const iceCandidates: Array<{id: string, ice: RTCIceCandidate}> = []
const peerConnectionConfig = {
  iceServers: [{
    urls: 'turn:numb.viagenie.ca',
    credential: 'muazkh',
    username: 'webrtc@live.com'
  },
    {
      urls: 'stun:stun.l.google.com:19302'
    }]
}

// @ts-ignore
window.pcs = pcs

function dispatchPcsChange() {
  observeConnections.dispatchEvent(new Event('change'))
}

export function pingPeer(peerID: string) {
  const connection = pcs.find(({peerID: id}) => id === peerID)
  if (!connection) throw new Error('Peer not found')

  const message = JSON.stringify({key: 'PING', value: ''})

  connection.dataChannel?.send(message)
}

function getConnectionEndHandler(connectionID: string, pc: RTCPeerConnection): ((this:RTCPeerConnection, ev: Event) => any) {
  return function () {
    if (!['failed', 'disconnected', 'closed'].some(removableState => removableState === pc.connectionState)) return
    removeConnection({ connectionID })
  }
}

export async function createOffer(): Promise<{id: string, offer: RTCSessionDescription}> {
  const connectionID = uuid()
  const pc = new RTCPeerConnection(peerConnectionConfig)
  const dataChannel = pc.createDataChannel('main', {id: 10, negotiated: true})

  pc.onconnectionstatechange = getConnectionEndHandler(connectionID, pc)
  pc.onicegatheringstatechange = console.log
  pc.onicecandidate = onICECandidate
  dataChannel.onmessage = console.log

  console.log(pc, dataChannel)
  pcs.push({id: connectionID, pc, peerID: '', dataChannel})
  dispatchPcsChange()

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  if (pc.localDescription === null) throw new Error('Offer not created')
  return {id: connectionID, offer: pc.localDescription}

  function onICECandidate ({candidate}: RTCPeerConnectionIceEvent) {
    console.log(candidate)
    if (candidate) {
      iceCandidates.push({id: connectionID, ice: candidate})
    }
  }
}

function removeConnection({peerID, connectionID}: {peerID?: string, connectionID?: string}) {
  pcs.splice(0, pcs.length, ...pcs.filter(({peerID: id}) => id !== peerID))
  pcs.splice(0, pcs.length, ...pcs.filter(({id}) => id !== connectionID))
  dispatchPcsChange()
}

export async function createAnswer(connectionID: string, offerer: string, offer: RTCSessionDescription): Promise<{id: string, answer: RTCSessionDescription}> {
  const optionalConnection = pcs.find(({ peerID }) => peerID === offerer)

  if (optionalConnection) {
    removeConnection({ peerID: offerer })
  }

  const pc = new RTCPeerConnection(peerConnectionConfig)
  const dataChannel = pc.createDataChannel('main', {id: 10, negotiated: true})
  dataChannel.onmessage = console.log

  pc.onconnectionstatechange = getConnectionEndHandler(connectionID, pc)
  pc.onicegatheringstatechange = console.log
  pc.onicecandidate = onIceCandidate

  console.log({pc})

  pcs.push({id: connectionID, pc, peerID: offerer, dataChannel})
  dispatchPcsChange()
  await pc.setRemoteDescription(offer)
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

  if (pc.localDescription === null) throw new Error('Offer not created')

  return {id: connectionID, answer: pc.localDescription}

  function onIceCandidate ({candidate}: RTCPeerConnectionIceEvent) {
    if (candidate) {
      iceCandidates.push({id: uuid(), ice: candidate})
      sendICECandidate(offerer, candidate as RTCIceCandidate)
    }
  }
}

export async function acceptAnswer(connectionID: string, answerer: string, answer: RTCSessionDescription) {
  const peerConnection = pcs.find(({id}) => id === connectionID)
  const { pc, id } = peerConnection || {pc: undefined, id: undefined}

  if (!peerConnection) throw new Error('Peer connection not found')
  if (pc === undefined || id === undefined) throw new Error('Peer connection not found')

  pcs.splice(0, pcs.length, ...[
    ...pcs.filter(({id: i}) => i !== id),
    {...peerConnection, peerID: answerer}
  ])
  dispatchPcsChange()

  await pc.setRemoteDescription(answer)
  const {peerID} = pcs.find(({id: connID}) => connID === id) || {}
  const icesToSend = iceCandidates.filter(({id: i}) => id === i)
  icesToSend.forEach(function ({ice}) {
    if (!peerID) return
    sendICECandidate(peerID, ice)
  })
  iceCandidates.splice(0, icesToSend.length, ...iceCandidates.filter(({id: i}) => i !== id))
}

export function addICE(peerID: string, ice: RTCIceCandidate) {
  const {pc} = pcs.find(({peerID: id}) => peerID === id) || {}

  if (pc)
    pc.addIceCandidate(ice)
}