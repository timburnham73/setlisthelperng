import {db} from "../init";
import { isImportInProgress } from "../utils";

export const countSetlists = async (accountId) => {
    if(await isImportInProgress(accountId)){
        return;
    }
    
    const setlistsRef = db.collection(`/accounts/${accountId}/setlists`);
    
    const accountRef = db.doc(`/accounts/${accountId}`);
    
    //Get the snapshot count of lyrics for the song.
    const setlistCountSnap = await setlistsRef.count().get();
    
    //Update the lyric count on the master song
    accountRef.update({countOfSetlists: setlistCountSnap.data().count});
}