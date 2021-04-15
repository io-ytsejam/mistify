import React, {ChangeEvent, useEffect, useState} from "react";
import { v4 as uuid } from 'uuid';
import Button from "../Button";
import Player from "../Player";
import queueProcessing, {convertMP3ToOpus, createWebM, readTags} from "./prepareWebM";
import TrackUpload from "./TrackUpload";
import Input from "../Input";
import Dexie from "dexie";
import MainDB, {IMusicGroup} from "../MainDB";

export default function UploadMusic() {
  const [filesProcessing, setFilesProcessing] = useState<Array<FileProcessing>>([])
  const [chunks, setChunks] = useState<Array<ArrayBuffer>>([])
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [artistName, setArtistName] = useState('')

  useEffect(readMusicGroupTags, [filesProcessing])
  useEffect(function () {
    if (!filesProcessing.length) return;
    if (filesProcessing.some(({processingSuccessful}) => !processingSuccessful)) return

    const musicGroups = filesProcessing
      .flatMap(({musicGroup}) =>
        musicGroup === null ? [] : [musicGroup])

    const reducedMusicGroupWithTracks: MusicGroup = {
      ...musicGroups[0],
      tracks: musicGroups.flatMap(({tracks}) => tracks)
    }





    const webMsWithHashes = filesProcessing
      .filter(({musicGroup}) => musicGroup !== null)
      .flatMap(({musicGroup}) => (musicGroup as MusicGroup).tracks)
      .map(({hash: id, webM}) => ({id, webM}))


    storeLibrary(reducedMusicGroupWithTracks).then(console.log)
    storeTracks(webMsWithHashes).then(console.log)


  }, [filesProcessing])

  async function storeTracks(tracks: Array<{ id: string, webM: ArrayBuffer }>) {
    const db = new MainDB()
    await Promise.all(tracks.map(async track => await db.tracks.add(track)))
  }

  async function storeLibrary(library: MusicGroup) {
    const data = {
      ...library,
      tracks: library.tracks.map(({hash}) => hash)
    }

    const db = new MainDB()
    await db.library.add(data)
  }

  function readMusicGroupTags() {
    if (!filesProcessing.length) return
    const {mp3File} = filesProcessing[filesProcessing.length - 1]
    if (!mp3File) return;
    readTags(mp3File)
      .then(({album, artist}) => {
        setArtistName(artist || '')
        setGroupName(album || '')
      })
  }

  function prepareReplaceFileProcessing(index: number) {
    return function replaceFileProcessing (fileProcessing: FileProcessing) {
      setFilesProcessing(filesProcessing =>
        filesProcessing.map((fp, i) => i !== index ? fp : fileProcessing)
      )
    }
  }

  function addEmptyFileProcessing() {
    const fileProcessing: FileProcessing = {
      mp3File: null,
      processingInProgress: false,
      processingFailure: undefined,
      processingSuccessful: false,
      musicGroup: null,
      name: '',
      duration: 0
    }

    setFilesProcessing((files: Array<FileProcessing>) => [...files, fileProcessing])
  }

  return <div style={{display: 'flex', flexDirection: 'column', overflowY: 'scroll'}}>
    <Input
      value={artistName}
      onChange={({target}) => setArtistName(target.value)}
      placeholder='Artist'
    />
    <Input
      value={groupName}
      onChange={({target}) => setGroupName(target.value)}
      placeholder='Album'
    />

    {filesProcessing.map((fileProcessing, index) => (
      <TrackUpload
        key={index}
        index={index}
        fileProcessing={fileProcessing}
        setFileProcessing={prepareReplaceFileProcessing(index)}
      />
    ))}
    <Button
      size='m'
      onClick={addEmptyFileProcessing}
    >Add track</Button>
    {filesProcessing ? <Button
      onClick={startProcessing}
      size={'m'}
    >ACCEPT</Button> : null}
  </div>

  async function startProcessing() {
    setFilesProcessing(filesProcessing =>
      filesProcessing.map(fp => ({...fp, processingInProgress: true}))
    )
    await queueProcessing(0, filesProcessing, handleSuccess, handleFailure)

    async function handleSuccess(fileProcessing: FileProcessing, webM: ArrayBuffer) {
      const {mp3File} = fileProcessing
      const hash = await crypto.subtle.digest('sha-256', mp3File as ArrayBuffer)

      const hashArray = Array.from(new Uint8Array(hash));
      const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setFilesProcessing(filesProcessing =>
        filesProcessing.map(fp => {
          if (fp.mp3File !== mp3File) return fp
          else {
            const musicGroup: MusicGroup = {
            ...(fp.musicGroup),
                tracks: [...(fp.musicGroup?.tracks || []), {webM, hash: hashString}],
                artist: artistName,
                groupName: groupName,
                groupType: 'LP',
                id: uuid(),
                owner: localStorage.getItem('id') || ''
            }

            return {...fp, musicGroup,
              processingSuccessful: true, processingInProgress: false}
          }
        })
      )
    }

    function handleFailure(fileProcessing: FileProcessing, processingFailure: Error) {
      const {mp3File} = fileProcessing
      setFilesProcessing(filesProcessing => (
        filesProcessing.map(fp => fp.mp3File !== mp3File ? fp :
          {...fp, processingFailure, processingInProgress: false})
      ))
    }
  }
}

function repeatNTimes (arr: Array<any>): Array<any> {
  return Array(arr.length).fill(0).map((v, _) => v)
}
