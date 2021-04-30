import {createUseStyles, Styles} from "react-jss";
import React, {useContext, useEffect, useState} from "react";
import theme from "../../Theme";
import ArtistPanel from "../../ArtistPanel";
import Button from "../../Button";
import MainDB, {IArtist} from "../../MainDB";
import {useHistory} from "react-router-dom";
import {UploadContext} from "../Upload";

export default function ChooseArtist() {
  const history = useHistory()
  const { state: uploadState, setState: setUploadState } = useContext(UploadContext) as UploadContextType
  const { viewHeader, viewHeaderDesc, container, chooseArtistButton, noArtistsText } = createUseStyles(styles)()
  const db = new MainDB()
  const [artists, setArtists] = useState<Array<IArtist>>()


  useEffect(function () {
    db.artists
      .toArray()
      .then(setArtists)
  }, [])

  return <div className={container}>
    <div className={viewHeader}>
      <p>CHOOSE ARTIST</p>
    </div>
    <div className={viewHeaderDesc}>
      <p>Who are you right now? Choose artist name associated with tracks you want to add. You can also create new identity.</p>
    </div>
    <div>
      {!artists?.length ?
        <p className={noArtistsText}>No artists yet. Create new One!</p> : null}
      {artists?.map(artist =>
        <ArtistPanel
          name={artist.name}
          genre={artist.genre}
          origin={artist.origin}
          started={artist.started}
        >
          <Button
            size='s'
            className={chooseArtistButton}
            onClick={prepareChooseArtist(artist as Artist)}
          >NEXT</Button>
        </ArtistPanel>
      )}
    </div>
  </div>

  function prepareChooseArtist(artist: Artist) {
    return function chooseArtist() {
      setUploadState(uploadState => ({
        ...uploadState,
        artist: {
          ...uploadState.artist,
          ...artist
        }
      }))

      history.push('/upload/details')
    }
  }
}

const styles: Styles = {
  '@keyframes container-enter': {
    from: { transform: 'translateX(-25%)' },
    to: { transform: 'translateX(0)' },
  },
  container: {
    animation: '.2s ease-in',
    animationName: '$container-enter'
  },
  viewHeader: {
    color: theme.colors.primary,
    fontWeight: 600,
    margin: '.5rem 0'
  },
  viewHeaderDesc: {
    fontSize: '.625rem',
    margin: '.5rem 0'
  },
  chooseArtistButton: {
    position: "absolute",
    bottom: 0,
    right: 0
  },
  noArtistsText: {
    textAlign: 'center',
    filter: 'brightness(.5)'
  }
}

{/* style={{position: "absolute", bottom: 0, right: 0}}*/}