import {createUseStyles, Styles} from "react-jss";
import React, {useState} from "react";
import Button from "../../Button";
import TopBar from "../../TopBar";
import ChooseArtist from "../ChooseArtist";
import CreateArtistProfile from "../CreateArtistProfile";
import {Route, Switch, useHistory} from "react-router-dom";
import UploadDetails from "../UploadDetails";
import AddTracks from "../AddTracks";
import Summary from "../Summary";

/**
 * Handle whole logic regarding
 * collecting music info, processing, and saving into DB
 * */


const contextValue: Upload = {
  artist: { name: '', origin: '', genre: '', started: 1900 },
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
  const history = useHistory()
  const [pathname, setPathname] = useState(history.location.pathname)
  const {container} = createUseStyles(styles)()

  history.listen(({pathname}) => {
    setPathname(pathname)
  })


  return <UploadContext.Provider value={{ state: uploadState, setState (state) {
      if (typeof state === 'function') {
        const setState = state as ((state: Upload) => Upload)
        setUploadState(setState(uploadState))
      } else {
        setUploadState(state as Upload)
      }
    } }}>
    <div className={container}>
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

