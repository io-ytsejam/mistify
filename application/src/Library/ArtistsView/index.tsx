import ArtistPanel from "../../ArtistPanel";
import ContentLoader from "react-content-loader";
import React from "react";

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