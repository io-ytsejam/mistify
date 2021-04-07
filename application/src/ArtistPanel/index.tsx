import {createUseStyles, Styles} from "react-jss";
import Button from "../Button";

export default function ArtistPanel () {
  const {container, artistPic, artistDetails} = createUseStyles(styles)()

  return <div className={container}>
    <div className={artistPic}>
      <img src="xd.jpg" alt="Artist"/>
    </div>
    <div className={artistDetails}>
      <p>Artist</p>
      <p style={{fontSize: '.875rem'}}>Folk</p>
      <p style={{fontSize: '.625rem'}}>Brazil</p>
      <p style={{fontSize: '.625rem'}}>1990 - present</p>
      <Button size='s' style={{position: "absolute", bottom: 0, right: 0}}>NEXT</Button>
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