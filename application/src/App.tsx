import React, {useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


import {createUseStyles, jss} from "react-jss";
import defaultUnit from 'jss-plugin-default-unit'
import SlidablePanel from './SlidablePanel'
import Connection from "./Connection/view";
import {onConnect} from "./Connection";
import Player from "./Player";
import UploadMusic from "./UploadMusic";
import theme from "./Theme";
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';
import LibraryMusicOutlinedIcon from '@material-ui/icons/LibraryMusicOutlined';
import WifiTetheringOutlinedIcon from '@material-ui/icons/WifiTetheringOutlined';
import Library from "./Library";


// 6f2dec85-9293-4b6a-8936-9a3d9cbdd69c

function App() {
  const styles = {
    '@global': {
      '*': {
        margin: 0,
        fontFamily: 'Montserrat',
        color: 'white'
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

  const {navbar, navbarButton} = createUseStyles({
    navbar: {
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
  })()

  jss.createStyleSheet(styles).attach()
  jss.use(defaultUnit(options))

  return <Router>
    <div
      style={{
        backgroundColor: theme.colors.secondary,
        height: '100vh',
        boxSizing: 'border-box'
      }}
    >

      <Switch>
        <Route path='/network'>
          <Connection />
        </Route>
        <Route path='/library'>
          <Library />
        </Route>
        <Route path='/upload'>
          <UploadMusic />
        </Route>
      </Switch>
      <SlidablePanel>
        {/*<Player chunks={new Array<ArrayBuffer>()}/>*/}
      </SlidablePanel>
      <div className={navbar}>
        <Link to='/upload'>
          <div className={navbarButton}>
            <BackupOutlinedIcon />
            <p>Upload</p>
          </div>
        </Link>
        <Link to='/library'>
          <div className={navbarButton}>
            <LibraryMusicOutlinedIcon />
            <p>Library</p>
          </div>
        </Link>
        <Link to='/network'>
          <div className={navbarButton}>
            <WifiTetheringOutlinedIcon />
            <p>Network</p>
          </div>
        </Link>
      </div>
    </div>
  </Router>
}

export default App;
