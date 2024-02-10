import { Song } from "./song";
import { SetlistSong } from "./setlist-song";

export interface SongEdit {
  accountId?: string;
  song : Song | SetlistSong;
  
}
