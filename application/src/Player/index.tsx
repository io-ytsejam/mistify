import {createUseStyles} from "react-jss";
import React, {useContext, useEffect, useRef, useState} from "react";
import {PlayerContext} from "../App";
import Button from "../Button";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Pause from "@material-ui/icons/Pause";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import SkipNext from "@material-ui/icons/SkipNext";
import { requestTrackStream } from "../RTC";

export default function Player() {
  let panel: HTMLDivElement
  const [paused, setPaused] = useState(false)
  const { setState: setPlayerState, state: playerState } = useContext(PlayerContext) as PlayerContextType
  const { isPanelExtended, track, artist, album, queue } = playerState
  const  { artwork } = album || {}
  let options: IntersectionObserverInit
  const artworks: Array<HTMLDivElement> = []
  let artworkContainer: Element|undefined = undefined
  let audioElement = useRef<HTMLAudioElement>(null)

  useEffect(handleNowPlayingChange, [track?.hash])
  useEffect(updateActiveArtwork, [track?.hash])

  function updateActiveArtwork () {
    const artwork = queue.find(({ active }) => active)
    if (!artwork) return
    artworks[queue.indexOf(artwork)].scrollIntoView({block: "center", inline: 'center', behavior: 'smooth'})
  }

  function handleNowPlayingChange() {
    if (!track) return

    requestTrackStream(track).then(updateState)

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

  function defineIObserverOptions(container: HTMLDivElement) {
    artworkContainer = container
    options = {
      root: container,
      // rootMargin: '16px',
      threshold: 1
    }
  }

  useEffect(function () {
    if (isPanelExtended)
      panel.style.top = 'calc(-100vh + 9rem)'
    else
      panel.style.top = '0'
  }, [isPanelExtended])

  function getPanel(el: HTMLDivElement) {
    panel = el
  }
  const { container, wrapper, handle, content,
    audioElement: audio, audioElementOnExtendedView,
  artwork: artworkClass, controlsContainer, artworkQueue,
    artworkActive, dummyArtwork } = useStyles({ isPanelExtended })

  return <div className={wrapper}>
    <div
      ref={getPanel}
      className={container}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
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
            size='m'
            variant='secondIcon'
            onClick={playNextInQueue}
          >
            <SkipNext/>
          </Button>
        </div>
        <audio
          autoPlay
          ref={audioElement}
          muted
          className={isPanelExtended ? audioElementOnExtendedView : audio}
          src={playerState.URL}
          controls
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onError={console.log}
          onAbort={console.log}
          onEnded={playNextInQueue}
        />
      </div>
    </div>
  </div>

  function onTouchStart (e: any) {
    if (!panel) return
    e = e || window.event;
    var start = 0, diff = 0;
    if( e.touches[0].pageY) start = e.touches[0].pageY - (panel.style.top ? parseInt(panel.style.top) : 0);
    else if( e.touches[0].clientY) start = e.touches[0].clientY - (panel.style.top ? parseInt(panel.style.top) : 0);

    panel.style.position = 'relative';
    document.body.ontouchmove = function(e) {
      e = e || window.event;
      var end = 0;
      if( e.touches[0].pageY) end = e.touches[0].pageY;
      else if( e.touches[0].clientY) end = e.touches[0].clientY;

      diff = end-start;
      panel.style.top = diff+"px";
    };
    document.body.ontouchend = function() {
      // do something with the action here
      // elem has been moved by diff pixels in the X axis
      // panel.style.position = 'static';
      document.body.ontouchmove = document.body.ontouchend = null;
    };
  }

  function onMouseDown(e: any) {
    if (!panel) return
    e = e || window.event;
    var start = 0, diff = 0;
    if( e.pageY) start = e.pageY - (panel.style.top ? parseInt(panel.style.top) : 0);
    else if( e.clientY) start = e.clientY - (panel.style.top ? parseInt(panel.style.top) : 0);

    panel.style.position = 'relative';
    document.body.onmousemove = function(e) {
      e = e || window.event;
      var end = 0;
      if( e.pageY) end = e.pageY;
      else if( e.clientY) end = e.clientY;

      diff = end-start;
      panel.style.top = diff+"px";
    };
    document.body.onmouseup = function() {
      // do something with the action here
      // elem has been moved by diff pixels in the X axis
      // panel.style.position = 'static';
      document.body.onmousemove = document.body.onmouseup = null;
    };
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
    backgroundColor: "rgb(255, 204, 188, .4)",
    backdropFilter: "blur(.5rem)",
    height: '100vh',
    width: '100%',
    borderRadius: '2.5rem 2.5rem 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0px -7px 10px rgba(0, 0, 0, 0.25)',
    bottom: 0
  },
  handle: {
    cursor: 'pointer',
    zIndex: 1,
    margin: '.5rem 0',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    '& div': {
      width: '.5rem',
      height: '.5rem',
      backgroundColor: 'black',
      margin: '.25rem',
      borderRadius: '.5rem',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)'
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
    position: 'absolute',
    height: '3.5rem',
    width: 'calc(100% - 1rem)',
    marginTop: '-1.75rem'
  },
  audioElementOnExtendedView: {
    extend: 'audioElement',
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
  }
})