import { isImportInProgress } from "../utils";
import { countSongs } from "../utils";

export default async (snap, context) => {
    if(await isImportInProgress(context.params.accountId)){
        return;
    }
    countSongs(context);
    
}