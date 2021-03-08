import {useEffect, useState} from "react";
import {createFFmpeg} from "@ffmpeg/ffmpeg";

export default function Player({chunks}: {chunks: Array<ArrayBuffer>}) {
  const [file, setFile] = useState<ArrayBuffer>()
  const mediaSource = new MediaSource()

  let buffer: SourceBuffer;

  mediaSource.onsourceopen = function () {
    buffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');

    if (file) {

      // buffer.onupdateend = () => mediaSource.endOfStream()
      // mediaSource.setLiveSeekableRange(1, 120)
    }
  }

  let i = 0
  const ffmpeg = createFFmpeg()

  return <>
    <audio
      src={URL.createObjectURL(mediaSource)}
      controls
      onError={console.log}
      onAbort={console.log}
      onPlay={() => {
        if (file) {
          let i = 0

          setInterval(() => {
            buffer.appendBuffer(file.slice(i, i += 100000))
          }, 1000)
        }
      }}
    />
    <input
      type="file"
      onChange={(event) => {
        const fileList = event.target.files;
        console.log(fileList);
        if (fileList) {
          fileList[0].arrayBuffer().then(ab => {
            setFile(ab)
            convertMp3ToOpusAndCreateWebM(ab)
          })
        }
      }}
    />
  </>



  async function convertMP3ToOpus(mp3: ArrayBuffer): Promise<Uint8Array> {
    await ffmpeg.load()
    ffmpeg.FS('writeFile', 'test.mp3', new Uint8Array(mp3))
    await ffmpeg.run("-i", "test.mp3", "-c:a", "libopus", "out.opus")
    console.log('CONVERT COMPLETED')
    return ffmpeg.FS('readFile', 'out.opus')
  }

  async function createWebM(opus: Uint8Array): Promise<ArrayBuffer> {
    ffmpeg.FS('writeFile', 'test.opus', opus)
    await ffmpeg.run("-i", "test.opus", "-c:v", "libvpx", "-c:a", "libopus", "out.opus", "-f", "webm", "streamable.webm")
    console.log('MUXING COMPLETED')
    return ffmpeg.FS('readFile', 'streamable.webm').buffer
  }

  async function convertMp3ToOpusAndCreateWebM(mp3: ArrayBuffer) {
    const opus = await convertMP3ToOpus(mp3)
    const streamable = await createWebM(opus)

    console.log(streamable)

    setFile(streamable)

    /*worker.onmessage = function(e) {
      const msg = e.data;
      switch (msg.type) {
        case "ready":
          worker.postMessage({
            type: "run",
            MEMFS: [{name: "test.mp3", data: new Uint8Array(mp3)}],
            arguments: ["-i", "test.mp3", "-c:a", "libopus", "out.opus"]});
          break;
        case "stdout":
          console.log(msg.data);
          break;
        case "stderr":
          console.log(msg.data);
          break;
        case "done":
          console.log(msg.data);
          break;
      }
    };*/

    /*const result = ffmpeg({
      MEMFS: [{name: "test.mp3", data: new Uint8Array(mp3)}],
      arguments: ["-i", "test.mp3", "-c:a", "libopus", "out.opus"],
    });

    console.log(result.MEMFS)*/
  }

  function googleDemo() {
    let i = 0
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const {result} = e.target || {}
        if (result instanceof ArrayBuffer) {
          buffer.appendBuffer(new Uint8Array(result))
        }
      }

      const blob = new Blob([new Uint8Array(file)], {
        type: 'video/webm'
      });

      reader.onerror = console.log

      reader.readAsArrayBuffer(blob.slice(0, 1000000))
    }
    /*setInterval(() => {
      if (file) {
        buffer.appendBuffer(file.slice(i, i += 500))
      }
    }, 1000)*/
  }
}