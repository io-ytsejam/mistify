import Dexie from "dexie";

const userID = localStorage.getItem('id') || ''

export default class MainDB extends Dexie {
  artists: Dexie.Table<IArtist, string>
  binaryData: Dexie.Table<IBinaryData, string>
  binaryMetadata: Dexie.Table<IBinaryMetadata, string>
  getArtistPicture: (artist: IArtist) => Promise<IBinaryMetadata|undefined>
  getAlbumArtwork: (album: IAlbum) => Promise<IBinaryMetadata|undefined>
  getOwnArtistsCount: () => Promise<number>
  getArtistsCount: () => Promise<number>
  removeSeederForGivenData: (dataHash: string, seeder: string) => Promise<void>

  constructor () {
    super("MainDB");
    this.version(6).stores({
      artists: "[owner+name]",
      binaryData: '&hash',
      binaryMetadata: '&hash'
    });

    this.artists = this.table("artists");
    this.binaryData = this.table("binaryData")
    this.binaryMetadata = this.table("binaryMetadata")

    this.getArtistPicture = async function ({ pictureHash }: IArtist) {
      return this.binaryMetadata.where('hash').equals(pictureHash).first()
    }
    this.getAlbumArtwork = async function ({ artworkHash }: IAlbum) {
      return this.binaryMetadata.where('hash').equals(artworkHash).first()
    }
    this.getOwnArtistsCount = async function() {
      return this.artists.filter(({ owner }) => owner === userID).count()
    }
    this.getArtistsCount = async function() {
      return this.artists.count()
    }
    this.removeSeederForGivenData = async function (dataHash, seederToRemove = userID) {
      const meta = await this.binaryMetadata
        .where("hash")
        .equals(dataHash).first()

      if (meta?.seeders.some(seeder => seeder === seederToRemove)) {
        this.binaryMetadata
          .update(dataHash, {
            ...meta,
            seeders: [...meta?.seeders.filter(hash => hash !== seederToRemove)]
          } as IBinaryMetadata).then(res => {
        })
      }
    }
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
  albums: Array<IAlbum>
  pictureHash: string
}

export interface IAlbum {
  name: string
  type: string
  releaseDate: string
  tracks: Array<ITrack>
  artworkHash: string
}

export interface ITrack {
  name: string
  length: number
  hash: string
}

export interface IBinaryMetadata {
  hash: string
  seeders: Array<string>
}

export interface IBinaryData {
  hash: string
  binary: ArrayBuffer
}