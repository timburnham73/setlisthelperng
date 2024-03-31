import { Timestamp } from "firebase-admin/firestore"
import { BaseUser, UserHelper } from "./user"
import { Tag } from "./tag"
export interface SLHTag {
    Deleted: boolean
    TagId: number
    Name: string
    LastEdit: string
    songs: number[]
}

export class SLHTagHelper {
    static slhTagToTag(slhTag: SLHTag, editingUser: BaseUser): Tag {
      const nowTimestamp = Timestamp.now();
      return {
        name: slhTag.Name ?? "",
        lastEdit: nowTimestamp,
        lastUpdatedByUser : UserHelper.getForUpdate(editingUser),
        dateCreated: nowTimestamp,
        createdByUser: UserHelper.getForUpdate(editingUser),
        
      };
    }
  }