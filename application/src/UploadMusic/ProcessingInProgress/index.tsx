import { MoonLoader } from "react-spinners";
import theme from "../../Theme";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import React from "react";
import { createUseStyles } from "react-jss";

interface ProcessingInProgressProps {
  filesProcessing: FileProcessing[]
}

export default function ProcessingInProgress({ filesProcessing }: ProcessingInProgressProps) {
  const { container, tracksContainer, track, trackSuccess } = useStyles()
  const processed = filesProcessing?.filter(({processingSuccessful}) => processingSuccessful).length
  const files = filesProcessing?.length

  return <div className={container}>
    <h1>Processing in progress</h1>
    <div className={tracksContainer}> {
      filesProcessing?.map(({ name, processingSuccessful }) =>
          <>
            <div className={processingSuccessful ? trackSuccess : track}>
              <p>{name}</p>
              {processingSuccessful ?
                <CheckCircleOutlineIcon
                  style={{ color: theme.colors.primaryDark }}
                /> :
                <MoonLoader
                  loading={true}
                  color={theme.colors.primary}
                  size={20}
                />}
            </div>
          </>
      )
    } </div>
    <h2>
      <span style={{ fontWeight: 'bolder', color: theme.colors.primary }}>{processed} </span>
      {processed === 1 ? 'file' : 'files'} of <span style={{ fontWeight: 'bolder', color: theme.colors.primaryDark }}>{files}</span> ready
    </h2>
  </div>
}

const useStyles = createUseStyles({
  container: {
    padding: '1rem',
    position: 'absolute',
    height: '100vh',
    width: '100vw',
    top: 0,
    left: 0,
    backdropFilter: 'blur(1rem)',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 0 1rem black',
    '& h1': {
      textAlign: 'center',
    },
    '& h2': {
      fontWeight: 'normal',
      textAlign: 'center'
    }
  },
  tracksContainer: {
    width: '100%'
  },
  track: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid ' + theme.colors.primary,
    color: '#3e3e3e',
    alignItems: 'center',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  trackSuccess: {
    extend: 'track',
    color: 'white'
  }
})