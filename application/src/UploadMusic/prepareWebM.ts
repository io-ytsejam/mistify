import {createFFmpeg, FFmpeg} from "@ffmpeg/ffmpeg";
import {Tags} from "jsmediatags/types";
import jsmediatags from "jsmediatags";

let ffmpeg: FFmpeg

export async function convertMP3ToOpus(mp3: ArrayBuffer): Promise<Uint8Array> {
  if (!ffmpeg) ffmpeg = createFFmpeg()
  if (!ffmpeg.isLoaded()) await ffmpeg.load()
  const FFMPEG_ARGS = ["-i", "test.mp3", "-c:a", "libopus", "out.opus"]
  ffmpeg.FS('writeFile', 'test.mp3', new Uint8Array(mp3))
  await ffmpeg.run(...FFMPEG_ARGS)
  console.log('CONVERTING COMPLETED')
  return ffmpeg.FS('readFile', 'out.opus')
}

export async function createWebM(opus: Uint8Array): Promise<ArrayBuffer> {
  const FFMPEG_ARGS = [
    "-i", "test.opus", "-row-mt", "1", "-c:v", "libvpx",
    "-c:a", "libopus", "out.opus", "-f", "webm", "streamable.webm"
  ]
  ffmpeg.FS('writeFile', 'test.opus', opus)
  await ffmpeg.run(...FFMPEG_ARGS)
  console.log('MUXING COMPLETED')
  return ffmpeg.FS('readFile', 'streamable.webm').buffer
}

type onSuccessCallback = (fileProcessing: FileProcessing, webM: ArrayBuffer) => Promise<void>
type onFailureCallback = (fileProcessing: FileProcessing, processingFailure: Error) => void

export default async function queueProcessing(i = 0, filesProcessing: Array<FileProcessing>, onSuccess: onSuccessCallback, onFailure: onFailureCallback): Promise<undefined> {
  if (i === filesProcessing.length) return
  const {processingSuccessful, processingFailure} = filesProcessing[i]

  if (processingSuccessful || processingFailure)
    return queueProcessing(++i, filesProcessing, onSuccess, onFailure)

  try {
    const opus = await convertMP3ToOpus(filesProcessing[i].mp3File as ArrayBuffer)
    const webM = await createWebM(opus)
    await onSuccess(filesProcessing[i], webM)
    console.log({webM})
    await queueProcessing(++i, filesProcessing, onSuccess, onFailure)
  } catch (processingFailure) {
    console.log(processingFailure)
    onSuccess(filesProcessing[i], processingFailure)
  }
}

export function readTags(file: ArrayBuffer): Promise<Tags> {
  return new Promise(((resolve, reject) => {
    jsmediatags.read(new Blob([file]), {
      onSuccess: function(tag) {
        resolve(tag.tags)
      },
      onError: function(error) {
        reject(new Error(error.type + error.info))
      }
    });
  }))
}