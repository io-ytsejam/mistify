import MainDB, {IAlbum, IArtist, ITrack} from "../MainDB";
import {requestBinaryData} from "../RTC";
import Album from "../Library/Album";

export async function getBinaryFileHash(binary: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('sha-256', binary)

  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getTextHash(text: string): Promise<string> {
  const textEncoder = new TextEncoder()
  return await getBinaryFileHash(textEncoder.encode(text))
}

export async function getArtistPictureURL(artist: IArtist): Promise<string> {
  const db = new MainDB()
  const binaryMetadata = await db.getArtistPicture(artist)

  if (!binaryMetadata) return ''
  try {
    return URL.createObjectURL(await requestBinaryData(binaryMetadata))
  } catch (e) {
    console.warn(e)
    return ''
  }
}

export async function getAlbumArtworkURL(album: IAlbum): Promise<string> {
  const db = new MainDB()
  const binaryMetadata = await db.getAlbumArtwork(album)

  if (!binaryMetadata) return ''
  try {
    return URL.createObjectURL(await requestBinaryData(binaryMetadata))
  } catch (e) {
    console.warn(e)
    return ''
  }
}

/** Use IArtist for DB CRUD operations, and Artist for any other use case */
export async function mapIArtistsOnArtists(iArtists: IArtist[]): Promise<Artist[]> {
  return await Promise.all(iArtists.map(async iArtist => ({
    ...iArtist,
    picture: await getArtistPictureURL(iArtist),
    link: getLinkURL(iArtist.link|| ''),
    albums: await mapIAlbumOnAlbums(iArtist.albums)
  })))
}

function getLinkURL(link: string) {
  try {
    return new URL(link)
  } catch (_) {}
}

export async function mapIAlbumOnAlbums(iAlbums: IAlbum[]): Promise<Album[]> {
  return Promise.all(iAlbums.map(async iAlbum => ({
    ...iAlbum,
    type: iAlbum.type as AlbumType,
    releaseDate: parseDate(iAlbum.releaseDate),
    tracks: await mapITracksOnTracks(iAlbum.tracks),
    artwork: await getAlbumArtworkURL(iAlbum)
  }) as Album))
}

async function mapITracksOnTracks(iTracks: ITrack[]): Promise<Track[]> {
  const db = new MainDB()
  const meta = await db.binaryMetadata.toArray()

  return iTracks.map(track => ({ ...track, seeders: meta.find(({ hash }) => hash === track.hash)?.seeders || [] }))
}

/** Convert YYYY.MM.DD to DD-MM-YYYY */
function parseDate(date: string): Date {
  return new Date(Date.parse(date.split('.').reverse().join('-')))
}

export function convertMsToMnsAndSecs(ms: number) {
  const date = new Date('01.01.1970 00:00')
  date.setSeconds(ms)
  const seconds = date.getSeconds().toString()
  return `${date.getMinutes()}:${seconds.length === 1 ? '0' + seconds : seconds}`
}