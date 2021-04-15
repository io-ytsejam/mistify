import {createUseStyles} from "react-jss";

const useStyles = createUseStyles({
  loadButton: {height: '100%', margin: '0 1rem 0 0'},
  deleteButton: {height: '100%', margin: '0 1rem 0 0'},
  loaderPlaceholder: {display: "flex"},
  trackTitleInput: {width: '100%'},
  uploadMusic: {display: "flex", alignItems: 'center'},
  loadTrackInputWrapper: {
    width: '100%',
    position: 'relative',
    '& button': {
      position: 'absolute',
      top: '.25rem',
      right: '.25rem'
    }
  }
})

export default useStyles