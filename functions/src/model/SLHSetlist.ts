import { Timestamp } from "firebase-admin/firestore"
import { BaseUser, UserHelper } from "./user"
import { Setlist } from "./setlist"

export interface SLHSetlist {
    Deleted: boolean
    Deprecated: boolean
    SetListId: number
    Name: string
    GigLocation: string
    DateCreated: string
    GigDate: string
    CreatedByUserName: string
    MakePublic: boolean
    CreatedByUserId: string
    LastEdit: string
    songs: number[]
}

export class SLHSetlistHelper {
    public static getSongLengthMinSec(SongLength) {
      return {
        minutes: Math.floor(SongLength / 60),
        seconds: SongLength % 60
      };
    }

    static slhSetlistToSetlist(slhSetlist: SLHSetlist, editingUser: BaseUser): Setlist {
      const nowTimestamp = Timestamp.now();
      //const gigDate = this.getSongLengthMinSec(slhSetlist.);
      return {
        name: slhSetlist.Name ?? "",
        gigDate: Timestamp.now(),//TODO: Fix git date in the setlist helper function
        gigLocation: slhSetlist.GigLocation ?? "",
        makePublic: slhSetlist.MakePublic,
        deprecated: slhSetlist.Deprecated,
        lastEdit: nowTimestamp,
        lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
        dateCreated: nowTimestamp,
        createdByUser: UserHelper.getForUpdate(editingUser),
        
      };
    }
  }