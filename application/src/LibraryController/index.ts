import MainDB, {IAlbum, IArtist} from "../MainDB";
import {broadCastMessage} from "../RTC";
import {dispatchDBChange, observeApp} from "../Observe";

const db = new MainDB()

/** Send library to all peers. Be aware that library consists
 *  only information about music, not binary tracks */
export function propagateLibrary() {
  db.artists.toArray()
    .then(handleDBResult)
    .catch(onRejected)

  function onRejected({ message }: any) {
    console.warn('Cannot propagate library:', message)
  }

  function handleDBResult(data: Array<IArtist>) {
    const message = JSON.stringify({ key: 'library', data })

    broadCastMessage(message)
  }
}


/** Check if some new music came from peer and save it to DB. */
export function handleReceivedLibrary({detail: receivedLibrary}: CustomEvent) {
  db.transaction("rw", db.artists, executeTransaction)
    .then(onFulfilled).catch(onRejected)

  function executeTransaction() {
    console.log(receivedLibrary)
    db.artists.bulkPut(receivedLibrary)
  }

  function onFulfilled() {
    console.log('put_received_library')
    dispatchDBChange()
  }

  function onRejected() {
    console.error('put_received_library')
  }
}

export async function addTrackBroadcaster(trackHash: string, broadcaster: string) {
  const library = await db.artists.toArray()

  const artist = library.find(({ albums }) => albums.some(({ tracks }) => tracks.some(({ hash }) => hash === trackHash)))
  const album = artist?.albums.find(({ tracks }) => tracks.some((({ hash }) => hash === trackHash)))
  const trackInfo = album?.tracks.find(({ hash }) => hash === trackHash)

  if (artist && album && trackInfo) {
    const updatedTrackInfo = {
      ...trackInfo,
      broadcasters: [
        ...trackInfo.broadcasters,
        broadcaster
      ]
    }

    const updatedAlbum: IAlbum = {
      ...album,
      tracks: [
        ...album.tracks.filter(({ hash }) => hash !== trackHash),
        updatedTrackInfo
      ]
    }

    const updatedArtist: IArtist = {
      ...artist,
      albums: [
        ...artist.albums.filter(album => !album.tracks.some(({ hash }) => hash !== trackHash)),
        updatedAlbum
      ]
    }

    db.artists.put(updatedArtist).then(onFulfilled).catch(console.error)
  }

  function onFulfilled(value: string) {
    console.log(value)
    propagateLibrary()
  }
}