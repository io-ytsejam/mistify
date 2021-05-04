import TopBar from "../../TopBar";
import React, {useContext} from "react";
import Button from "../../Button";
import {useHistory} from "react-router-dom";
import {createUseStyles} from "react-jss";
import theme from "../../Theme";
import {requestTrackStream} from "../../RTC";
import {PlayerContext} from "../../App";

interface AlbumViewProps {
  album: Album
}

export default function AlbumView ({ album }: AlbumViewProps) {
  const history = useHistory()
  const { name, tracks, artist } = album
  const { name: artistName, owner } = artist || {}
  const { viewHeader, container } = useStyles()
  const { setState: setPlayerState } = useContext(PlayerContext) as PlayerContextType

  return <div className={container}>
    <TopBar
      title={artistName || ''}
      buttons={ <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={history.goBack}
      >Library</Button> }
    />
    <div>
      <p className={viewHeader}>{name}</p>
      <ol>
        {tracks?.map(({ name, hash: trackHash, broadcasters: userTokens }, i) =>
            <li
              onClick={async () => {
                if (!owner) return
                setPlayerState({URL: await requestTrackStream({ trackHash, userTokens })})
              }}
              key={i}
            >
              {name}
            </li>
        )}
      </ol>
    </div>
  </div>
}

const useStyles = createUseStyles({
  '@keyframes container-enter': {
    from: { transform: 'translateX(-25%)' },
    to: { transform: 'translateX(0)' },
  },
  container: {
    marginTop: '.5rem',
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
  }
})