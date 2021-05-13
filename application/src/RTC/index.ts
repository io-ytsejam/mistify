import { v4 as uuid } from 'uuid';
import { sendICECandidate } from "../Connection";
import MainDB, {IBinaryData, IBinaryMetadata} from "../MainDB";
import { addDataSeeder } from "../LibraryController";
import { AppEvents, dispatchDataChannelLibrary, dispatchDataChannelOpen, dispatchPcsChange } from "../Observe";

export { pcs }

const db = new MainDB()

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
const userID = localStorage.getItem('id') || ''

// For debugging
// @ts-ignore
window.pcs = pcs

export function broadCastMessage(message: string) {
  pcs.map(({dataChannel}) => dataChannel)
    .filter(dataChannel => dataChannel?.readyState === 'open')
    .forEach(dc => dc?.send(message))
}

export async function requestBinaryData(meta: IBinaryMetadata): Promise<Blob> {
  const { seeders } = meta

  return await initStream()

  async function initStream(): Promise<Blob> {
    try {
      const blob = await initLocalStream()
      console.info('Data found locally')
      return blob
    } catch ({ message }) {
      const blob = await initRemoteStream()
      console.warn(message)
      console.info('Data found remotely')
      return blob
    }
  }

  async function initLocalStream() {
    return db.binaryData
      .filter(({ hash }) => hash === meta.hash)
      .last()
      .then(onFulfilled)
    }

  function onFulfilled(data: IBinaryData | undefined) {
    const { binary } = data || {}
    if (binary) {
      assurePeerIsSeeder()
      return new Blob([binary])
    } else throw new Error('Track not found locally')
  }

  function assurePeerIsSeeder() {
    db.binaryMetadata.filter(({ hash }) => hash === meta.hash)
      .first().then(exist => {
        if (!exist) db.binaryMetadata.add(meta)
      })
  }

  function initRemoteStream(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const { pc, peerID } = pcs.find(({peerID, pc}) => seeders.some(userToken => userToken === peerID && pc.connectionState === 'connected')) || {}
      if (!pc) throw new Error('No peer streaming this track is reachable')
      console.debug("Streaming from", peerID)
      const dataParts: Array<ArrayBuffer> = []
      const dataChannel = pc.createDataChannel(getLabel())
      dataChannel.onmessage = onMessage

      function onMessage({data}: { data: ArrayBuffer|string }) {
        if (typeof data == 'string') {
          if (data === 'NOT_FOUND') return reject('Peer do not have requested data')
          if (data !== 'END') return
          const blob = new Blob(dataParts)
          handleStreamEnd(blob)
          dataChannel.close()
          return resolve(blob)
        } else {
          dataParts.push(data)
        }
      }
    })

    function getLabel() {
      const { GET_BINARY: key } = AppEvents.DataChannel
      const data = { trackHash: meta.hash }
      return JSON.stringify({ key, data })
    }

    async function handleStreamEnd(data: Blob) {
      db.binaryData
        .add({ binary: await data.arrayBuffer(), hash: meta.hash })
        .then(() => addDataSeeder(meta.hash, userID))
        .catch(console.error)
    }
  }
}

/** We write our track request in channel label.
 * When another peer will receive onDataChannel event, them will try to parse
 * data channel's label, and if it happen to be a stream request, them will
 * handle it. */
export async function requestTrackStream(meta: IBinaryMetadata): Promise<string> {
  const mediaSource = new MediaSource()
  const { hash: trackHash, seeders } = meta

  // Check is track is on host. If not, stream from someone.
  getSourceBuffer()
    .then(initStream)
    .catch(console.error)

  return URL.createObjectURL(mediaSource)

  async function initStream(buffer: SourceBuffer) {
    try {
      await initLocalStream(buffer)
      console.info('Track found locally')
    } catch ({ message }) {
      await initRemoteStream(buffer)
      console.warn(message)
      console.info('Track found remotely')
    }
  }

  async function initLocalStream(buffer: SourceBuffer) {
    return db.binaryData
      .filter(({ hash }) => hash === trackHash)
      .last()
      .then(onFulfilled)

    function onFulfilled(track: IBinaryData | undefined) {
      if (track) {
        buffer.appendBuffer(track.binary)
        assurePeerIsSeeder()
      } else throw new Error('Track not found locally')
    }

    function assurePeerIsSeeder() {
      db.binaryMetadata.filter(({ hash }) => hash === meta.hash)
        .first().then(exist => {
        if (!exist) db.binaryMetadata.add(meta)
      })
    }
  }

  function initRemoteStream(buffer: SourceBuffer) {
    const { pc, peerID } = pcs.find(({peerID, pc}) => seeders.some(userToken => userToken === peerID && pc.connectionState === 'connected')) || {}
    if (!pc) throw new Error('No peer streaming this track is reachable')
    console.debug("Streaming from", peerID)
    const trackParts: Array<ArrayBuffer> = []
    const dataChannel = pc.createDataChannel(getLabel())
    dataChannel.onmessage = onMessage

    function onMessage({data}: { data: ArrayBuffer|string }) {
      if (typeof data == 'string') {
        if (data !== 'END') return
        handleStreamEnd(trackParts)
        dataChannel.close()
      } else {
        trackParts.push(data)
        buffer.appendBuffer(data)
      }
    }
  }

  async function handleStreamEnd(trackParts: Array<ArrayBuffer>) {
    const blob = new Blob(trackParts)

    db.binaryData
      .add({ binary: await blob.arrayBuffer(), hash: trackHash })
      .then(() => addDataSeeder(trackHash, userID))
      .catch(console.error)
  }

  function getLabel() {
    const { GET_BINARY: key } = AppEvents.DataChannel
    const data = { trackHash }
    return JSON.stringify({ key, data })
  }

  function getSourceBuffer(): Promise<SourceBuffer> {
    return new Promise<SourceBuffer>(executor)

    function executor(resolved: (value: SourceBuffer) => void, rejected: (value: unknown) => void) {
      mediaSource.onsourceopen = onSourceOpen

      function onSourceOpen () {
        // TODO: Move to settings, constants or smth
        const buffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"')
        resolved(buffer)
      }
    }
  }
}

