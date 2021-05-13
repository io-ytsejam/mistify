import {createUseStyles, Styles} from "react-jss";
import {MouseEventHandler} from "react";
import TopBar from "../../TopBar";

interface AlbumProps {
  album: Album,
  onClick: (album: Album) => void
}

export default function Album({album, onClick}: AlbumProps) {
  const { name, releaseDate, artwork } = album
  const releaseYear = releaseDate.getFullYear()
  const { container, year } = useStyles()

  return (
    <div
      className={container}
      onClick={function () {
        onClick(album)
      }}
    >
      <img src={artwork} alt=""/>
      <p>{name}</p>
      <p className={year}>{releaseYear}</p>
    </div>)
}

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    '&:first-child': {
      gridRow: 1,
      gridColumn: 1,
    },
    boxShadow: '0 0 .5rem black',
    cursor: 'pointer',
    textShadow: '0 0 .25rem black',
    fontSize: '.75rem',
    textTransform: 'uppercase',
    '& p': {
      position: 'absolute',
      bottom: 0
    },
    transition: '.4s ease filter',
    '&:hover': {
      filter: 'brightness(.8)'
    },
    '&:active': {
      filter: 'brightness(.9)'
    },
    '& img': {
      position: 'absolute',
      width: '100%'
    }
  },
  year: {
    right: 0
  },
  title: {

  }
})