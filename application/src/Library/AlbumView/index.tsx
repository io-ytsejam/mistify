import TopBar from "../../TopBar";
import React, {useContext, useEffect, useState} from "react";
import Button from "../../Button";
import {Redirect, useHistory} from "react-router-dom";
import {createUseStyles} from "react-jss";
import theme from "../../Theme";
import {PlayerContext} from "../../App";
import AlbumTrack from "./AlbumTrack";
// @ts-ignore
import ColorThief from 'colorthief'

interface AlbumViewProps {
  album: Album|undefined
  artist: Artist|undefined
}

export default function AlbumView ({ album, artist }: AlbumViewProps) {
  const {setState: setPlayerState} = useContext(PlayerContext) as PlayerContextType
  const [artworkColor, setArtworkColor] = useState<string>()
  if (!album || !artist) throw new Error('Album view require artist and album')
  const { name, tracks, artwork } = album
  const {name: artistName, owner} = artist || {}
  const { viewHeader, container, tracksContainer,
    artworkContainer } = useStyles({ artworkBackground: artworkColor })

  useEffect(function getArtworkDominantColor () {
    const img = new Image()
    const colorThief = new ColorThief()

    img.onload = () => {
      const [r, g, b] = colorThief.getColor(img)
      setArtworkColor(`rgb(${r}, ${g}, ${b})`)
    }

    img.src = artwork
  }, [artwork])

  return <div className={container}>
    <p className={viewHeader}>{name}</p>
    <div className={artworkContainer}>
      <img src={artwork} alt=""/>
    </div>
    <div
      className={tracksContainer}
    >
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

  function playTrack(track: Track) {
    return play

    async function play() {
      if (!album) return
      const queue = createQueue(album, track.hash)
      if (!queue) return
      setPlayerState(state => ({ ...state, track, artist, album, queue, artworkColor }))
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
    animationName: '$container-enter',
    marginBottom: '2rem'
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
  },
  artworkContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
    '& img': {
      animation: '.4s ease',
      animationName: '$artwork-enter',
      width: '70%',
      transition: '1s ease box-shadow',
      boxShadow: props => `0 0 4rem 3rem ${props.artworkBackground || 'black'}`,
    }
  },
  '@keyframes artwork-enter': {
    from: {
      transform: 'scale3d(.7, .7, 1)'
    },
    to: {
      transform: 'scale3d(1, 1, 1)'
    }
  }
})