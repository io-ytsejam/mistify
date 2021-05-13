import MainDB, {IAlbum, IArtist, IBinaryMetadata, ITrack} from "../MainDB";
import {broadCastMessage} from "../RTC";
import {dispatchDBChange, observeApp} from "../Observe";
import {getTextHash} from "../lib";

const db = new MainDB()

/** Send library to all peers. Be aware that library consists
 *  only information about music, not binary tracks */
export async function propagateLibrary() {
  getLibraryPropagationData()
    .then(broadCastMessage)
    .catch(onRejected)

  function onRejected({ message }: any) {
    console.warn('Cannot propagate library:', message)
  }
}

async function getLibraryPropagationData(): Promise<string> {
  return Promise.all([
    await db.artists.toArray(),
    await db.binaryMetadata.toArray()
  ]).then(handleDBResult)
    .catch(err => err)

  async function handleDBResult([artists, meta]: [Array<IArtist>, Array<IBinaryMetadata>]): Promise<string> {
    const library = { artists, meta }
    return JSON.stringify({
      key: 'library',
      data: {
        ...library,
        hash: await getTextHash(JSON.stringify(library))
      }
    })
  }
}


/** Check if some new music came from peer and save it to DB. */
export function handleReceivedLibrary({detail: receivedLibrary}: CustomEvent) {
  const { artists, meta, hash: receivedLibraryHash } = receivedLibrary

  console.info('Received library')
  getLibraryPropagationData()
    .then(putNewLibraryData)

  function putNewLibraryData(libraryPropagationData: string) {
    const { hash: localLibraryHash } = JSON.parse(libraryPropagationData).data

    if (localLibraryHash === receivedLibraryHash) {
      return console.info('No changes from received library')
    }

    console.log(receivedLibrary)

    libraryTransaction()
  }

  function executeMetaTransaction() {
    db.binaryMetadata.bulkPut(meta)
  }

  function executeArtistsTransaction() {
    db.artists.bulkPut(artists)
  }

  function onFulfilled() {
    console.log('put_received_library')
    dispatchDBChange()
  }

  function onRejected(e: any) {
    console.error('put_received_library', {e})
  }

  function libraryTransaction() {
    db.transaction("rw", db.artists, executeArtistsTransaction)
      .then(onFulfilled).catch(onRejected)
    db.transaction("rw", db.binaryMetadata, executeMetaTransaction)
      .then(onFulfilled).catch(onRejected)
  }
}

export async function addDataSeeder(dataHash: string, seeder: string) {
  const data = await db.binaryMetadata.filter(({ hash }) => hash === dataHash).last()

  if (!data) return

  const updatedData = {
    ...data,
    seeders: [...data.seeders, seeder]
  }

  db.binaryMetadata.put(updatedData).then(onFulfilled).catch(console.error)

  function onFulfilled(value: string) {
    console.log(value)
    propagateLibrary()
  }
}