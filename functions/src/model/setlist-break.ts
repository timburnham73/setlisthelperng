
<<<<<<< HEAD
import { Timestamp } from "@angular/fire/firestore";
=======
import { Timestamp } from "firebase-admin/firestore";
>>>>>>> 2817d526fc42602977824955de73f34d2be65f3e
import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";

export interface SetlistBreak extends Base {
   sequenceNumber: number;
   songId: string;
   isBreak: boolean;
   name: string;
}

export class SetlistBreakHelper {
   static getSetlistBreakForAddOrUpdate(setlistBreak: Partial<SetlistBreak>, editingUser: BaseUser): SetlistBreak {
      return {
         sequenceNumber: setlistBreak.sequenceNumber ?? 1,
         songId: setlistBreak.songId ?? "",
         isBreak: setlistBreak.isBreak ?? false,
         name: setlistBreak.name ?? '',
         lastEdit: Timestamp.fromDate(new Date()),
         lastUpdatedByUser: UserHelper.getForUpdate(editingUser),
         dateCreated: setlistBreak.dateCreated ?? Timestamp.fromDate(new Date()),
         createdByUser: setlistBreak.createdByUser ?? UserHelper.getForUpdate(editingUser),
      };
   }
}