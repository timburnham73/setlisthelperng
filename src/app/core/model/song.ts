import { Timestamp } from "@angular/fire/firestore";
import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";
import { SetlistRef } from "functions/src/model/setlist";

export interface UserLyric {
  uid: string;
  lyricId: string;
}
export interface Song extends Base {
  name: string;
  artist: string;
  genre: string;
  key: string;
  songLength: number;
  tempo: number;
  deactivated: boolean;
  deleted: boolean;
  notes: string;
  other: string;
  noteValue: number;
  beatValue: number;
  youTubeUrl: string;
  lengthMin: number;
  lengthSec: number;
  countOfLyrics: number;
  tags: string[];
  defaultLyricForUser: UserLyric[];
  setlists: SetlistRef[];
}

// public static getSongLengthMinSec(SongLength: number) {
//   return {
//     minutes: Math.floor(SongLength / 60),
//     seconds: SongLength % 60
//   };
// }

export class SongHelper {
  static getForAdd(song: Song, editingUser: BaseUser): Song {
    const songForAdd = this.getForUpdate(song, editingUser);
    songForAdd.createdByUser = UserHelper.getForUpdate(editingUser);
    songForAdd.dateCreated = Timestamp.fromDate(new Date());
    
    return songForAdd;
  }

  static getForUpdate(data: Song, editingUser: BaseUser): Song {
    return {
      name: data.name ?? "",
      artist: data.artist ?? "",
      genre: data.genre ?? "",
      key: data.key ?? "",
      songLength: data.songLength ?? 0,
      tempo: data.tempo ?? 120,
      deactivated: data.deactivated ?? false,
      deleted: data.deleted ?? false,
      notes: data.notes ?? "",
      other: data.other ?? "",
      noteValue: data.noteValue ?? 0,
      beatValue: data.beatValue ?? 0,
      youTubeUrl: data.youTubeUrl ?? "",
      lastEdit: Timestamp.fromDate(new Date()),
      lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
      dateCreated: data.dateCreated ?? Timestamp.fromDate(new Date()),
      createdByUser: data.createdByUser ?? UserHelper.getForUpdate(editingUser),
      lengthMin: data.lengthMin ?? 3,
      countOfLyrics: data.countOfLyrics ?? 0,
      lengthSec: data.lengthSec ?? 0,
      tags: data.tags ?? [],
      defaultLyricForUser: data.defaultLyricForUser ?? [],
      setlists: data.setlists ?? []
    };
  }
}
