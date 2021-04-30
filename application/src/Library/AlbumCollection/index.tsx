import {createUseStyles} from "react-jss";
import Album from "../Album";

interface AlbumCollectionProps {
  albums: Array<Album>,
  showAlbum: (album: Album) => void
}

export default function AlbumCollection ({ albums, showAlbum }: AlbumCollectionProps) {
  const { collection } = useStyles({ albums })

  return <div className={collection}>
    {albums?.map(album =>
      <Album
        album={album}
        onClick={showAlbum}
      />)}
  </div>
}

const useStyles = createUseStyles({
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
  }
})