import * as functions from "firebase-functions";
import {db} from "../init";
import { Setlist } from "../model/setlist";

export const countSetlists = async (snap, context) => {
    const setlist = snap.data() as Setlist;
    functions.logger.debug(`Setlist with name ${setlist.name} has been added`);


    const setlistsRef = db.collection(`/accounts/${context.params.accountId}/setlists`);
    
    const accountRef = db.doc(`/accounts/${context.params.accountId}`);
    
    //Get the snapshot count of lyrics for the song.
    const setlistCountSnap = await setlistsRef.count().get();
    
    //Update the lyric count on the master song
    accountRef.update({countOfSetlists: setlistCountSnap.data().count});
}