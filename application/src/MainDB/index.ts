import Dexie from "dexie";

export default class MainDB extends Dexie {
  library: Dexie.Table<IMusicGroup, string>
  tracks: Dexie.Table<ITracks, string>

  constructor () {
    super("MainDB");
    this.version(2).stores({
      library: "[owner+artist+groupName], id, groupType, tracks, owner",
      tracks: "&id"
    });

    this.library = this.table("library");
    this.tracks = this.table("tracks")
  }
}

interface IMusicGroup {
  id?: string
  owner: string
  artist: string
  groupType: string
  groupName: string
  tracks: Array<string>
}

interface ITracks {
  id?: string
  webM: ArrayBuffer
}

export type {IMusicGroup}