import Dexie from "dexie";
import {v4 as uuid} from "uuid";
import {getBinaryFileHash} from "../lib";

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
  addProcessedMusic: (filesProcessing: Array<FileProcessing>, upload: Upload) => Promise<void>

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
      if (!pictureHash) return
      return this.binaryMetadata.where('hash').equals(pictureHash).first()
    }
    this.getAlbumArtwork = async function ({ artworkHash }: IAlbum) {
      if (!artworkHash) return
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
    this.addProcessedMusic = async function (filesProcessing: Array<FileProcessing>, upload: Upload) {
      const userID = localStorage.getItem('id') || ''
      const { album, artist } = upload
      const db = new MainDB()

      const { albums: artistExistingAlbums } = await db.artists
        .where(["owner", "name"])
        .equals([artist.owner, artist.name])
        .last()
        .catch(console.error) || { albums: [] }

      const audioBinaryTracks: Array<IBinaryData> = filesProcessing.map(({webMFile, hash}) => ({
        binary: webMFile as ArrayBuffer, hash
      }))

      const tracks: Array<ITrack> = filesProcessing.map(({hash, name, duration}) => ({
        name, hash, length: duration, id: uuid()
      }))

      const metaTracks: Array<IBinaryMetadata> = filesProcessing.map(({hash, name, duration}) => ({
        hash, seeders: [userID]
      }))

      let pictureHash = ''
      let artworkHash = ''
      let picture: ArrayBuffer|undefined
      let artwork: ArrayBuffer|undefined
      const pictures: Array<IBinaryData> = []

      if (artist.picture) {
        picture = await getArtistPicture(artist.picture)
        pictureHash = await getBinaryFileHash(picture)

        pictures.push({ binary: picture, hash: pictureHash })
      }

      if (album.artwork) {
        artwork = await getArtistPicture(album.artwork);
        artworkHash = await getBinaryFileHash(artwork);

        pictures.push({ binary: artwork, hash: artworkHash })
      }

      const newAlbum: IAlbum = {
        name: album.name,
        type: album.type,
        tracks,
        releaseDate: album.releaseDate.toLocaleDateString(),
        artworkHash
      }

      const newArtist: IArtist = {
        albums: [...artistExistingAlbums, newAlbum],
        ended: artist.ended,
        genre: artist.genre,
        name: artist.name,
        origin: artist.origin,
        started: artist.started,
        owner: userID,
        link: artist.link?.toString(),
        pictureHash
      }

      const binaryMetadata: Array<IBinaryMetadata> = [
        ...pictures.map(({ hash }) => ({ hash, seeders: [userID] })),
        ...metaTracks
      ]

      db.binaryMetadata.bulkAdd(binaryMetadata).then(res => {
        console.log(`%c Metadata added successfully`, 'color: green')
      }).catch(err => {
        console.log(`%c ${err}`, 'color: red')
      })

      db.binaryData.bulkAdd(audioBinaryTracks).then(res => {
        console.log(`%c Binary tracks added successfully`, 'color: green')
      }).catch(err => {
        console.log(`%c ${err}`, 'color: red')
      })

      db.binaryData.bulkAdd(pictures).then(res => {
        console.log(`%c Pictures added successfully`, 'color: green')
      }).catch(err => {
        console.log(`%c ${err}`, 'color: red')
      })

      db.artists
        .where(["owner", "name"])
        .equals([artist.owner, artist.name])
        .delete()
        .finally(() => {
          db.artists.add(newArtist)
            .then(() => console.log(`%c Artist/album added successfully`, 'color: green'))
            .catch(err => console.log(`%c ${err}`, 'color: red'))
        })

      async function getArtistPicture(URL: string) {
        const response = await fetch(URL)
        return await response.arrayBuffer()
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