import {createUseStyles, Styles} from "react-jss";
import React, {useEffect, useState} from "react";
import Button from "../../Button";
import TopBar from "../../TopBar";
import ChooseArtist from "../ChooseArtist";
import CreateArtistProfile from "../CreateArtistProfile";
import {Route, Switch, useHistory} from "react-router-dom";
import UploadDetails from "../UploadDetails";
import AddTracks from "../AddTracks";
import Summary from "../Summary";
import queueProcessing from "../prepareWebM";
import {v4 as uuid} from "uuid";
import {css} from "@emotion/core";
import {MoonLoader} from "react-spinners";
import theme from "../../Theme";
import MainDB, {IAlbum, IArtist} from "../../MainDB";

/**
 * Handle whole logic regarding
 * collecting music info, processing, and saving into DB
 * */


const contextValue: Upload = {
  artist: { name: '', origin: '', genre: '', started: 1900, owner: localStorage.getItem('id') || '' },
  album: { name: '', type: 'lp', releaseDate: new Date() },
  validation: {
    artist: {
      name: false, started: false, genre: false, origin: false
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

  const [uploadState, setUploadState] = useState(contextValue)
  const { filesProcessing } = uploadState
  const history = useHistory()
  const [pathname, setPathname] = useState(history.location.pathname)
  const [processingInProgress, setProcessingInProgress] = useState(false)
  const {container} = createUseStyles(styles)()

  history.listen(({pathname}) => {
    setPathname(pathname)
  })

  useEffect(function () {
    if (processingInProgress && filesProcessing?.every(({processingSuccessful}) => processingSuccessful)) {
      insertToDB(filesProcessing)
      return setProcessingInProgress(false)
    }
    if (processingInProgress) return
    if (!filesProcessing?.length || filesProcessing?.some(({processingInProgress}) => !processingInProgress)) return;

    startProcessing()
    setProcessingInProgress(true)
  }, [filesProcessing, processingInProgress])

  async function insertToDB(filesProcessing: Array<FileProcessing>) {
    const userID = localStorage.getItem('id') || ''
    const albumID = uuid()
    const { album, artist } = uploadState
    const db = new MainDB()

    const { albums: artistExistingAlbums } = await db.artists
      .where(["owner", "name"])
      .equals([artist.owner, artist.name])
      .last()
      .catch(console.error)|| { albums: [] }

    const tracksBinaries = filesProcessing.map(({webMFile, hash}) => ({
        binary: webMFile as ArrayBuffer, hash, id: uuid()
    }))
    const tracks = filesProcessing.map(({hash, name, duration}) => ({
      name, albumID, hash, length: duration, id: uuid(), broadcasters: [userID]
    }))
    const newAlbum: IAlbum = {
      name: album.name,
      type: album.type,
      tracks,
      releaseDate: album.releaseDate.toLocaleDateString()
    }
    const newArtist: IArtist = {
      albums: [...artistExistingAlbums, newAlbum],
      ended: artist.ended,
      genre: artist.genre,
      name: artist.name,
      origin: artist.origin,
      started: artist.started,
      owner: userID,
      // TODO: Pictures
      picture: '',
      link: artist.link?.toString()
    }

    Promise.all(tracksBinaries.map(trackBinary => db.binaryTracks.add(trackBinary)))
      .then(console.info)
      .catch(console.error)

    db.artists
      .where(["owner", "name"])
      .equals([artist.owner, artist.name])
      .delete()
      .finally(() => {
        db.artists.add(newArtist)
          .then(console.info)
          .catch(console.error)
      })
  }

  // TODO: Refactor it plsss :ccccc
  function ProcessingModal() {
    return <div style={{
      position: 'absolute',
      height: '100vh',
      width: '100vw',
      top: 0,
      left: 0,
      backdropFilter: 'blur(1rem)',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>Processing in progress</div>
      <MoonLoader
        loading={processingInProgress}
        color={theme.colors.primary}
        size={50}
        css={css`margin-right: 1rem;`}
      />
      <p>
        {filesProcessing?.filter(({processingSuccessful}) => processingSuccessful).length} /
        {filesProcessing?.length}
      </p>
    </div>
  }

  return <UploadContext.Provider value={{ state: uploadState, setState (state) {
      if (typeof state === 'function') {
        const setState = state as ((state: Upload) => Upload)
        setUploadState(setState(uploadState))
      } else {
        setUploadState(state as Upload)
      }
    } }}>
    <div className={container}>
      {processingInProgress ? <ProcessingModal /> : null}
      <TopBar
        title='Upload'
        buttons={ renderButtons(pathname) }
      />

      <Switch>
        <Route path='/upload/create-artist-profile'>
          <CreateArtistProfile />
        </Route>
        <Route path='/upload/details'>
          <UploadDetails />
        </Route>
        <Route path='/upload/add-tracks'>
          <AddTracks />
        </Route>
        <Route path='/upload/summary'>
          <Summary />
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
      const hash = await crypto.subtle.digest('sha-256', mp3File as ArrayBuffer)

      const hashArray = Array.from(new Uint8Array(hash));
      const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setUploadState(uploadState => ({
        ...uploadState,
        filesProcessing: uploadState.filesProcessing?.map(fileProcessing => {
          if (fileProcessing.mp3File !== mp3File) return fileProcessing
          else {
            return {
              ...fileProcessing,
              hash: hashString,
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
          if (!Object
            .entries(artist)
            .map(([_, a]) => a)
            .every(v => v)) return
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

