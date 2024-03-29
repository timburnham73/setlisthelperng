
import { Timestamp } from "@angular/fire/firestore";
import { Base } from "./base";
import { BaseUser, UserHelper } from "./user";

export interface SetlistBreak extends Base {
   sequenceNumber: number;
   id: string;
   isBreak: boolean;
   name: string;
   notes: string;
   breakTime: number;
}

export class SetlistBreakHelper {
   static getSetlistBreakForAddOrUpdate(setlistBreak: Partial<SetlistBreak>, editingUser: BaseUser): SetlistBreak {
      return {
         sequenceNumber: setlistBreak.sequenceNumber ?? 1,
         id: setlistBreak.id ?? "",
         isBreak: setlistBreak.isBreak ?? false,
         name: setlistBreak.name ?? '',
         notes: setlistBreak.notes ?? '',
         breakTime: setlistBreak.breakTime ?? 0,
         lastEdit: Timestamp.fromDate(new Date()),
         lastUpdatedByUser: UserHelper.getForUpdate(editingUser),
         dateCreated: setlistBreak.dateCreated ?? Timestamp.fromDate(new Date()),
         createdByUser: setlistBreak.createdByUser ?? UserHelper.getForUpdate(editingUser),
      };
   }
}