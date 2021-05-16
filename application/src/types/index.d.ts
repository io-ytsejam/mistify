type FileProcessing = {
  name: string
  duration: number
  mp3File: ArrayBuffer|null
  webMFile: ArrayBuffer|null
  hash: string

  processingInProgress: boolean
  processingSuccessful: boolean
  processingFailure: Error|undefined
}

type Artist = {
  name: string
  genre: string
  origin: string
  started: number
  ended?: number
  picture?: string
  link?: URL
  owner: string
  albums?: Album[]
}

type AlbumType = 'lp'|'ep'|'single'

type Album = {
  name: string
  type: AlbumType
  releaseDate: Date
  artwork: string
  tracks?: Array<Track>
}

type Track = {
  hash: string
  name: string
  length: number
  seeders: Array<string>
}

type Upload = {
  artist: Artist
  album: Album
  filesProcessing?: Array<FileProcessing>
  validation: {
    artist: {
      name: boolean
      genre: boolean
      origin: boolean
      started: boolean
    }
  }
}

type TrackUploadProps = {
  index: number
  fileProcessing: FileProcessing
  setFileProcessing: (fileProcessing: FileProcessing) => void
}

interface MusicGroup {
  owner: string
  artist: string
  groupType: 'LP'|'EP'|'Single'
  groupName: string
  id: string
  tracks: Array<{ webM: ArrayBuffer, hash: string }>
}

type UploadContextType = {
  state: Upload
  setState: (state: Upload|((state: Upload) => Upload)) => void
}

type Playable = {
  track?: Track
  album?: Album
  artist?: Artist
  active: boolean
}

type PlayerQueue = Array<Playable>

type NowPlaying = {
  URL: string
  queue: PlayerQueue
  track?: Track
  album?: Album
  artist?: Artist
  artworkColor?: string
  isPanelExtended: boolean
}

type PlayerContextType = {
  state: NowPlaying
  setState: (state: NowPlaying|((state: NowPlaying) => NowPlaying)) => void,
}

interface PeerConnection {
  pc: RTCPeerConnection
  id: string
  peerID: string,
  dataChannel?: RTCDataChannel
}

interface TrackStream {
  mediaSource: MediaSource
  buffer: SourceBuffer
}