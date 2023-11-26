
import {Song, SongHelper} from './song';

export interface SetlistSong extends Song {
   sequenceNumber: number;
   songId: string;
   isBreak: boolean;
}

export class SetlistSongHelper{
   static getSetlistSongForAddOrUpdate(data: SetlistSong): SetlistSong {
       return {
         sequenceNumber: data.sequenceNumber ?? 1,
          songId: data.songId ?? "",
          isBreak: data.isBreak ?? false,
          ...SongHelper.getSongForAddOrUpdate(data)
       };
     }
 }