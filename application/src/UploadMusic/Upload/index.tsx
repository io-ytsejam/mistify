import {createUseStyles, Styles} from "react-jss";
import React, {useEffect, useState} from "react";
import Button from "../../Button";
import TopBar from "../../TopBar";
import ChooseArtist from "../ChooseArtist";
import CreateArtistProfile from "../CreateArtistProfile";
import {Redirect, Route, Switch, useHistory} from "react-router-dom";
import UploadDetails from "../UploadDetails";
import AddTracks from "../AddTracks";
import Summary from "../Summary";
import queueProcessing from "../prepareWebM";
import MainDB, {IAlbum, IArtist, IBinaryData, IBinaryMetadata, ITrack} from "../../MainDB";
import {getBinaryFileHash} from "../../lib";
import Popup from "../../Popup";
import ProcessingInProgress from "../ProcessingInProgress";

/**
 * Handle whole logic regarding
 * collecting music info, processing, and saving into DB
 * */


const contextValue: Upload = {
  artist: {
    name: '',
    origin: '',
    genre: '',
    started: 1900,
    owner: localStorage.getItem('id') || ''
  },
  album: {
    name: '',
    type: 'lp',
    releaseDate: new Date(),
    artwork: ''
  },
  validation: {
    artist: {
      name: false,
      started: false,
      genre: false,
      origin: false
    },
    album: {
      name: false,
      type: true, // Default dropdown value
      releaseDate: true // Today date is default
    }
  }
}

const UploadContext = React.createContext<UploadContextType|undefined>(undefined)

export { UploadContext }

