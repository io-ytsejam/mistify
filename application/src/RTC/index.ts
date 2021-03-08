import { v4 as uuid } from 'uuid';
import {sendICECandidate} from "../Connection";

interface PeerConnection {
  pc: RTCPeerConnection
  id: string
  peerID: string
}

const pcs: Array<PeerConnection> = []
const iceCandidates: Array<{id: string, ice: RTCIceCandidate}> = []

// @ts-ignore
window.pcs = pcs

export async function createOffer(): Promise<{id: string, offer: RTCSessionDescription}> {
  const pc = new RTCPeerConnection()
  console.log(pc.createDataChannel('superExtraChannel'))
  pc.ondatachannel = console.log
  const id = uuid()

  pc.onicegatheringstatechange = console.log

  pc.onicecandidate = function ({candidate}) {
    console.log(candidate)
    if (candidate) {
      iceCandidates.push({id, ice: candidate})
    }
    // sendICECandidate(id, candidate as RTCIceCandidate)
  }

  pcs.push({id, pc, peerID: ''})

  const offer = await pc.createOffer()

  await pc.setLocalDescription(offer)

  if (pc.localDescription === null) throw new Error('Offer not created')

  return {id, offer: pc.localDescription}
}

export async function createAnswer(connectionID: string, offerer: string, offer: RTCSessionDescription): Promise<{id: string, answer: RTCSessionDescription}> {
  const pc = new RTCPeerConnection()
  pc.ondatachannel = console.log

  pcs.push({id: connectionID, pc, peerID: offerer})
  await pc.setRemoteDescription(offer)
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

  if (pc.localDescription === null) throw new Error('Offer not created')

  return {id: connectionID, answer: pc.localDescription}
}

export async function acceptAnswer(connectionID: string, answerer: string, answer: RTCSessionDescription) {
  const {pc, id} = pcs.find(({id}) => id === connectionID) || {}

  if (pc === undefined || id === undefined) throw new Error('Peer connection not found')

  pcs.splice(0, pcs.length, ...[
    ...pcs.filter(({id: i}) => i !== id),
    {pc, id, peerID: answerer}
  ])

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