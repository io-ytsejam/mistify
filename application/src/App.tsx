import React, {useCallback, useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";


import {createUseStyles, jss} from "react-jss";
import defaultUnit from 'jss-plugin-default-unit'
import Connection from "./Connection/view";
import Player from "./Player";
import theme from "./Theme";
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';
import LibraryMusicOutlinedIcon from '@material-ui/icons/LibraryMusicOutlined';
import WifiTetheringOutlinedIcon from '@material-ui/icons/WifiTetheringOutlined';
import Library from "./Library";
import Upload from "./UploadMusic/Upload";
import {v4 as uuid} from "uuid";

const PlayerContext = React.createContext<PlayerContextType|undefined>(undefined)

export { PlayerContext }

export default function App() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>({ URL: '', isPanelExtended: false, queue: [] })
  useEffect(function () {
    const peerID = localStorage.getItem('id')
    if (!peerID) {
      alert('Peer ID not found, generating new one...')

      localStorage.setItem('id', uuid())
    }
  }, [])

  const {navbar, navbarButton} = useStyles()

  jss.createStyleSheet(styles).attach()
  jss.use(defaultUnit(options))

  return <PlayerContext.Provider value={{ state: nowPlaying, setState: useCallback(function (state) {
    if (typeof state === 'function') {
      const setState = state as ((state: NowPlaying) => NowPlaying)
      setNowPlaying(setState(nowPlaying))
    } else {
      setNowPlaying(state as NowPlaying)
    }
    }, [nowPlaying])}}>
    <Router>
      <div
        style={{
          backgroundColor: theme.colors.secondary,
          height: '100vh',
          boxSizing: 'border-box',
          overflowY: 'scroll',
          paddingBottom: '5.5rem'
        }}
      >

        <Switch>
          <Route exact path='/'>
            <Redirect to='/library' />
          </Route>
          <Route path='/network'>
            <Connection />
          </Route>
          <Route path='/library'>
            <Library />
          </Route>
          <Route path='/upload'>
            <Upload />
          </Route>
        </Switch>
        <Player />
        <div className={navbar}>
          <Link replace to='/upload'>
            <div className={navbarButton}>
              <BackupOutlinedIcon />
              <p>Upload</p>
            </div>
          </Link>
          <Link replace to='/library'>
            <div className={navbarButton}>
              <LibraryMusicOutlinedIcon />
              <p>Library</p>
            </div>
          </Link>
          <Link replace to='/network'>
            <div className={navbarButton}>
              <WifiTetheringOutlinedIcon />
              <p>Network</p>
            </div>
          </Link>
        </div>
      </div>
    </Router>
  </PlayerContext.Provider>
}

const styles = {
  '@global': {
    body: {
      color: 'white',
      overscrollBehavior: 'none'
    },
    a: {
      color: 'white'
    },
    '*': {
      margin: 0,
      fontFamily: 'Montserrat',
      boxSizing: 'border-box'
    }
  }
}

const options = {
  fontSize: 'rem',
  borderRadius: 'rem',
  width: 'rem',
  height: 'rem',
  padding: 'rem',
  margin: 'rem'
}

const useStyles = createUseStyles({
  navbar: {
    zIndex: 2324232,
    width: '100%',
    height: '3rem',
    position: 'fixed',
    bottom: '0',
    backgroundColor: theme.colors.secondaryLight,
    borderTop: '1px solid white',
    display: 'flex',
    justifyContent: 'space-around',
    '& a': {
      textDecoration: "none"
    },
  },
  navbarButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    height: '100%',
    cursor: 'pointer',
    userSelect: 'none',
    '& p': {
      fontSize: '.75rem'
    },
    transition: 'filter .4s ease',
    '&:hover': {
      filter: 'brightness(.5)'
    },
    '&:active': {
      filter: 'brightness(.8)'
    }
  }
})