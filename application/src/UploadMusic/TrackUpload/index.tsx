import React, {ChangeEvent, useState} from "react";
import {Tags} from "jsmediatags/types";
import jsmediatags from "jsmediatags";
import useStyles from "../style";
import Input from "../../Input";
import {MoonLoader} from "react-spinners";
import {css} from "@emotion/core";
import Button from "../../Button";
import {FileProcessing} from "../../types";
import {readTags} from "../prepareWebM";

interface TrackUploadProps {
  index: number
  fileProcessing: FileProcessing
  setFileProcessing: Function
}

export default function TrackUpload({index, setFileProcessing, fileProcessing}: TrackUploadProps) {
  const [title, setTitle] = useState('Title')

  const {processingInProgress, processingSuccessful, processingFailure} = fileProcessing

  function handleChange ({target}: ChangeEvent<HTMLInputElement>) {
    const file = target.files?.item(0)

    if (!file) return
    file.arrayBuffer().then(async ab => {
      const { title, artist, album } = await readTags(ab)
      setTitle(title || "Title")

      const fileProcessing: FileProcessing = {
        mp3File: ab,
        processingInProgress: false,
        processingSuccessful: false,
        processingFailure: undefined,
        musicGroup: null
      }

      setFileProcessing(fileProcessing)
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
    trackTitleInput, uploadMusic} = useStyles()

  return <div className={uploadMusic}>
    <Input
      className={trackTitleInput}
      style={{width: '100%'}}
      value={title}
      disabled={processingInProgress}
      onChange={({target}) => {
        setTitle(target.value)
      }}
    />
    {processingInProgress ? <div className={loaderPlaceholder}>
      <MoonLoader
        loading={processingInProgress}
        color={'yellow'}
        size={15}
        css={css`margin-right: 1rem;`}
      />
    </div> : processingSuccessful ? <p style={{marginRight: '1rem'}}>DONE!</p> :
      <><Button
        className={loadButton}
        onClick={handleLoad}
        size={'s'}
      >Load...</Button><Button
        className={deleteButton}
        size={'s'}
      >Delete</Button></>
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