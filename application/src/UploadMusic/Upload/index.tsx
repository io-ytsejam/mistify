import {createUseStyles, Styles} from "react-jss";
import React, {useState} from "react";
import Button from "../../Button";
import TopBar from "../../TopBar";
import ChooseAlterEgo from "../ChooseAlterEgo";
import CreateArtistProfile from "../CreateArtistProfile";
import {Route, Switch, useHistory} from "react-router-dom";

const UploadContext = React.createContext({step: 0})

export default function Upload() {
  const styles: Styles = {
    container: {
      padding: '0 1rem'
    }
  }
  const [step, setStep] = useState('CHOOSE_ALTER_EGO')
  const {container} = createUseStyles(styles)()
  const history = useHistory()

  return <div className={container}>
    <TopBar
      title='Upload'
      buttons={
        renderButtons(0)
      }
    />

    <Switch>
      <Route path='/upload/create-artist-profile'>
        <CreateArtistProfile />
      </Route>
      <Route path='/'>
        <ChooseAlterEgo/>
      </Route>
    </Switch>

    {step === 'CREATE_ARTIST_PROFILE' ? <CreateArtistProfile/> : null}

  </div>

  function renderButtons(step: number): React.ReactNode {
    if (step === 0) return <>
      <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
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

