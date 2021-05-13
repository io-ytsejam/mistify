import {createUseStyles, Styles} from "react-jss";
import Button from "../Button";
import MainDB from "../MainDB";
import {useEffect, useState} from "react";
import Album from "./Album";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import AlbumView from "./AlbumView";
import AlbumCollection from "./AlbumCollection";
import {AppEvents, observeApp} from "../Observe";
import TopBar from "../TopBar";
import { mapIArtistsOnArtists } from "../lib";
import ArtistsView from "./ArtistsView";

export default function Library() {
  const history = useHistory()
  const location = useLocation()
  const [artists, setArtists] = useState<Array<Artist>>()
  const [viewAlbum, setViewAlbum] = useState<Album>()
  const [viewArtist, setViewArtist] = useState<Artist>()
  const db = new MainDB()
  const { container } = useStyles()

  useEffect(initialize, [])

  const buttonTitle = getTitle()

  return <>
    <TopBar
      title={viewArtist ? viewArtist.name : 'Library'} buttons={
        buttonTitle && <Button
            onClick={history.goBack}
            size='s'
            variant='second'
        >
          {buttonTitle}
        </Button>
      }
    />
    <div className={container}>
      <Switch>
        <Route path='/library/view-album'>
          {viewAlbum && <AlbumView artist={viewArtist} album={viewAlbum}/>}
        </Route>
        <Route path='/library/view-artist'>
          {viewArtist && <AlbumCollection
              albums={viewArtist.albums || []}
              showAlbum={showAlbum}
          />}
        </Route>
        <Route path='/library'>
          {artists && <ArtistsView showArtist={showArtist} artists={artists} />}
        </Route>
      </Switch>
    </div>
  </>

  function getTitle() {
    if (location.pathname.match('view-album')) return 'DISCOGRAPHY'
    if (location.pathname.match('view-artist')) return 'LIBRARY'
    return ''
  }

  function initialize () {
    queryDB()
    observeApp.addEventListener(AppEvents.DB_CHANGE, queryDB)

    return cleanup

    function cleanup() {
      observeApp.removeEventListener(AppEvents.DB_CHANGE, queryDB)
    }
  }

  function queryDB() {
    db.artists.toArray().then(mapIArtistsOnArtists).then(setArtists)
  }

  function showAlbum(album: Album) {
    setViewAlbum(album)
    history.push('/library/view-album')
  }

  function showArtist(artist: Artist) {
    setViewArtist(artist)
    history.push('/library/view-artist')
  }
}

const useStyles = createUseStyles({
  '@keyframes container-enter': {
    from: {transform: 'translateX(-25%)'},
    to: {transform: 'translateX(0)'},
  },
  container: {
    animation: '.2s ease-in',
    animationName: '$container-enter',
    padding: '0 1rem'
  },
  tabs: {
    display: 'flex',
    height: '3rem',
    width: '100%',
    position: 'fixed',
    bottom: '7rem',
    borderTop: '1px solid white',
    borderBottom: '1px solid white',
  }
})