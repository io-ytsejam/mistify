import {createUseStyles} from "react-jss";
import theme from "../../Theme";
import Button from "../../Button";
import {useContext} from "react";
import TrackUpload from "../TrackUpload";
import {UploadContext} from "../Upload";

export default function AddTracks () {
  const {container, viewHeader, viewHeaderDesc,
    inputsWrapper } = useStyles()

  const { state: uploadState, setState: setUploadState } = useContext(UploadContext) as UploadContextType
  const {filesProcessing} = uploadState

  return <div className={container}>
    <div className={viewHeader}>
      <p>add tracks (last step)</p>
    </div>
    <div className={viewHeaderDesc}>
      <p>
        Add all tracks for UPLOAD_NAME. Files should be in WebM format with Opus audio or just regular MP3 format.
        Be aware that adding MP3 files takes more time. If files don’t have name in tags, you should also specify them
        by yourself.
      </p>
    </div>
    <div className={inputsWrapper}>
      {filesProcessing?.map((fileProcessing, i) =>
        <TrackUpload
          key={i}
          index={i}
          fileProcessing={fileProcessing}
          setFileProcessing={prepareReplaceFileProcessing(i)}
        />)}
    </div>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <Button size='s' onClick={addEmptyFileProcessing}>ADD TRACK</Button>
    </div>
  </div>

  function addEmptyFileProcessing() {
    const fileProcessing: FileProcessing = {
      mp3File: null,
      processingInProgress: false,
      processingFailure: undefined,
      processingSuccessful: false,
      name: '',
      duration: 0,
      webMFile: null,
      hash: ''
    }

    setUploadState({
      ...uploadState,
      filesProcessing: [...(uploadState.filesProcessing || []), fileProcessing]
    })
  }

  function prepareReplaceFileProcessing(index: number) {
    return function replaceFileProcessing (fileProcessing: FileProcessing) {
      setUploadState({
        ...uploadState,
        filesProcessing: filesProcessing?.map((fp, i) => i !== index ? fp : fileProcessing)
      })
    }
  }
}



const useStyles = createUseStyles({
  '@keyframes container-enter': {
    from: {transform: 'translateX(-25%)'},
    to: {transform: 'translateX(0)'},
  },
  container: {
    marginTop: '.5rem',
    display: 'grid',
    gridRowGap: '1rem',
    gridColumnGap: '1rem',
    animation: '.2s ease-in',
    animationName: '$container-enter'
  },
  viewHeader: {
    color: theme.colors.primary,
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  viewHeaderDesc: {
    fontSize: '.625rem'
  },
  inputsWrapper: {
    display: 'grid',
    gridRowGap: '1rem',
    '& input': {
      textAlign: 'center',
      fontWeight: 600,
      width: '100%'
    }
  },
  loadTrackInputWrapper: {
    position: 'relative',
    '& button': {
      position: 'absolute',
      top: '.25rem',
      right: '.25rem'
    }
  }
})