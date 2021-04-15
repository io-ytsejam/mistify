import {createUseStyles, Styles} from "react-jss";
import React from "react";
import theme from "../../Theme";
import ArtistPanel from "../../ArtistPanel";
import Button from "../../Button";

export default function ChooseArtist() {
  const { viewHeader, viewHeaderDesc, container } = createUseStyles(styles)()

  return <div className={container}>
    <div className={viewHeader}>
      <p>CHOOSE ARTIST</p>
    </div>
    <div className={viewHeaderDesc}>
      <p>Who are you right now? Choose artist name associated with tracks you want to add. You can also create new identity.</p>
    </div>
    <div>
      <ArtistPanel
        genre='Folk'
        name='Artist'
        origin='Brazil'
        started={1990}
      >
        <Button size='s' style={{position: "absolute", bottom: 0, right: 0}}>NEXT</Button>
      </ArtistPanel>
    </div>
  </div>
}

const styles: Styles = {
  '@keyframes container-enter': {
    from: { transform: 'translateX(-25%)' },
    to: { transform: 'translateX(0)' },
  },
  container: {
    animation: '.2s ease-in',
    animationName: '$container-enter'
  },
  viewHeader: {
    color: theme.colors.primary,
    fontWeight: 600,
    margin: '.5rem 0'
  },
  viewHeaderDesc: {
    fontSize: '.625rem',
    margin: '.5rem 0'
  }
}