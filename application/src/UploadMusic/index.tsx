import {ChangeEvent, useState} from "react";
import Button from "../Button";
import jsmediatags from 'jsmediatags'
import Player from "../Player";

export default function UploadMusic() {
  const [numberOfFiles, setNumberOfFiles] = useState(10)
  const [files, setFiles] = useState<Array<File>>([])
  const [chunks, setChunks] = useState<Array<ArrayBuffer>>([])

  return <div>
    <Player chunks={chunks} />
    {repeatNTimes(numberOfFiles).map(i =>
      <input type='file' onChange={handleChange} key={i} />
    )}
    <div>
      <Button size='s'>Add file</Button>
      <Button size='s' onClick={handleUpload}>Upload files</Button>
    </div>
  </div>

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    console.log(fileList);
    if (fileList)
      setFiles(files => [...files, fileList[0]])
  }

  function handleUpload() {
    files.forEach(file => {
      file.arrayBuffer()
        .then(createParts)
        .then(setChunks)

      jsmediatags.read(file, {
        onSuccess: function(tag) {
          console.log(tag);
        },
        onError: function(error) {
          console.log(':(', error.type, error.info);
        }
      });
    })
  }
}

function repeatNTimes (n: number) {
  return Array(n).fill(0).map((_, i) => i)
}

function createParts(file: ArrayBuffer) {
  // @ts-ignore
  const mp4boxfile = window.MP4Box.createFile()

  mp4boxfile.onError = console.log

  mp4boxfile.onMoovStart = function () {
    console.log("Starting to receive File Information");
  }

  const SAMPLE_DIFF = 500

  return new Promise<Array<ArrayBuffer>>((resolve => {
    mp4boxfile.onReady = function(info: any) {

      const {nb_samples} = info.tracks[0]
      const chunks: Array<ArrayBuffer> = []

      console.log(info)
      mp4boxfile.onSegment = function (id: any, user: any, buffer: any, sampleNumber: any, last: any) {
        console.log({id, user, buffer, sampleNumber, last})
        chunks.push(buffer)
        if (sampleNumber + SAMPLE_DIFF >= nb_samples) {
          resolve(chunks)
        }
      }
      mp4boxfile.setSegmentOptions(info.tracks[0].id, "test-user", { nbSamples: SAMPLE_DIFF });
      const initSegs = mp4boxfile.initializeSegmentation();
    };

    // @ts-ignore
    file.fileStart = 0
    mp4boxfile.appendBuffer(file)
    mp4boxfile.start()
    mp4boxfile.flush()

  }))
}