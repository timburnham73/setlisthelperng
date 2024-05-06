import * as functions from "firebase-functions";
import { isImportInProgress } from "../utils";
import { countSongs } from "../utils";

export default async (snap, context) => {
    if(await isImportInProgress(context.params.accountId)){
        return;
    }

    functions.logger.debug(`Counting songs on add song.`);
    countSongs(context.params.accountId);
    
}