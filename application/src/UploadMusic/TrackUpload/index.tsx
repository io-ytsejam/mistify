import React, {ChangeEvent, useState} from "react";
import {Tags} from "jsmediatags/types";
import jsmediatags from "jsmediatags";
import useStyles from "../style";
import Input from "../../Input";
import {MoonLoader} from "react-spinners";
import {css} from "@emotion/core";
import Button from "../../Button";
import {readTags} from "../prepareWebM";
import Clear from "@material-ui/icons/Clear";

export default function TrackUpload({index, setFileProcessing, fileProcessing}: TrackUploadProps) {
  const [loaded, setLoaded] = useState(false)
  const { name } = fileProcessing

  const { processingInProgress, processingSuccessful } = fileProcessing

  function handleChange ({target}: ChangeEvent<HTMLInputElement>) {
    const file = target.files?.item(0)

    if (!file) return
    file.arrayBuffer().then(handleBinaryTrack)

    async function handleBinaryTrack(ab: ArrayBuffer) {
      const { title: name = 'Title' } = await readTags(ab)
      const fileProcessing: FileProcessing = {
        mp3File: ab,
        processingInProgress: false,
        processingSuccessful: false,
        processingFailure: undefined,
        name,
        duration: await getTrackDuration(ab),
        hash: '',
        webMFile: null
      }

      setLoaded(true)
      setFileProcessing(fileProcessing)
      console.log({ duration: await getTrackDuration(ab)})
    }
  }

  function getTrackDuration(track: ArrayBuffer): Promise<number> {
    return new Promise(resolve => {
      const audio = new Audio()

      audio.oncanplaythrough = () => resolve(audio.duration)
      audio.src = URL.createObjectURL(new Blob([track]))
    })
  }

  let fileInputHandler: HTMLInputElement

  function setFileHandlerRef(el: HTMLInputElement) {
    fileInputHandler = el
  }

  function handleLoad() {
    fileInputHandler.click()
  }

  const {deleteButton, loadButton, loaderPlaceholder,
    trackTitleInput, uploadMusic, loadTrackInputWrapper} = useStyles()

  return <div className={uploadMusic}>
    <div className={loadTrackInputWrapper}>
      <Input
        key={Math.random()}
        value={name || 'Load...'}
        disabled={processingInProgress}
        onChange={({target}) => {
          setFileProcessing({...fileProcessing, name: target.value})
        }}
        onClick={!loaded ? handleLoad : undefined}
        style={{ cursor: !loaded ? 'pointer' : 'initial' }}
      />
      <Button variant='secondIcon' size='s'><Clear /></Button>
    </div>
    {processingInProgress ? <div className={loaderPlaceholder}>
      <MoonLoader
        loading={processingInProgress}
        color={'yellow'}
        size={15}
        css={css`margin-right: 1rem;`}
      />
    </div> : processingSuccessful ? <p style={{marginRight: '1rem'}}>DONE!</p> : null
    }
    <input
      accept='audio/mpeg'
      style={{display: "none"}}
      ref={setFileHandlerRef}
      type="file"
      onChange={handleChange}
    />
  </div>
}