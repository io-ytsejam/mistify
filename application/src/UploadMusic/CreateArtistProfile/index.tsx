import {createUseStyles, Styles} from "react-jss";
import theme from "../../Theme";
import React, {useContext, useState} from "react";
import {artistPic} from "../../ArtistPanel";
import Button from "../../Button";
import Input from "../../Input";
import {UploadContext} from "../Upload";

export default function CreateArtistProfile () {
  const {container, viewHeader, viewHeaderDesc,
    artistPicUpload, artistPic, loadPicButton, inputsWrapper} = createUseStyles(styles)()

  const uploadContextWithReducer = useContext(UploadContext)

  if (uploadContextWithReducer === undefined) throw new Error('Context must be provided')
  const { state: uploadState, setState: setUploadState } = uploadContextWithReducer

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
      <Input
        onChange={handleNameChange}
        onBlur={({target}) => setTimeout(() => target.reportValidity(), 500)}
        value={uploadState.artist.name}
        placeholder='Artist name'
        required
      />
      <Input
        onChange={handleGenreChange}
        onBlur={({target}) => target.reportValidity()}
        value={uploadState.artist.genre}
        placeholder='Genre'
        required
      />
      <Input
        placeholder='Origin'
        onChange={handleOriginChange}
        onBlur={({target}) => target.reportValidity()}
        value={uploadState.artist.origin}
        required
      />
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Input
          onChange={handleStartedChange}
          onBlur={({target}) => target.reportValidity()}
          value={uploadState.artist.started}
          min={1850}
          type='number'
          style={{ width: 'calc(50% - .5rem)' }} 
          placeholder='Started'
          required
        />
        <Input
          onChange={handleEndedChange}
          value={uploadState.artist.ended}
          type='number'
          min={1850}
          max={(new Date()).getFullYear()}
          style={{ width: 'calc(50% - .5rem)' }}
          placeholder='Ended'
        />
      </div>
      <Input placeholder='Social media link' onChange={handleSocialMediaLinkChange} />
    </div>
  </div>

  function handleNameChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      artist: {
        ...uploadState.artist,
        name: target.value
      },
      validation: {
        ...uploadState.validation,
        artist: {
          ...uploadState.validation.artist,
          name: target.checkValidity()
        }}
    })
  }

  function handleGenreChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      artist: {
        ...uploadState.artist,
        genre: target.value
      },
      validation: {
        ...uploadState.validation,
        artist: {
          ...uploadState.validation.artist,
          genre: target.checkValidity()
        }}
    })
  }

  function handleOriginChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      artist: {
        ...uploadState.artist,
        origin: target.value
      },
      validation: {
        ...uploadState.validation,
        artist: {
          ...uploadState.validation?.artist,
          origin: target.checkValidity()
        }}
    })
  }

  function handleStartedChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      artist: {
        ...uploadState.artist,
        started: parseInt(target.value)
      },
      validation: {
        ...uploadState.validation,
        artist: {
          ...uploadState.validation.artist,
          started: target.checkValidity()
        }}
    })
  }

  function handleEndedChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      artist: {
        ...uploadState.artist,
        ended: parseInt(target.value)
      }
    })
  }

  function handleSocialMediaLinkChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadState({
        ...uploadState,
        artist: {
          ...uploadState.artist,
          link: new URL(target.value)
        }
      })
    } catch (_) {}
  }
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
    fontWeight: 600,
    textTransform: 'uppercase'
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
      textAlign: 'center',
      fontWeight: 600
    }
  }
}