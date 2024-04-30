
import { Timestamp } from "@angular/fire/firestore";
import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";

export interface SetlistBreak extends Base {
   sequenceNumber: number;
   songId: string;
   isBreak: boolean;
   name: string;
   lengthMin: number;
   lengthSec: number;
   totalTimeInSeconds: number;
   countOfSongs: number;
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
         totalTimeInSeconds: setlistBreak.totalTimeInSeconds ?? 0,
         countOfSongs: setlistBreak.countOfSongs ?? 0,
         lengthMin: setlistBreak.lengthMin ?? 10,
         lengthSec: setlistBreak.lengthSec ?? 0
      };
   }
}