import { LyricFormat } from "./lyric-format";

export interface BaseUser {
  uid: string; //This is the user ID that comes from the firebase auth.
  displayName: string;
  email: string;
  photoUrl?: string;
  formatSettings?: LyricFormat;
}

export interface  User extends BaseUser {
  id?: string; //This is the id/key of the document
}

export class UserHelper {
  static getForUpdate(data: User): BaseUser {
    const baseUser = { 
      uid: data.uid ?? "", 
      displayName: data.displayName ?? "", 
      email: data.email ?? "",
      photoUrl: data.photoUrl ?? undefined,
      formatSettings: data.formatSettings ?? undefined
    };
    if(baseUser.photoUrl === undefined){
      delete baseUser.photoUrl;
    }
    return baseUser;
  }
  
}
