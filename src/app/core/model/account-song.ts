import { Song } from "./song";
import { SetlistSong } from "./setlist-song";

export interface SongEdit {
  accountId?: string;
  setlistId?: string;
  song : Song | SetlistSong;
  
}
