import { Setlist } from "../model/setlist";
import { isImportInProgress } from "../utils";
import { countSetlists } from "./setlist-util";
import * as functions from "firebase-functions";

export default async (snap, context) => {
    const setlist = snap.data() as Setlist;
    const accountId = context.params.accountId;
    functions.logger.debug(`Setlist with name ${setlist.name} has been added`);

    if(await isImportInProgress(context.params.accountId)){
        return;
    }
    countSetlists(accountId);
    
}