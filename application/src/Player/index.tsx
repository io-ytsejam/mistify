import { createUseStyles } from "react-jss";
import React, { useContext, useEffect, useRef, useState } from "react";
import {PlayerContext} from "../App";
import Button from "../Button";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Pause from "@material-ui/icons/Pause";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import SkipNext from "@material-ui/icons/SkipNext";
import { requestTrackStream } from "../RTC";
import {ErrorBoundary} from "react-error-boundary";
import Popup from "../Popup";
import theme from "../Theme";
import {prepareOnPanelMouseDown, prepareOnPanelTouchStart} from "./PanelEvents";

export default function Player() {
  const [panel, setPanel] = useState<HTMLDivElement|null>()
  const { setState: setPlayerState, state: playerState } = useContext(PlayerContext) as PlayerContextType
  const { isPanelExtended, track, artist, album, queue, artworkColor } = playerState

  const [error, setError] = useState<Error>()
  const [paused, setPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  let audioElement = useRef<HTMLAudioElement>(null)

  const  { artwork } = album || {}
  const artworks: Array<HTMLDivElement> = []
  const { container, wrapper, handle, content,
    audioElement: audio, audioElementOnExtendedView,
    artwork: artworkClass, controlsContainer, artworkQueue,
    artworkActive, dummyArtwork, miniPlayer, miniPlayerText,
    prevNextButton
  } = useStyles({ isPanelExtended, artworkColor })

  useEffect(handleNowPlayingChange, [track?.hash])
  useEffect(updateActiveArtwork, [track?.hash])
  useEffect(handlePlayerExtension, [isPanelExtended])

  if (!queue.length) return null

  return <ErrorBoundary
    FallbackComponent={Popup}
    onReset={() => setError(undefined)}
  >
    {error ? <>{error}</> : null}
    <div className={wrapper}>
      <div
        ref={setPanel}
        className={container}
        onMouseDown={panel ? prepareOnPanelMouseDown(panel) : undefined}
        onTouchStart={panel ? prepareOnPanelTouchStart(panel) : undefined}
      >
        <div
          className={handle}
          onClick={() => setPlayerState(state => ({
            ...state,
            isPanelExtended: !state.queue.length ? false : !state.isPanelExtended
          }))}
        >
          <div />
          <div />
          <div />
        </div>
        <div className={content}>
          <div className={artworkQueue}>
            {
              queue.map(({ active }, i) =>
                <div
                  id={i.toString()}
                  className={active ? artworkActive : artworkClass}
                  key={i}
                  ref={element => {
                    if (element) {
                      artworks[i] = element
                    }
                  }}
                >
                  <img src={artwork} alt=""/>
                </div>
              )
            }
            <div className={dummyArtwork} />
          </div>
          <h2>{track?.name || ''}</h2>
          <h3>{album?.name || ''}</h3>
          <h3>{artist?.name || ''}</h3>
          <div className={controlsContainer}>
            <Button
              className={prevNextButton}
              size='m'
              variant='secondIcon'
              onClick={playPrevInQueue}
            >
              <SkipPrevious />
            </Button>
            <Button
              size='m'
              variant='icon'
              onClick={paused ?
                () => audioElement.current?.play() :
                () => audioElement.current?.pause()
              }
            >
              {paused ? <PlayArrow /> : <Pause />}
            </Button>
            <Button
              className={prevNextButton}
              size='m'
              variant='secondIcon'
              onClick={playNextInQueue}
            >
              <SkipNext/>
            </Button>
          </div>
          {!isPanelExtended && <div className={miniPlayer}>
              <Button
                  size='m'
                  variant='icon'
                  onClick={paused ?
                    () => audioElement.current?.play() :
                    () => audioElement.current?.pause()
                  }
              >
                {paused ? <PlayArrow /> : <Pause />}
              </Button>
              <div className={miniPlayerText}>
                  <p>{artist?.name}</p>
                  <p>{track?.name}</p>
              </div>
              <div>
                  <p>{getCurrentTime(currentTime)}</p>
              </div>
          </div>}
          <audio
            autoPlay
            ref={audioElement}
            className={isPanelExtended ? audioElementOnExtendedView : audio}
            src={playerState.URL}
            controls
            onPlay={() => {
              setPaused(false)
              // TODO: Remove me
              if (audioElement.current)
                audioElement.current.volume = .2
            }}
            onPause={() => setPaused(true)}
            onError={console.log}
            onAbort={console.log}
            onEnded={playNextInQueue}
            onTimeUpdate={() => {
              !isPanelExtended && setCurrentTime(audioElement.current?.currentTime || 0)
            }}
          />
        </div>
      </div>
    </div>
  </ErrorBoundary>

  function updateActiveArtwork () {
    const artwork = queue.find(({ active }) => active)
    if (!artwork) return
    artworks[queue.indexOf(artwork)]
      .scrollIntoView({block: "center", inline: 'center', behavior: 'smooth'})
  }

  function handleNowPlayingChange() {
    if (!track) return

    requestTrackStream(track, setError)
      .then(updateState)
      .catch(setError)

    function updateState(URL: string) {
      setPlayerState(state => ({ ...state, URL }))
    }
  }

  async function playNInQueue(n: number) {
    const { artist, album, track } = queue.find((_, i) => i === n) || {}

    if (!track || !artist || !album) return

    setPlayerState(state => ({
      ...state,
      artist, album, track,
      queue: [...queue.map(markNewActive)]
    }))

    function markNewActive(playable: Playable, index: number) {
      return index === n ? { ...playable, active: true } : { ...playable, active: false }
    }
  }

  function playNextInQueue() {
    const currentPlayable = queue.find(({ active }) => active)
    if (!currentPlayable) return
    playNInQueue(queue.indexOf(currentPlayable) + 1)
  }

  function playPrevInQueue() {
    const currentPlayable = queue.find(({ active }) => active)
    if (!currentPlayable) return
    playNInQueue(queue.indexOf(currentPlayable) - 1)
  }

  function handlePlayerExtension () {
    if (!queue.length || !panel) return

    if (isPanelExtended)
      panel.style.top = 'calc(-100vh + 9rem)'
    else
      panel.style.top = '0'
  }

  function getCurrentTime(time: number) {
    if (!audioElement.current) return
    const date = new Date('01.01.1970 00:00')
    date.setSeconds(time)
    const seconds = date.getSeconds().toString()
    return `${date.getMinutes()}:${seconds.length === 1 ? '0' + seconds : seconds}`
  }
}

const useStyles = createUseStyles({
  wrapper: {
    position: 'fixed',
    bottom: '3rem',
    width: '100vw',
    height: '4.1rem',
    boxSizing: 'border-box',
    zIndex: 1
  },
  container: {
    zIndex: 111,
    color: 'white',
    userSelect: 'none',
    backgroundColor: props => props.artworkColor?.replace(')', ', .6)'),
    transition: '1s ease background-color',
    backdropFilter: "blur(.5rem)",
    height: '100vh',
    width: '100%',
    borderRadius: '1.5rem 1' +
      '.5rem 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0px -7px 10px rgba(0, 0, 0, 0.25)',
    bottom: 0
  },
  handle: {
    cursor: 'pointer',
    zIndex: 1,
    margin: '.25rem 0',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    '& div': {
      width: '.5rem',
      height: '.5rem',
      backgroundColor: 'white',
      margin: '.25rem',
      borderRadius: '.5rem',
      boxShadow: '0px 0px .5rem black'
    }
  },
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& h2, h3': {
      fontWeight: 'normal',
      textShadow: '0 0 .5rem black',
      textAlign: 'center'
    },
    '& h2': {
      marginBottom: '1rem'
    }
  },
  audioElement: {
    display: 'none'
  },
  audioElementOnExtendedView: {
    position: 'absolute',
    height: '3.5rem',
    width: 'calc(100% - 1rem)',
    marginTop: '-1.75rem',
    bottom: '5.25rem'
  },
  artworkQueue: {
    flexFlow: 'row nowrap',
    display: 'flex',
    visibility: props => props.isPanelExtended ? 'visible' : 'hidden',
    overflowX: 'hidden',
    alignItems: 'center',
    width: '100%',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    padding: '2.5rem 0'
  },
  artwork: {
    width: '50%',
    aspectRatio: 1,
    margin: '0 1.5rem',
    display: 'inline-block',
    flex: 'none',
    '&:first-child': {
      marginLeft: '6rem'
    },
    '&:last-child': {
      marginRight: '4rem'
    },
    transition: '.4s ease transform',
    '& img': {
      width: '100%',
      boxShadow: '0 0 1rem black',
    }
  },
  dummyArtwork: {
    extend: 'artwork',
    visibility: 'hidden'
  },
  artworkActive: {
    extend: 'artwork',
    transform: 'scale3d(1.2, 1.2, 1)'
  },
  controlsContainer: {
    width: '100%',
    margin: '1rem',
    display: 'flex',
    visibility: props => props.isPanelExtended ? 'visible' : 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    '& button': {
      margin: '1rem'
    }
  },
  notVisible: {
    visibility: 'hidden'
  },
  miniPlayer: {
    display: "flex",
    position: 'absolute',
    height: '4rem',
    width: '100%',
    top: 0,
    textShadow: '0 0 .5rem black',
    '& button': {
      flex: 'none',
      margin: '.625rem .5rem 1rem .5rem',
      textShadow: '0 0 .5rem black'
    },
    '& div:last-child': {
      display: 'flex',
      alignItems: 'flex-end',
      fontSize: '.825rem',
      flex: 'none'
    }
  },
  miniPlayerText: {
    width: 'calc(100% - 6rem)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '& p:first-child': {
      fontSize: '.825rem'
    },
    '& p:last-child': {
      marginRight: '4rem',
      whiteSpace: 'nowrap'
    },
  },
  prevNextButton: {
    boxShadow: 'none !important',
    '&:hover': {
      border: `1px solid ${theme.colors.primary}`
    }
  }
})