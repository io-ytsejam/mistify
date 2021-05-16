import {createUseStyles, Styles} from "react-jss";
import React, {useState} from "react";
import theme from "../Theme";
import PeopleIcon from '@material-ui/icons/People';

interface ArtistPanelProps {
  artist: Artist
  children?: React.ReactNode
  onClick?: (arg?: any) => void
}

export default function ArtistPanel ({ children, artist, onClick }: ArtistPanelProps) {
  const { genre, name, origin, started, ended, picture } = artist
  const {container, artistPic, artistPicContainer, artistDetails} = createUseStyles(styles)()

  return <div
    className={container}
    onClick={onClick}
  >
    <div className={artistPicContainer}>
      {picture ? <img className={artistPic} src={picture} alt="Artist"/> : <PeopleIcon fontSize='large' />}
    </div>
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
    transition: '.2s filter ease',
    '&:hover': {
      filter: 'brightness(1.2)'
    },
    '&:active': {
      filter: 'brightness(1.5)'
    }
  },
  artistPic,
  artistDetails: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative'
  },
  artistPicContainer: {
    height: '5rem',
    width: '9rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  }
}

export { artistPic }