export default function Upload() {
  const styles: Styles = {
    container: {
      padding: '0 1rem'
    }
  }

  const history = useHistory()
  const [uploadState, setUploadState] = useState(contextValue)
  const [validationState, setValidationState] = useState<string>()
  const [pathname, setPathname] = useState(history.location.pathname)
  const [processingInProgress, setProcessingInProgress] = useState(false)
  const [processingEnded, setProcessingEnded] = useState(false)
  const { filesProcessing } = uploadState
  const { container } = createUseStyles(styles)()

  history.listen(({ pathname }) => {
    setPathname(pathname)
  })

  useEffect(handleProcessing, [filesProcessing, processingInProgress])

  function handleProcessing () {
    if (processingInProgress && filesProcessing?.every(({processingSuccessful}) => processingSuccessful)) {
      const db = new MainDB()

      db.addProcessedMusic(filesProcessing, uploadState)
        .then(() => setProcessingEnded(true))
      return setProcessingInProgress(false)
    }
    if (processingInProgress) return
    if (!filesProcessing?.length || filesProcessing?.some(({processingInProgress}) => !processingInProgress)) return;

    startProcessing()
    setProcessingInProgress(true)
  }

  function isAlbumValid() {
    return Object.entries(uploadState.validation.album).every(([_, v]) => v)
  }

  function isArtistValid() {
    return Object.entries(uploadState.validation.artist).every(([_, v]) => v)
  }

  function areTracksValid() {
    if (!filesProcessing) return false
    return Object.entries(filesProcessing).every(([_, fp]) => fp.mp3File && fp.name)
  }

  return <UploadContext.Provider value={{ state: uploadState, setState (state) {
      if (typeof state === 'function') {
        const setState = state as ((state: Upload) => Upload)
        setUploadState(setState(uploadState))
      } else {
        setUploadState(state as Upload)
      }
    } }}>
    {processingEnded && <Popup
        okAction={() => {
          setProcessingEnded(false)
          history.push('/library')
        }}
        message='Processing ended. If everything went well,
         your music should be visible in library'
    />
    }
    {validationState &&
      <Popup
        okAction={() => setValidationState(undefined)}
        message={validationState}
      />
    }
    <TopBar
      title='Upload'
      buttons={ renderButtons(pathname) }
    />
    <div className={container}>
      {processingInProgress && filesProcessing
        ? <ProcessingInProgress filesProcessing={filesProcessing} /> : null}
      <Switch>
        <Route path='/upload/create-artist-profile'>
          <CreateArtistProfile />
        </Route>
        <Route path='/upload/details'>
          <UploadDetails />
          {!isArtistValid() && <Redirect to='/upload' />}
        </Route>
        <Route path='/upload/add-tracks'>
          <AddTracks />
          {!isArtistValid() && <Redirect to='/upload' />}
          {!isAlbumValid() && <Redirect to='/upload' />}
        </Route>
        <Route path='/upload/summary'>
          <Summary />
          {!isArtistValid() && <Redirect to='/upload' />}
          {!isArtistValid() && <Redirect to='/upload' />}
          {!areTracksValid() && <Redirect to='/upload' />}
        </Route>
        <Route path='/'>
          <ChooseArtist/>
        </Route>
      </Switch>
    </div>
  </UploadContext.Provider>

  async function startProcessing() {
    const { filesProcessing } = uploadState

    if (!filesProcessing) return

    setUploadState(() => ({
      ...uploadState,
      filesProcessing: filesProcessing?.map(fp => ({...fp, processingInProgress: true}))
    }))

    await queueProcessing(0, filesProcessing, handleSuccess, handleFailure)

    async function handleSuccess(fileProcessing: FileProcessing, webM: ArrayBuffer) {
      const {mp3File} = fileProcessing

      const hash = await getBinaryFileHash(mp3File as ArrayBuffer)

      setUploadState(uploadState => ({
        ...uploadState,
        filesProcessing: uploadState.filesProcessing?.map(fileProcessing => {
          if (fileProcessing.mp3File !== mp3File) return fileProcessing
          else {
            return {
              ...fileProcessing,
              hash,
              webMFile: webM,
              processingSuccessful: true,
              processingInProgress: false
            }
          }
        })
      }))
    }

    function handleFailure(fileProcessing: FileProcessing, processingFailure: Error) {
      const {mp3File} = fileProcessing
      setUploadState(uploadState => ({
        ...uploadState,
        filesProcessing: uploadState.filesProcessing?.map(fp => fp.mp3File !== mp3File ? fp :
          {...fp, processingFailure, processingInProgress: false})
      }))
    }
  }

  function renderButtons(step: string): React.ReactNode {
    if (step.match('create-artist-profile')) return <>
      <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={history.goBack}
      >CHOOSE ARTIST</Button>
      <Button
        size='s'
        onClick={() => {
          const { artist } = uploadState.validation || {}
          if (!artist) return
          if (!isArtistValid()) {
            return setValidationState(
              `Fields ${!artist.name ? 'Artist name, ' : ''}
              ${!artist.genre ? 'Genre, ' : ''}
              ${!artist.origin ? 'Origin, ' : ''}
              ${!artist.started ? 'Started, ' : ''}`
                .replace(/..$/," ")
                .concat('cannot be empty')
            )
          }
          history.push('/upload/details')
        }}
      >DETAILS</Button>
    </>
    if (step.match('details')) return <>
      <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={history.goBack}
      >ADD ARTIST</Button>
      <Button
        size='s'
        onClick={() => {
          const { album } = uploadState.validation || {}
          if (!album) return
          if (!isAlbumValid()) {
            return setValidationState(
              `Fields ${!album.name ? 'Name, ' : ''}
              ${!album.type ? 'Album type, ' : ''}
              ${!album.releaseDate ? 'Release date, ' : ''}`
                .replace(/..$/," ")
                .concat('cannot be empty')
            )
          }
          history.push('/upload/add-tracks')
        }}
      >ADD TRACKS</Button>
    </>
    if (step.match('add-tracks')) return <>
      <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={history.goBack}
      >DETAILS</Button>
      <Button
        size='s'
        onClick={() => {
          if (!areTracksValid())
            return setValidationState('You need to add some MP3 files and name them')
          history.push('/upload/summary')
        }}
      >SUMMARY</Button>
    </>
    if (step.match('summary')) return <>
      <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={history.goBack}
      >ADD TRACKS</Button>
    </>
    return <>
      <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={() => history.replace('/')}
      >CANCEL</Button>
      <Button
        size='s'
        onClick={() => {
          history.push('/upload/create-artist-profile')
        }}
      >NEW ARTIST</Button>
    </>
  }
}

