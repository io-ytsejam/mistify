import Dexie from "dexie";

export default class MainDB extends Dexie {
  artists: Dexie.Table<IArtist, string>
  albums: Dexie.Table<IAlbum, string>
  tracks: Dexie.Table<ITracks, string>
  binaryTracks: Dexie.Table<ITrackBinary, string>

  constructor () {
    super("MainDB");
    this.version(2).stores({
      artists: "[userToken+name]",
      albums: "&id",
      tracks: "&hash",
      binaryTracks: "&hash"
    });

    this.artists = this.table("artists");
    this.albums = this.table("albums");
    this.tracks = this.table("tracks")
    this.binaryTracks = this.table("binaryTracks");
  }
}

export interface IArtist {
  id?: string
  name: string
  genre: string
  started: number
  ended?: number
  origin: string
  userToken: string
  link?: string
  picture?: string
  albums: Array<IAlbum>
}

export interface IAlbum {
  id?: string
  name: string
  type: string
  releaseDate: string
  artistID: string
  tracks: Array<ITracks>
}

export interface ITracks {
  id?: string
  name: string
  albumID: string
  length: number
  hash: string
}

// We don't need id key if we have hash. Also PK should be [hash]
export interface ITrackBinary {
  id?: string
  hash: string
  binary: ArrayBuffer
}