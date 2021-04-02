interface FileProcessing {
  mp3File: ArrayBuffer|null
  processingInProgress: boolean
  processingSuccessful: boolean
  processingFailure: Error|undefined
  musicGroup: MusicGroup|null
}

interface MusicGroup {
  owner: string
  artist: string
  groupType: 'LP'|'EP'|'Single'
  groupName: string
  id: string
  tracks: Array<{ webM: ArrayBuffer, hash: string }>
}

export type {FileProcessing, MusicGroup}