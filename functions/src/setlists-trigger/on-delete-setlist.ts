import * as functions from "firebase-functions";
import {db} from "../init";
import { Setlist } from "../model/setlist";
import { countSetlists } from "./setlist-util";
import { isImportInProgress } from "../utils";
//import { SetlistSong } from "../model/setlist-song";

export default async (snap, context) => {
    if(await isImportInProgress(context.params.accountId)){
        return;
    }
    
    const setlist = snap.data() as Setlist;
    functions.logger.debug(`Setlist with name ${setlist.name} has been deleted`);


    const setlistSongsRef = db.collection(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}/songs`);
    const setlistSongCountSnap = await setlistSongsRef.get();
    const batch = db.batch();
    setlistSongCountSnap.forEach((doc) => {
        //const setlistSongId = doc.id;
        //const setlistSong = doc.data() as SetlistSong;
        batch.delete(doc.ref);
        //functions.logger.debug(`Setlist Song with name: ${setlistSong.name} and id ${setlistSongId} has been deleted`);
    });
    batch.commit();

    countSetlists(snap, context);
}