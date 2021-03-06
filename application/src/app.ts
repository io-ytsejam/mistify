import { v4 as uuid } from 'uuid';

const webSocket = new WebSocket('ws://localhost:8080');

let members = []
let rtcPeerConnections = []

export function onConnect() {
  webSocket.onopen = function () {
    join()

    webSocket.onmessage = function ({data}) {
      readTextMessage(data)
    }
  }
}

function join() {
  const id = uuid()

  localStorage.setItem('id', id)

  sendMessage('join', id)
}


function readTextMessage(message: string) {
  const { key, value } = JSON.parse(message)

  const myID = localStorage.getItem('id')

  if (key === 'networkMembers') {
    members = [...value]
    console.log(members)
    connectWithPeer(members.find(id => id !== myID))
  }

  if (key === 'connectWithPeer')
    console.log('HMMM: ', value)
}

function sendMessage(key: string, value: any) {
  const message = JSON.stringify({key, value})

  webSocket.send(message)
}


// @ts-ignore
window.connectWithPeer = connectWithPeer

export function connectWithPeer(id: string) {
  sendMessage("connectWithPeer", id)
}