function onDataChannelMessage({data: message}: { data: string }) {
  try {
    const {key, data} = JSON.parse(message)
    if (key === 'library')
      dispatchDataChannelLibrary({key, data})
    else if (key === 'PING')
      console.log('PING')
    else {
      console.warn('Undefined message:', data)
    }
  } catch (e) {
    console.warn('Invalid message from data channel')
  }
}

function onDataChannel({ channel }: RTCDataChannelEvent) {
  try {
    const { key, data } = JSON.parse(channel.label)
    const { trackHash } = data
    if (key !== AppEvents.DataChannel.GET_BINARY) return

    streamRequestedTrack(trackHash, channel)
  } catch (_) {}
}

function streamRequestedTrack(trackHash: string, dataChannel: RTCDataChannel) {
  // TODO: Refactor this
  db.binaryData
    .filter(({ hash }) => hash === trackHash)
    .toArray()
    .then(onFulfilled)
    .catch(console.error)

  function onFulfilled(binaries: Array<IBinaryData>) {
    const { binary } = binaries.pop() || {}
    if (!binary) throw new Error('Track not found')
    const { byteLength } = binary
    let sentDataAmount = 250000

    if (!binary) throw new Error('Track not found')
    dataChannel.send(binary.slice(0, 250000))
    dataChannel.onbufferedamountlow = onBufferedAmountLow

    function onBufferedAmountLow() {
      if (!binary) throw new Error('Track not found')
      dataChannel.send(binary.slice(sentDataAmount, sentDataAmount += 250000 ))
      if (sentDataAmount >= byteLength) {
        dataChannel.onbufferedamountlow = null
        dataChannel.send('END')
      }
    }
  }
}

export function pingPeer(peerID: string) {
  const connection = pcs.find(({peerID: id}) => id === peerID)
  if (!connection) throw new Error('Peer not found')

  const message = JSON.stringify({key: 'PING', value: ''})

  connection.dataChannel?.send(message)
}

function addPeerConnection(pc: PeerConnection) {
  pcs.push(pc)
  dispatchPcsChange()
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
  const dataChannel = pc.createDataChannel('main', {id: 1, negotiated: true})

  pc.onconnectionstatechange = getConnectionEndHandler(connectionID, pc)
  // pc.onicegatheringstatechange = console.log
  pc.onicecandidate = onICECandidate
  pc.ondatachannel = onDataChannel
  dataChannel.onmessage = onDataChannelMessage
  dataChannel.onopen = dispatchDataChannelOpen

  addPeerConnection({id: connectionID, pc, peerID: '', dataChannel})

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  if (pc.localDescription === null) throw new Error('Offer not created')
  return {id: connectionID, offer: pc.localDescription}

  function onICECandidate ({candidate}: RTCPeerConnectionIceEvent) {
    // console.log(candidate)
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
  const dataChannel = pc.createDataChannel('main', {id: 1, negotiated: true})
  dataChannel.onmessage = onDataChannelMessage
  dataChannel.onopen = dispatchDataChannelOpen

  pc.onconnectionstatechange = getConnectionEndHandler(connectionID, pc)
  pc.ondatachannel = onDataChannel
  // pc.onicegatheringstatechange = console.log
  pc.onicecandidate = onIceCandidate

  addPeerConnection({id: connectionID, pc, peerID: offerer, dataChannel})
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