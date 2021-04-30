import {createUseStyles, Styles} from "react-jss";
import Button from "../Button";
import MainDB, {IAlbum} from "../MainDB";
import {useEffect, useState} from "react";
import Album from "./Album";
import {Route, Switch, useHistory} from "react-router-dom";
import AlbumView from "./AlbumView";
import AlbumCollection from "./AlbumCollection";

export default function Library() {
  const history = useHistory()
  const [albums, setAlbums] = useState<Array<Album>>()
  const [viewed, setViewed] = useState<Album>()
  const db = new MainDB()
  const { tabs, container } = useStyles({ hackGrid: albums?.length })

  useEffect(queryDB, [])

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

  function showAlbum(album: Album) {
    setViewed(album)
    history.push('/library/view-album')
  }

  function queryDB() {
    db.albums.toArray().then(albums => {
      setAlbums(albums.map(album => ({
        ...album,
        type: album.type as AlbumType,
        releaseDate: new Date(album.releaseDate)
      })))
    })
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