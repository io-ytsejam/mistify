import {createUseStyles} from "react-jss";
import theme from "../../../Theme";
import {MouseEventHandler, useContext} from "react";
import {PlayerContext} from "../../../App";
import {convertMsToMnsAndSecs} from "../../../lib";

interface AlbumTrackProps {
  track?: Track
  index?: number
  onClick?: Function,
  children?: string
}

export default function AlbumTrack({ track, index, onClick, children }: AlbumTrackProps) {
  const { state: playerState } = useContext(PlayerContext) as PlayerContextType
  const { track: nowPlayingTrack } = playerState
  const { container, trackNumber, activeTrack } = useStyles()
  const { name, length, hash } = track || {}

  return <div
    className={nowPlayingTrack?.hash ===  hash && hash ? activeTrack : container}
    onClick={onClick as MouseEventHandler}
  >
    <p><span className={trackNumber}>{index}</span>{name || children}</p>
    <p>{convertMsToMnsAndSecs(length || 0)}</p>
  </div>
}



const useStyles = createUseStyles({
  container: {
    padding: '0 1rem',
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    width: 'calc(100% + 2rem)',
    marginLeft: '-1rem',
    height: '3rem',
    transition: '.2s ease filter',
    userSelect: 'none',
    '&:hover': {
      filter: 'brightness(1.2)'
    },
    '&:active': {
      filter: 'brightness(1.5)'
    }
  },
  '@keyframes track-start-playing': {
    from: { transform: 'translateX(-.25rem)' },
    to: { transform: 'translateX(0)' },
  },
  trackNumber: {
    marginRight: '1rem'
  },
  activeTrack: {
    extend: 'container',
    color: theme.colors.primaryDark,
    borderLeft: `.25rem solid ${theme.colors.primaryDark}`,
    filter: 'brightness(1.2)',
    animation: '.2s ease $track-start-playing',
  }
})