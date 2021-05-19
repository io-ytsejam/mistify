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
    LIBRARY_UPDATED: 'libraryUpdated',
    GET_CONNECTIONS: 'getConnections',
    REDIRECT_OFFER: 'redirectOffer',
    MEMBERS_UPDATE: 'membersUpdate'
  }
}

export function dispatchPcsChange() {
  observeApp.dispatchEvent(new Event(AppEvents.CHANGE))
}

export function dispatchDataChannelOpen(this: RTCDataChannel) {
  observeApp.dispatchEvent(new CustomEvent(AppEvents.DATA_CHANNEL_OPEN, { detail: this }))
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

export function dispatchGetConnectionsList(dc: RTCDataChannel) {
  observeApp.dispatchEvent(new CustomEvent(AppEvents.DataChannel.GET_CONNECTIONS, { detail: dc }))
}

export function dispatchRedirectOffer(dc: RTCDataChannel, data: string/*offerWithID: { offer: RTCSessionDescription, id: string }*/) {
  observeApp.dispatchEvent(new CustomEvent(AppEvents.DataChannel.REDIRECT_OFFER, { detail: data }))
}

export function dispatchMembersUpdate() {
  observeApp.dispatchEvent(new Event(AppEvents.DataChannel.MEMBERS_UPDATE))
}