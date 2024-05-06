import { isImportInProgress } from "../utils";
import { countSetlists } from "./setlist-util";

export default async (snap, context) => {
    if(await isImportInProgress(context.params.accountId)){
        return;
    }
    countSetlists(snap, context);
    
}