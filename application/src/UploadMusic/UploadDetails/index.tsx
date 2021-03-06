import theme from "../../Theme";
import { createUseStyles } from "react-jss";
import Button from "../../Button";
import React, { ChangeEvent, useContext } from "react";
import Input from "../../Input";
import { UploadContext } from "../Upload";

export default function UploadDetails () {
  const uploadContextWithReducer = useContext(UploadContext)
  if (uploadContextWithReducer === undefined) throw new Error('Context must be provided')
  const { state: uploadState, setState: setUploadState } = uploadContextWithReducer
  const { album } = uploadState
  const { artwork } = album
  let fileInput: HTMLInputElement
  const { container, viewHeader, viewHeaderDesc,
    albumPic, albumPicUpload,
    buttonWrapper, inputsWrapper } = useStyles({ artwork })

  function setFileInput(input: HTMLInputElement) {
    fileInput = input
  }

  return <div className={container}>
    <div className={viewHeader}>
      <p>specify upload</p>
    </div>
    <div className={viewHeaderDesc}>
      <p>Every upload must be grouped by some type</p>
    </div>
    <div className={albumPicUpload}>
      {artwork && <div className={albumPic}>
          <img src={artwork} alt="Album"/>
      </div>}
      <div className={buttonWrapper}>
        <Button
          onClick={() => fileInput.click()}
          size='s'
        >
          LOAD PICTURE
        </Button>
        <input
          type="file"
          hidden
          ref={setFileInput}
          onChange={onFileInputChange}
        />
      </div>
    </div>
    <div className={inputsWrapper}>
      <Input
        required
        placeholder='Name*'
        onChange={handleNameChange}
        value={uploadState.album.name}
      />
      <select
        required
        onChange={handleTypeChange}
        value={uploadState.album.type}
        placeholder='Album type*'
      >
        <option value="lp">LP</option>
        <option value="ep">EP</option>
        <option value="single">Single</option>
      </select>
      <Input
        required
        type='date'
        placeholder='Release date*'
        onChange={handleReleaseDateChange}
        value={
          uploadState.album.releaseDate
            .toLocaleDateString()
            .split('.')
            .reverse()
            .map(part => part.length === 1 ? '0' + part : part)
            .join('-')}
      />
    </div>
  </div>

  function onFileInputChange({ target }: ChangeEvent<HTMLInputElement>) {
    const { files } = target
    if (!files) return
    files[0].arrayBuffer().then(ab => {
      setUploadState(state => ({
        ...state,
        album: {
          ...state.album,
          artwork: URL.createObjectURL(new Blob([ab] ))
        }
      }))
    })
  }

  function handleNameChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      album: {
        ...uploadState.album,
        name: target.value
      },
      validation: {
        ...uploadState.validation,
        album: {
          ...uploadState.validation.album,
          name: target.checkValidity()
        }
      }
    })
  }

  function handleTypeChange({target}: React.ChangeEvent<HTMLSelectElement>) {
    setUploadState({
      ...uploadState,
      album: {
        ...uploadState.album,
        type: target.value as 'lp'|'ep'|'single'
      },
      validation: {
        ...uploadState.validation,
        album: {
          ...uploadState.validation.album,
          type: target.checkValidity()
        }
      }
    })
  }

  function handleReleaseDateChange({target}: React.ChangeEvent<HTMLInputElement>) {
    setUploadState({
      ...uploadState,
      album: {
        ...uploadState.album,
        releaseDate: new Date(target.value)
      },
      validation: {
        ...uploadState.validation,
        album: {
          ...uploadState.validation.album,
          releaseDate: target.checkValidity()
        }
      }
    })
  }
}

const useStyles = createUseStyles({
  '@keyframes container-enter': {
    from: { transform: 'translateX(-25%)' },
    to: { transform: 'translateX(0)' },
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
    fontSize: '.8125rem'
  },
  albumPic: {
    width: '10rem',
    height: '10rem',
    boxShadow: '0 0 .5rem black',
    borderRadius: .1875,
    '& img': {
      width: '100%',
      height: '100%'
    }
  },
  albumPicUpload: {
    display: 'grid',
    gridTemplateColumns: props => props.artwork ? '10rem auto' : 'none',
    columnGap: '1rem'
  },
  loadPictureButtonHelperText: {
    fontSize: '.625rem',
    textAlign: 'center',
    position: 'absolute',
    top: '2rem'
  },
  buttonWrapper: {
    display: "flex",
    position: 'relative',
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    '& button': {
      marginBottom: '.5rem'
    }
  },
  inputsWrapper: {
    display: 'grid',
    gridRowGap: '1rem',
    '& input': {
      textAlign: 'center',
      fontWeight: 600,
      width: '100%'
    },
    '& select': {
      fontSize: '1rem',
      backgroundColor: theme.colors.secondaryLight,
      color: "white",
      borderRadius: '3px',
      border: "2px solid #292929",
      boxShadow: '0 0 .5rem #272727',
      height: "2rem",
      padding: '.25rem',
      outline: "none",
      '&:hover': {
        filter: 'brightness(1.2)'
      },
      '&:focus': {
        border: "2px solid #ffccbc",
      }
    }
  }
})