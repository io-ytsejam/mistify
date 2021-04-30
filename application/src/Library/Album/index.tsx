import {createUseStyles, Styles} from "react-jss";
import {MouseEventHandler} from "react";

interface AlbumProps {
  album: Album,
  onClick: (album: Album) => void
}

export default function Album({album, onClick}: AlbumProps) {
  const { name, releaseDate } = album
  const releaseYear = releaseDate.getFullYear()
  const { container, year } = useStyles()

  return (
    <div
      className={container}
      onClick={function () {
        onClick(album)
      }}
    >
      <p>{name}</p>
      <p className={year}>{2020}</p>
    </div>)
}

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    backgroundColor: 'crimson',
    '&:first-child': {
      gridRow: 1,
      gridColumn: 1,
    },
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
    }
  },
  year: {
    right: 0
  },
  title: {

  }
})