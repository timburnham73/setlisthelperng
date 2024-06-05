import { Timestamp } from "@angular/fire/firestore";
import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";
import { LyricFormat } from "./lyric-format";

//The scope of where to load the saved lyric format
export enum FormatScope {
  LYRIC,
  USER,
  ACCOUNT
} 

export interface Lyric extends Base {
  name: string;
  key: string;
  tempo: number;
  notes: string;
  noteValue: number;
  beatValue: number;
  youTubeUrl: string;
  songId: string;
  lyrics: string;
  defaultLyricForUser: string[];
  documentLocation: string;
  audioLocation: string;
  transpose: number;
  formatScope?: FormatScope;
  formatSettings?: LyricFormat;
}

export interface AccountLyric extends Lyric {
  accountId?: string;
}

export class LyricHelper {
  static getForAdd(data: Lyric, editingUser: BaseUser): Lyric {
    const lyricForAdd = {
      ...this.getForUpdate(data, editingUser),
      dateCreated: Timestamp.fromDate(new Date()),
      createdByUser: editingUser
    };
    return lyricForAdd;
  }

  static getForUpdate(data: Lyric, editingUser: BaseUser): Lyric {
    return {
      name: data.name ?? "",
      lyrics: data.lyrics ?? "",
      key: data.key ?? "",
      tempo: data.tempo ?? 120,
      notes: data.notes ?? "",
      lastEdit: Timestamp.now(),
      noteValue: data.noteValue ?? 0,
      beatValue: data.beatValue ?? 0,
      youTubeUrl: data.youTubeUrl ?? "",
      songId: data.songId ?? "",
      defaultLyricForUser: data.defaultLyricForUser ?? [],
      createdByUser: data.createdByUser ?? editingUser,
      dateCreated: data.dateCreated ?? Timestamp.now(),
      lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
      documentLocation: data.documentLocation ?? "",
      audioLocation: data.audioLocation ?? "", 
      transpose: data.transpose ?? 0,
      formatScope: data.formatScope ?? FormatScope.ACCOUNT,
      formatSettings: data.formatSettings ?? undefined

    };
  }
}
