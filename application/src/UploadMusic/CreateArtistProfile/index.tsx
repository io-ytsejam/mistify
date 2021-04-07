import {createUseStyles, Styles} from "react-jss";
import theme from "../../Theme";
import React, {useState} from "react";
import {artistPic} from "../../ArtistPanel";
import Button from "../../Button";
import Input from "../../Input";

export default function CreateArtistProfile () {
  const {container, viewHeader, viewHeaderDesc,
    artistPicUpload, artistPic, loadPicButton, inputsWrapper} = createUseStyles(styles)()

  const [started, setStarted] = useState(1850)
  const [ended, setEnded] = useState((new Date()).getFullYear())

  return <div className={container}>
    <div className={viewHeader}>
      <p>CREATE NEW ARTIST PROFILE</p>
    </div>
    <div className={viewHeaderDesc}>
      <p>Just some info about new artistic persona. You can also add link to your social media account.</p>
    </div>
    <div className={artistPicUpload}>
      <div className={artistPic}>
        <img src="xd.jpeg" alt="Artist picture"/>
      </div>
      <Button className={loadPicButton} size='s'>LOAD PICTURE</Button>
    </div>
    <div className={inputsWrapper}>
      <Input placeholder='Artist name' />
      <Input placeholder='Genre' />
      <Input placeholder='Origin' />
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Input min={1850} type='number' style={{ width: 'calc(50% - .5rem)' }} placeholder='Started' />
        <Input min={(new Date()).getFullYear()} style={{ width: 'calc(50% - .5rem)' }} placeholder='Ended' />
      </div>
      <Input placeholder='Social media link' />
    </div>
  </div>
}

const styles: Styles = {
  '@keyframes container-enter': {
    from: { transform: 'translateX(-25%)' },
    to: { transform: 'translateX(0)' },
  },
  container: {
    marginTop: '.5rem',
    display: 'grid',
    gridRowGap: '1rem',
    gridColumnGap: '1rem',
    animation: '.2s ease-in',
    animationName: '$container-enter'
  },
  viewHeader: {
    color: theme.colors.primary,
    fontWeight: 600
  },
  viewHeaderDesc: {
    fontSize: '.625rem'
  },
  artistPic,
  artistPicUpload: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  loadPicButton: {},
  inputsWrapper: {
    display: 'grid',
    gridRowGap: '1rem',
    '& input': {
      textAlign: 'center'
    }
  }
}