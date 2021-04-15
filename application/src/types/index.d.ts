type FileProcessing = {
  name: string
  duration: number
  mp3File: ArrayBuffer|null

  processingInProgress: boolean
  processingSuccessful: boolean
  processingFailure: Error|undefined
  musicGroup: MusicGroup|null
}

type Artist = {
  name: string
  genre: string
  origin: string
  started: number
  ended?: number
  picture?: ArrayBuffer
  link?: URL
}

type Album = {
  name: string
  type: 'lp'|'ep'|'single'
  releaseDate: Date
  picture?: ArrayBuffer
}

type Track = {
  binary?: ArrayBuffer
  name: string
  duration: number
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