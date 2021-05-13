import ArtistPanel from "../../ArtistPanel";

interface ArtistsViewProps {
  artists: Artist[]
  showArtist: (artist: Artist) => void
}

export default function ArtistsView ({ artists, showArtist }: ArtistsViewProps) {
  return <>
    {artists.map(artist => (
      <ArtistPanel
        key={artist.owner + artist.name}
        artist={artist}
        onClick={() => showArtist(artist)}
      />
    ))}
  </>
}