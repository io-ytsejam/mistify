import {createUseStyles, Styles} from "react-jss";
import React, {useContext, useEffect, useState} from "react";
import theme from "../../Theme";
import ArtistPanel from "../../ArtistPanel";
import Button from "../../Button";
import MainDB from "../../MainDB";
import {useHistory} from "react-router-dom";
import {UploadContext} from "../Upload";
import { mapIArtistsOnArtists} from "../../lib";
import ListOfArtistsLoading from "../../ArtistPanel/ListOfArtistsLoading";

export default function ChooseArtist() {
  const history = useHistory()
  const [ownedArtistsCount, setOwnedArtistsCount] = useState<number>()
  const { state: uploadState, setState: setUploadState } = useContext(UploadContext) as UploadContextType
  const { viewHeader, viewHeaderDesc, container, chooseArtistButton, noArtistsText } = createUseStyles(styles)()
  const db = new MainDB()
  const [artists, setArtists] = useState<Array<Artist>>()

  db.getOwnArtistsCount().then(setOwnedArtistsCount)

  useEffect(function () {
    const userID = localStorage.getItem('id')

    db.artists
      .filter(({ owner }) => owner === userID)
      .toArray()
      .then(mapIArtistsOnArtists)
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
      {artists && artists.length ? artists.map((artist, i) =>
        <ArtistPanel
          key={i}
          artist={artist as Artist}
        >
          <Button
            size='s'
            className={chooseArtistButton}
            onClick={prepareChooseArtist(artist as Artist)}
          >NEXT</Button>
        </ArtistPanel>
      ) : !ownedArtistsCount ?
        <p className={noArtistsText}>No artists yet. Create new One!</p> :
        <ListOfArtistsLoading count={ownedArtistsCount} />}
    </div>
  </div>

  function prepareChooseArtist(artist: Artist) {
    return function chooseArtist() {
      setUploadState(uploadState => ({
        ...uploadState,
        artist: {
          ...uploadState.artist,
          ...artist
        },
        validation: {
          ...uploadState.validation,
          artist: {
            name: true, started: true, origin: true, genre: true
          }
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
    fontSize: '.8125rem',
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