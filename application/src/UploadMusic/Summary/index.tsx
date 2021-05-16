import {createUseStyles} from "react-jss";
import theme from "../../Theme";
import Button from "../../Button";
import ArtistPanel from "../../ArtistPanel";
import React, {useContext, useState} from "react";
import {UploadContext} from "../Upload";
import AlbumTrack from "../../Library/AlbumView/AlbumTrack";

export default function Summary () {
  const { viewHeaderDesc, viewHeader, container,
    albumPic, albumPicUpload, albumInfo, tracks } = useStyles()
  const { state: uploadState, setState: setUploadState } = useContext(UploadContext) as UploadContextType
  const { artist, album, filesProcessing } = uploadState
  const { name: albumName, type, releaseDate, artwork } = album
  const albumDuration = filesProcessing?.reduce((acc, {duration}) => acc + duration, 0)

  return <div className={container}>
    <div className={viewHeader}>
      <p>summary</p>
    </div>
    <div className={viewHeaderDesc}>
      <p>Review carefully all your input before proceeding. You can go back to any step to make changes</p>
    </div>
    <ArtistPanel
      artist={artist}
    />
    <div className={albumPicUpload}>
      <img
        className={albumPic}
        src={artwork}
        alt="Album picture"
      />
      <div className={albumInfo}>
        <div>
          <p style={{fontSize: '1rem'}}>{albumName}</p>
          <p>{releaseDate.toLocaleDateString()}</p>
        </div>
        <div>
          <p>{albumDuration}</p>
          <p>{type}</p>
        </div>
      </div>
    </div>
    <div>
      <div className={viewHeader}>
        <p>Track list</p>
      </div>
      <div className={tracks}>
        {filesProcessing?.map(({name}, i) => <AlbumTrack>{name}</AlbumTrack>)}
      </div>
    </div>
    <div>
      <Button
        style={{width: '100%'}}
        size='s'
        onClick={startUploading}
      >
        CONFIRM AND START UPLOADING
      </Button>
    </div>
  </div>

  function startUploading() {
    setUploadState(uploadState => ({
      ...uploadState,
      filesProcessing: uploadState.filesProcessing?.map(fileProcessing => ({
        ...fileProcessing,
        processingInProgress: true
      }))
    }))
  }
}

const useStyles = createUseStyles({
  '@keyframes container-enter': {
    from: {transform: 'translateX(-25%)'},
    to: {transform: 'translateX(0)'},
  },
  container: {
    marginTop: '.5rem',
    marginBottom: '4rem',
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
    borderRadius: .1875
  },
  albumPicUpload: {
    display: 'grid',
    gridTemplateColumns: '10rem auto',
    columnGap: '1rem'
  },
  albumInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: '.875rem'
  },
  tracks: {
    marginTop: '.5rem'
  }
})