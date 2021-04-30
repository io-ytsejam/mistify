import TopBar from "../../TopBar";
import React from "react";
import Button from "../../Button";
import {useHistory} from "react-router-dom";
import {createUseStyles} from "react-jss";
import theme from "../../Theme";

interface AlbumViewProps {
  album: Album
}

export default function AlbumView ({ album }: AlbumViewProps) {
  const history = useHistory()
  const { name, tracks } = album
  const { viewHeader, container } = useStyles()

  return <div className={container}>
    <TopBar
      title={name}
      buttons={ <Button
        size='s'
        variant='second'
        style={{marginRight: '1rem'}}
        onClick={history.goBack}
      >Library</Button> }
    />
    <div>
      <p className={viewHeader}>track list</p>
      <ol>
        {tracks?.map(({ name }) => <li>{name}</li>)}
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