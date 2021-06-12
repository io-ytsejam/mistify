import React, {useEffect, useState} from "react";
import {pcs, pingPeer} from "../RTC";
import {observeApp} from "../Observe";
import theme from "../Theme";
import {createUseStyles, Styles} from "react-jss";
import TopBar from "../TopBar";

export default function Connection () {
  const id = localStorage.getItem('id')

  // Store peer IDs in state, so we can re-render on every change
  const [activeConnections, setActiveConnections] = useState<Array<string>>([])

  const { viewHeaderDesc, viewHeader, container } = useStyles()

  useEffect(initialize, [])

  return <>
    <TopBar title='Network' />
    <div className={container}>
      <div className={viewHeader}>
        <p>You are: {id?.substr(0, 8)}</p>
      </div>
      <div className={viewHeaderDesc}>
        <p>Connected peers:</p>
      </div>

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
  </>

  function isPeerConnected(peer: string): boolean {
    return pcs.some(({ peerID }) => peerID === peer && peerID !== id)
  }

  function initialize() {
    handlePcsChange()
    observeApp.addEventListener('change', handlePcsChange)

    return function cleanup () {
      observeApp.removeEventListener('change', handlePcsChange)
    }

    function handlePcsChange() {
      setActiveConnections(pcs.map(({ peerID }) => peerID))
    }
  }
}

const styles: Styles = {
  viewHeader: {
    color: theme.colors.primary,
    fontWeight: 600,
    margin: '.5rem 0',
    textTransform: 'uppercase'
  },
  viewHeaderDesc: {
    fontSize: '.8125rem',
    margin: '.5rem 0'
  },
  container: {
    padding: '0 1rem'
  }
}

const useStyles = createUseStyles(styles)