import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";
import { Timestamp } from "firebase-admin/firestore";

export interface Song extends Base {
  name: string;
  artist: string;
  genre: string;
  key: string;
  songLength: number;
  tempo: number;
  deactivated: boolean;
  notes: string;
  other: string;
  noteValue: number;
  beatValue: number;
  youTubeUrl: string;
  lengthMin: number;
  lengthSec: number;
  countOfLyrics: number;
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
    songForAdd.dateCreated = Timestamp.now();
    
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
      notes: data.notes ?? "",
      other: data.other ?? "",
      noteValue: data.noteValue ?? 0,
      beatValue: data.beatValue ?? 0,
      youTubeUrl: data.youTubeUrl ?? "",
      lastEdit: Timestamp.now(),
      lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
      dateCreated: data.dateCreated ?? Timestamp.now(),
      createdByUser: data.createdByUser ?? UserHelper.getForUpdate(editingUser),
      lengthMin: data.lengthMin ?? 3,
      countOfLyrics: data.countOfLyrics ?? 0,
      lengthSec: data.lengthSec ?? 0,
    };
  }
}