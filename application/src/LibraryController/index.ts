import MainDB, { IArtist, IBinaryMetadata } from "../MainDB";
import { broadCastMessage } from "../RTC";
import {AppEvents, dispatchDBChange} from "../Observe";
import { getTextHash } from "../lib";
import lodash from 'lodash';
import deepEqual from "deep-equal";
import { diffJson } from 'diff'

// @ts-ignore
window.lodash = lodash

const db = new MainDB()
const userID = localStorage.getItem('id') || ''

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
      key: AppEvents.DataChannel.LIBRARY_UPDATED,
      data: {
        ...library,
        hash: await getTextHash(JSON.stringify(library))
      }
    })
  }
}


/** Check if some new music came from peer and save it to DB. */
export function handleReceivedLibrary({detail: receivedLibrary}: CustomEvent) {
  const { artists, meta, hash: receivedLibraryHash } = receivedLibrary as { meta: IBinaryMetadata[], artists: IArtist[], hash: string }

  console.info('Received library')
  getLibraryPropagationData()
    .then(putNewLibraryData)

  function putNewLibraryData(localLibrary: string) {
    const { hash: localLibraryHash } = JSON.parse(localLibrary).data

    if (localLibraryHash === receivedLibraryHash) {
      return console.info('No changes from received library')
    }

    console.info('Local DB will be updated')

    libraryTransaction()
  }

  function executeMetaTransaction() {
    db.binaryMetadata.toArray()
      .then(localMeta => {
        const hashes = lodash.uniq([...meta, ...localMeta].map(({ hash }) => hash))

        const toPut = hashes.map(hash => ({
          hash, seeders: lodash.uniq([
            ...meta.find(({ hash: h }) => h === hash)?.seeders || [],
            ...localMeta.find(({ hash: h }) => h === hash)?.seeders || [],
          ])
        }))

        db.binaryMetadata.bulkPut(toPut)
      })
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
  if (data.seeders.some(seeder => seeder === userID)) return

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

export async function removeDataSeeder(dataHash: string, seeder: string) {
  db.removeSeederForGivenData(dataHash, seeder).finally(onSeederIsNotPresent)

  function onSeederIsNotPresent() {
    const message = JSON.stringify({
      key: AppEvents.DataChannel.DELETE_SEEDER,
      data: { dataHash, seeder }
    })

    broadCastMessage(message)
  }
}

export function handleRemoveSeeder({ detail: meta }: CustomEvent) {
  const { dataHash, seeder } = meta

  db.removeSeederForGivenData(dataHash, seeder)
    .then(() => console.info('Updated data seeders'))
}