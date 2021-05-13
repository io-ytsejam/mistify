import {createUseStyles} from "react-jss";
import Album from "../Album";
import TopBar from "../../TopBar";
import Button from "../../Button";
import {useHistory} from "react-router-dom";

interface AlbumCollectionProps {
  albums: Array<Album>,
  showAlbum: (album: Album) => void
}

export default function AlbumCollection ({ albums, showAlbum }: AlbumCollectionProps) {
  const { collection, container } = useStyles({ albums })
  const history = useHistory()

  return <div className={container}>
    <div className={collection}>
      {albums?.map((album, i) =>
        <Album
          key={i}
          album={album}
          onClick={showAlbum}
        />)}
    </div>
  </div>
}

const useStyles = createUseStyles({
  container: {
    animation: '.2s ease-in',
    animationName: '$container-enter'
  },
  collection: {
    animation: '.2s ease-in',
    animationName: '$container-enter',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
    gridAutoRows: '1fr',
    columnGap: '1rem',
    rowGap: '1rem',
    '&:before': {
      content: props => props.albums?.length ? '""' : '',
      width: 0,
      paddingBottom: '100%',
      gridRow: 1,
      gridColumn: 1,
    }
  },
  '@keyframes container-enter': {
    from: {transform: 'translateX(-25%)'},
    to: {transform: 'translateX(0)'},
  },
})