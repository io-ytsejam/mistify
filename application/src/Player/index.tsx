import React, {useContext, useEffect, useState} from "react";
import {createFFmpeg} from "@ffmpeg/ffmpeg";
import {convertMP3ToOpus, createWebM} from "../UploadMusic/prepareWebM";
import {PlayerContext} from "../App";

export default function Player({chunks}: {chunks: Array<ArrayBuffer>}) {
  const [file, setFile] = useState<ArrayBuffer>()
  const {state: playerState } = useContext(PlayerContext) as PlayerContextType

  return <>
    <audio
      style={{
        position: 'absolute',
        marginTop: '.25rem',
        height: '3.5rem',
        width: 'calc(100% - 1rem)'
      }}
      src={playerState.URL}
      controls
      onError={console.log}
      onAbort={console.log}
    />
  </>
}