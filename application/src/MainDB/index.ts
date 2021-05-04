import Dexie from "dexie";

export default class MainDB extends Dexie {
  artists: Dexie.Table<IArtist, string>
  binaryTracks: Dexie.Table<ITrackBinary, string>

  constructor () {
    super("MainDB");
    this.version(2).stores({
      artists: "[owner+name]",
      binaryTracks: "&hash"
    });

    this.artists = this.table("artists");
    this.binaryTracks = this.table("binaryTracks");
  }
}

export interface IArtist {
  name: string
  genre: string
  started: number
  ended?: number
  origin: string
  owner: string
  link?: string
  picture?: string
  albums: Array<IAlbum>
}

export interface IAlbum {
  name: string
  type: string
  releaseDate: string
  tracks: Array<ITracks>
}

export interface ITracks {
  name: string
  albumID: string
  length: number
  hash: string
  broadcasters: Array<string>
}

export interface ITrackBinary {
  hash: string
  binary: ArrayBuffer
}