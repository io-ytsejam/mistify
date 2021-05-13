import {createUseStyles, Styles} from "react-jss";
import React from "react";
import theme from "../Theme";

interface ArtistPanelProps {
  artist: Artist
  children?: React.ReactNode
  onClick?: (arg?: any) => void
}

export default function ArtistPanel ({ children, artist, onClick }: ArtistPanelProps) {
  const { genre, name, origin, started, ended, picture } = artist
  const {container, artistPic, artistDetails} = createUseStyles(styles)()

  return <div
    className={container}
    onClick={onClick}
  >
    <img className={artistPic} src={picture} alt="Artist" />
    <div className={artistDetails}>
      <div>
        <p>{name}</p>
        <p style={{fontSize: '.875rem'}}>{genre}</p>
      </div>
      <div>
        <p style={{fontSize: '.625rem'}}>{origin}</p>
        <p style={{fontSize: '.625rem'}}>{`${started} - ${ended || 'present'}`}</p>
      </div>
      {children}
    </div>
  </div>
}

const artistPic: Styles = {
  maxWidth: '9rem',
  boxShadow: '0 0 .5rem black',
  '& img': {
    width: '100%',
    marginBottom: '-.25rem'
  }
}

const styles: Styles = {
  container: {
    userSelect: 'none',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: theme.colors.secondary,
    width: 'calc(100% + 2rem)',
    marginLeft: '-1rem',
    padding: '1rem 1rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    '&:hover': {
      filter: 'brightness(1.2)'
    },
    '&:active': {
      filter: 'brightness(1.5)'
    }
  },
  artistPic,
  artistDetails: {
    // minHeight: '4rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative'
  }
}

export { artistPic }