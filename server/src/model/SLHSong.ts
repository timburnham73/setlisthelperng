import { Song } from "./song"
import { BaseUser, UserHelper } from "./user"

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
    SongType: number
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
    static slhSongToSong(slhSong: SLHSong, editingUser: BaseUser): Song {
      return {
        name: slhSong.Name ?? "",
        artist: slhSong.Artist?.Name ?? "",
        genre: slhSong.Genre.Name ?? "",
        key: slhSong.Key ?? "",
        songLength: slhSong.SongLength ?? 0,
        tempo: slhSong.Tempo ?? 120,
        deactivated: slhSong.Deprecated ?? false,
        notes: slhSong.Notes ?? "",
        other: slhSong.Other ?? "",
        noteValue: slhSong.NoteValue ?? 0,
        beatValue: slhSong.BeatValue ?? 0,
        youTubeUrl: slhSong.YouTubeUrl ?? "",
        lastEdit: 0, //Timestamp.fromDate(new Date()),
        lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
        dateCreated: Timestamp.fromDate(new Date()),
        createdByUser: UserHelper.getForUpdate(editingUser),
        countOfLyrics: slhSong.Lyrics ? 1 : 0,
        lengthSec: slhSong.SongLength ?? 0,
        lengthMin: slhSong.SongLength ?? 0,
      };
    }
  }
  