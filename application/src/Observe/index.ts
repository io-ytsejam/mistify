export {
  observeApp,
  AppEvents,
  dispatchPcsChange,
  dispatchDataChannelOpen,
  dispatchDataChannelLibrary,
  dispatchDBChange
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
    LIBRARY_UPDATED: 'libraryUpdated'
  }
}

function dispatchPcsChange() {
  observeApp.dispatchEvent(new Event(AppEvents.CHANGE))
}

function dispatchDataChannelOpen() {
  observeApp.dispatchEvent(new Event(AppEvents.DATA_CHANNEL_OPEN))
}

function dispatchDataChannelLibrary({ data }: { key: string, data: string }) {
  observeApp.dispatchEvent(new CustomEvent(AppEvents.DataChannel.RECEIVED_REMOTE_LIBRARY, { detail: data }))
}

function dispatchDBChange() {
  observeApp.dispatchEvent(new Event(AppEvents.DB_CHANGE))
}