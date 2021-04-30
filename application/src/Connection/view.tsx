import {useEffect, useState} from "react";
import {pcs, observeConnections, pingPeer} from "../RTC";

export default function Connection () {
  const id = localStorage.getItem('id')

  // Store peer IDs in state, so we can re-render on every change
  const [activeConnections, setActiveConnections] = useState<Array<string>>([])

  useEffect(initialize, [])

  return <div>
    <h1>You are: {id?.substr(0, 8)}</h1>
    <p>Connected peers:</p>

    {activeConnections.map((peerID, i) => <div style={{ display: 'flex' }} key={i}>
      {id === peerID && '(you) '}
      <p
        onClick={() => pingPeer(peerID)}
        style={{
          color: isPeerConnected(peerID) ? 'green' : ''
      }}>
        {peerID?.substr(0, 8)}
      </p>
    </div>)}
  </div>

  function isPeerConnected(peer: string): boolean {
    return pcs.some(({ peerID }) => peerID === peer && peerID !== id)
  }

  function initialize() {
    handlePcsChange()
    observeConnections.addEventListener('change', handlePcsChange)

    return function cleanup () {
      observeConnections.removeEventListener('change', handlePcsChange)
    }

    function handlePcsChange() {
      setActiveConnections(pcs.map(({ peerID }) => peerID))
    }
  }
}