import TopBar from "../../TopBar";
import React, {useContext} from "react";
import Button from "../../Button";
import {useHistory} from "react-router-dom";
import {createUseStyles} from "react-jss";
import theme from "../../Theme";
import {PlayerContext} from "../../App";
import AlbumTrack from "./AlbumTrack";

interface AlbumViewProps {
  album: Album|undefined
  artist: Artist|undefined
}

export default function AlbumView ({ album, artist }: AlbumViewProps) {
  const history = useHistory()
  const {viewHeader, container, tracksContainer} = useStyles()
  const {setState: setPlayerState} = useContext(PlayerContext) as PlayerContextType
  if (!album || !artist) throw new Error('Album view require artist and album')
  const { name, tracks } = album
  const {name: artistName, owner} = artist || {}

  return <div className={container}>
    {/*<TopBar
      title={artistName || ''}
      buttons={<Button
        size='s'
        variant='second'
        onClick={history.goBack}
      >Library</Button>}
    />*/}
    <div>
      <p className={viewHeader}>{name}</p>
      <div className={tracksContainer}>
        {tracks?.map((track, i) =>
          <AlbumTrack
            index={i + 1}
            track={track}
            onClick={playTrack(track)}
            key={i}
          />
        )}
      </div>
    </div>
  </div>

  function playTrack(track: Track) {
    return play

    async function play() {
      if (!album) return
      const queue = createQueue(album, track.hash)
      if (!queue) return
      setPlayerState(state => ({ ...state, track, artist, album, queue }))
    }
  }

  function createQueue(album: Album, activeTrackHash: string): PlayerQueue|undefined {
    if (!artist || !album.tracks) return
    return album.tracks.map(track => (
      { track, album, artist, active: activeTrackHash === track.hash }
    ))
  }
}


const useStyles = createUseStyles({
  '@keyframes container-enter': {
    from: { transform: 'translateX(-25%)' },
    to: { transform: 'translateX(0)' },
  },
  container: {
    marginTop: '1rem',
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
  tracksContainer: {
    marginTop: '1rem'
  }
})