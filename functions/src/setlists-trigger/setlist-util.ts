import {db} from "../init";

export const countSetlists = async (accountId) => {
    const setlistsRef = db.collection(`/accounts/${accountId}/setlists`);
    
    const accountRef = db.doc(`/accounts/${accountId}`);
    
    //Get the snapshot count of lyrics for the song.
    const setlistCountSnap = await setlistsRef.count().get();
    
    //Update the lyric count on the master song
    accountRef.update({countOfSetlists: setlistCountSnap.data().count});
}