import {createUseStyles, Styles} from "react-jss";
import Button from "../Button";
import MainDB, {IAlbum, IArtist} from "../MainDB";
import {useEffect, useState} from "react";
import Album from "./Album";
import {Route, Switch, useHistory} from "react-router-dom";
import AlbumView from "./AlbumView";
import AlbumCollection from "./AlbumCollection";
import {broadCastMessage} from "../RTC";
import {AppEvents, observeApp} from "../Observe";

export default function Library() {
  const history = useHistory()
  const [albums, setAlbums] = useState<Array<Album>>()
  const [viewed, setViewed] = useState<Album>()
  const db = new MainDB()
  const { tabs, container } = useStyles({ hackGrid: albums?.length })

  useEffect(initialize, [])

  return <div className={container}>
    <Switch>
      <Route path='/library/view-album'>
        {viewed && <AlbumView album={viewed}/>}
      </Route>
      <Route path='/library'>
        <AlbumCollection
          albums={albums || []}
          showAlbum={showAlbum}
        />
      </Route>
    </Switch>
  </div>

  function initialize () {
    queryDB()
    observeApp.addEventListener(AppEvents.DB_CHANGE, queryDB)

    return cleanup

    function cleanup() {
      observeApp.removeEventListener(AppEvents.DB_CHANGE, queryDB)
    }
  }

  function queryDB() {
    db.artists.toArray().then(onFulfilled)

    function onFulfilled(library: Array<IArtist>) {
      if (!library) return

      setAlbums(library.flatMap(artist => artist.albums.map(album => ({
        artist,
        ...album,
        releaseDate: parseDate(album.releaseDate)
      } as Album))))
    }
  }

  function showAlbum(album: Album) {
    setViewed(album)
    history.push('/library/view-album')
  }

  function parseDate(date: string): Date {
    return new Date(Date.parse(date.split('.').reverse().join('-')))
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