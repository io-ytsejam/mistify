export {
  observeApp,
  AppEvents,
}

const observeApp = new EventTarget()
const AppEvents = {
  CHANGE: 'change',
  DATA_CHANNEL_OPEN: 'dataChannelOpen',
  DB_CHANGE: 'dbChange',
  DataChannel: {
    RECEIVED_REMOTE_LIBRARY: 'receivedRemoteLibrary',
    GET_BINARY: 'getBinary',
    STREAM_REQUESTED_BINARY: 'streamRequestedBinary',
    DELETE_SEEDER: 'deleteSeeder',
    LIBRARY_UPDATED: 'libraryUpdated'
  }
}

export function dispatchPcsChange() {
  observeApp.dispatchEvent(new Event(AppEvents.CHANGE))
}

export function dispatchDataChannelOpen() {
  observeApp.dispatchEvent(new Event(AppEvents.DATA_CHANNEL_OPEN))
}

export function dispatchReceivedLibrary({ data }: { key: string, data: string }) {
  observeApp.dispatchEvent(new CustomEvent(AppEvents.DataChannel.RECEIVED_REMOTE_LIBRARY, { detail: data }))
}

export function dispatchDBChange() {
  observeApp.dispatchEvent(new Event(AppEvents.DB_CHANGE))
}

export function dispatchDeleteSeeder({ data }: { data: string }) {
  observeApp.dispatchEvent(new CustomEvent(AppEvents.DataChannel.DELETE_SEEDER, { detail: data }))
}