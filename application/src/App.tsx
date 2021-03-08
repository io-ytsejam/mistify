import React, {useEffect, useState} from 'react';
import Button from "./Button";
import {jss} from "react-jss";
import defaultUnit from 'jss-plugin-default-unit'
import SlidablePanel from './SlidablePanel'
import Connection from "./Connection/view";
import {onConnect} from "./Connection";
import Player from "./Player";
import UploadMusic from "./UploadMusic";

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

  jss.createStyleSheet(styles).attach()
  jss.use(defaultUnit(options))

  return <div
    style={{
      background: 'linear-gradient(0deg, #232323, #232323)',
      height: '100vh',
      boxSizing: 'border-box'
    }}
  >
    {/*<Connection />*/}
    <UploadMusic />
    <SlidablePanel>
      <p style={{
        margin: '3rem 0',
        textAlign: 'center',
        fontSize: '12px',
        textShadow: '0px 0px 18px 5px rgba(0, 0, 0, 1)'
      }}>Free the music, free you feelings.<br />
        Or some other bullshit</p>
      <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-around'
      }}>
        <Button>Become a member</Button>
        <Button variant='second'>Become a member</Button>
      </div>
    </SlidablePanel>
  </div>
}

export default App;
