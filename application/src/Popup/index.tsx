import ReactDOM from "react-dom";
import {createUseStyles} from "react-jss";
import theme from "../Theme";

interface ErrorBoundaryPopupProps {
  error: any
  resetErrorBoundary: any
}

interface PopupProps {
  okAction: (any: any) => void
  message: string
}

export function ErrorBoundaryPopup({ resetErrorBoundary, error }: ErrorBoundaryPopupProps) {
  return <Popup okAction={resetErrorBoundary} message={error.message} />
}


export default function Popup ({ message, okAction }: PopupProps) {
  const root = document.querySelector('#root')
  const { wrapper, messageContainer, action, container } = useStyles()
  if (!root) return null


  return ReactDOM.createPortal(
    <div className={wrapper}>
      <div className={container}>
        <div className={messageContainer}>
          <p>
            {message}
          </p>
        </div>
        <div className={action} onClick={okAction}>
          OK
        </div>
      </div>
    </div>, root)
}

const useStyles = createUseStyles({
  wrapper: {
    position: 'absolute',
    height: '100vh',
    width: '100vw',
    backdropFilter: 'blur(.5rem)',
    top: 0,
    zIndex: 999,
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "column",
    transition: '.4s ease backdropFilter'
  },
  messageContainer: {
    maxWidth: '13.5rem',
    width: '100%',
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: theme.colors.secondary,
    fontSize: '.825rem',
    borderRadius: '.75rem .75rem 0 0'
  },
  container: {
    boxShadow: '0 0 1rem black',
    borderRadius: '.75rem'
  },
  action: {
    maxWidth: '13.5rem',
    width: '100%',
    backgroundColor: theme.colors.primaryDark,
    height: '2rem',
    fontSize: '.75rem',
    color: 'black',
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '0 0 .75rem .75rem',
    transition: '.2s filter ease',
    cursor: 'pointer',
    '&:hover': {
      filter: 'brightness(1.2)'
    },
    '&:active': {
      filter: 'brightness(1.5)'
    }
  }
})