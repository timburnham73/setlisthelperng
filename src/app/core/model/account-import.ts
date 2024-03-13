import { Timestamp } from "@angular/fire/firestore";
import { BaseUser, UserHelper } from "./user";
import { Base } from "./base";

export interface AccountImport extends Base {
    username: string;
    jwtToken: string;
    importLog : [];
    
  }

  export class AccountImportHelper{
    static getForAdd(user: BaseUser, account: AccountImport): AccountImport {
      const accountForAdd = this.getForUpdate(user, account);
      accountForAdd.dateCreated = Timestamp.fromDate(new Date());
      accountForAdd.createdByUser = user;
      return accountForAdd;
    }
  
    static getForUpdate(user: BaseUser, data: AccountImport): AccountImport {
          return {
            username: data.username ?? "",
            createdByUser: data.createdByUser ?? "",
            dateCreated: data.dateCreated ?? "",
            lastEdit: Timestamp.fromDate(new Date()),
            lastUpdatedByUser: user,
            jwtToken: data.jwtToken ?? "",
            importLog: data.importLog ?? []
          };
        }
  }