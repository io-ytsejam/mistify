import {createUseStyles, Styles} from "react-jss";
import Button from "../Button";
import MainDB from "../MainDB";

export default function Library() {
  const {tabs} = createUseStyles(styles)()
  const db = new MainDB()

  return <div className={tabs}>
    <Button size='s'>Artists</Button>
    <Button size='s'>All tracks</Button>
  </div>
}



const styles: Styles = {
  tabs: {
    display: 'flex',
    height: '3rem',
    width: '100%',
    position: 'fixed',
    bottom: '7rem',
    borderTop: '1px solid white',
    borderBottom: '1px solid white',
  }
}