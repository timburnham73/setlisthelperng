import { Timestamp } from "firebase-admin/firestore";
import { Base } from "./base";
import { BaseUser } from "./user";

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
  transpose: number;
  documentLocation: string;
  audioLocation: string;
}

export interface AccountLyric extends Lyric {
  accountId?: string;
}

export class LyricHelper {
  static getForAdd(data: Partial<Lyric>, editingUser: BaseUser): Lyric {
    const lyricForAdd = {
      ...this.getForUpdate(data, editingUser),
      dateCreated: Timestamp.now(),
      createdByUser: editingUser
    };
    return lyricForAdd;
  }

  static getForUpdate(data: Partial<Lyric>, editingUser: BaseUser): Lyric {
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
      createdByUser: data.createdByUser ?? editingUser,
      dateCreated: data.dateCreated ?? Timestamp.now(),
      lastUpdatedByUser: editingUser,
      documentLocation: data.documentLocation ?? "",
      audioLocation: data.audioLocation ?? "",
      transpose: data.transpose ?? 0
    };
  }
}
