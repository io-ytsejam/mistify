import {createUseStyles, Styles} from "react-jss";
import Button from "../Button";
import React from "react";

interface ArtistPanelProps {
  name: string
  genre: string
  origin: string
  started: number
  ended?: number
  picture?: string
  children?: React.ReactNode
}

export default function ArtistPanel ({children, genre, name, origin, started, ended, picture}: ArtistPanelProps) {
  const {container, artistPic, artistDetails} = createUseStyles(styles)()

  return <div className={container}>
    <div className={artistPic}>
      <img src={picture} alt="Artist"/>
    </div>
    <div className={artistDetails}>
      <p>{name}</p>
      <p style={{fontSize: '.875rem'}}>{genre}</p>
      <p style={{fontSize: '.625rem'}}>{origin}</p>
      <p style={{fontSize: '.625rem'}}>{`${started} - ${ended || 'present'}`}</p>
      {children}
    </div>
  </div>
}

const artistPic: Styles = {
  width: '9rem',
  height: '7rem',
  boxShadow: '0 0 .5rem black',
  borderRadius: '1.25rem'
}

const styles: Styles = {
  container: {
    width: '100%',
    padding: '.5rem 0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
  },
  artistPic,
  artistDetails: {
    height: '7rem',
    position: 'relative'
  }
}

export { artistPic }