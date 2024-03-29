
import { Timestamp } from "firebase-admin/firestore";
import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";

export interface SetlistBreak extends Base {
   sequenceNumber: number;
   isBreak: boolean;
   name: string;
   notes: string;
   breakTime: number;
}

export class SetlistBreakHelper {
   //Just exclude the id
   static getSetlistBreakForAdd(setlistBreak: Partial<SetlistBreak>, editingUser: BaseUser): Partial<SetlistBreak> {
      return {
         sequenceNumber: setlistBreak.sequenceNumber ?? 1,
         isBreak: true,
         name: setlistBreak.name ?? '',
         notes: setlistBreak.notes ?? '',
         breakTime: setlistBreak.breakTime ?? 0,
         lastEdit: Timestamp.now(),
         lastUpdatedByUser: UserHelper.getForUpdate(editingUser),
         dateCreated: Timestamp.now(),
         createdByUser: Timestamp.now(),
      };
   }
}