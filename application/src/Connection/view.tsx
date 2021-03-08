import {useEffect, useState} from "react";
import {connectWithPeer, onConnect} from "./index";
import Button from "../Button";

export default function Connection () {
  const [peers, setPeers] = useState<Array<string>>([])

  useEffect(() => {
    onConnect(onMembersUpdate)
  }, [])

  function onMembersUpdate(peers: Array<string>) {
    setPeers([...peers])
  }

  const id = sessionStorage.getItem('id')

  return <div>
    <p>Connected peers:</p>

    <ul style={{fontSize: '.75rem'}}>
      {peers.map(peer => <div key={peer}>
        {
          id !== peer && <Button
            size='s'
            onClick={() => {
              connectWithPeer(peer)
            }}
          >Connect</Button>
        }
        {peer}
      </div>)}
    </ul>
  </div>
}