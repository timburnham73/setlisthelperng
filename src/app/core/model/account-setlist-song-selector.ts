import { Setlist } from "./setlist";

export interface AccountSetlistSongSelector {
  accountId: string;
  setlistId : string;
  setlistsongIdToinsertAfter: number;
}
