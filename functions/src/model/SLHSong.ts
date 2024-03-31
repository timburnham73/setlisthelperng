import { Timestamp } from "firebase-admin/firestore";
import { Song } from "./song"
import { BaseUser, UserHelper } from "./user"

export enum SongType {
  Song,
  Break
}

export interface SLHArtist {
    ArtistId: number
    Name: string
    Deleted: boolean
  }
  
  export interface SLHGenre {
    GenreId: number
    Name: string
    Description: any
    Deleted: boolean
  }

export interface SLHSong {
    Blob: string
    IosAudioLocation: string
    Deleted: boolean
    NoteValue: number
    BeatValue: number
    Transpose: number
    Other: string
    YouTubeUrl: string
    SongLocation: string
    Artist: SLHArtist
    Genre: SLHGenre
    SongId: number
    SongType: SongType
    Name: string
    GenreId: number
    ArtistId: number
    SongLength: number
    Deprecated: boolean
    Key: string
    Notes: string
    Lyrics: string
    DocumentLocation: string
    CreatedByUserId: string
    LastEdit: string
    Tempo: number
    CreatedByUserName: string
  }
  
  export class SLHSongHelper {
    public static getSongLengthMinSec(SongLength) {
      return {
        minutes: Math.floor(SongLength / 60),
        seconds: SongLength % 60
      };
    }

    static slhSongToSong(slhSong: SLHSong, editingUser: BaseUser): Song {
      const nowTimestamp = Timestamp.now();
      const songLenSplit = this.getSongLengthMinSec(slhSong.SongLength);
      return {
        name: slhSong.Name ?? "",
        artist: slhSong.Artist?.Name ?? "",
        genre: slhSong.Genre?.Name ?? "",
        key: slhSong.Key ?? "",
        songLength: slhSong.SongLength ?? 0,
        tempo: slhSong.Tempo ?? 120,
        deactivated: slhSong.Deprecated ?? false,
        notes: slhSong.Notes ?? "",
        other: slhSong.Other ?? "",
        noteValue: slhSong.NoteValue ?? 0,
        beatValue: slhSong.BeatValue ?? 0,
        youTubeUrl: slhSong.YouTubeUrl ?? "",
        lastEdit: nowTimestamp,
        lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
        dateCreated: nowTimestamp,
        createdByUser: UserHelper.getForUpdate(editingUser),
        countOfLyrics: slhSong.Lyrics ? 1 : 0,
        lengthSec: songLenSplit.seconds ?? 0,
        lengthMin: songLenSplit.minutes ?? 3,
        tags: []
      };
    }
  }
  