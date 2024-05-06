import * as functions from "firebase-functions";
import { Song } from "../model/song";
import {db} from "../init";
import { countSongs } from "../utils";
import { SetlistSong } from "../model/setlist-song";
import { isImportInProgress, updateParentSongSetlistRef } from "../utils";


export default async (snap, context) => {
    const accountId = context.params.accountId;
    if(await isImportInProgress(accountId)){
        return;
    }
    const song = snap.after.data() as Song;
    song.id = snap.after.id;
    functions.logger.debug(`Song that was updated. ${song.id}`);
    countSongs(context);

    //If the song was updated by the Setlist Song function updateParentSongSetlistRef, do not run the code below. 
    //This means the setlist song update was already run so do not do it again.
    if(song.doNotUpdateSetlistSongs === false){
        const setlistSongSnap = await db.collectionGroup(`songs`).where('songId', '==', song.id)
                                                                .where('saveChangesToRepertoire', '==', true)
                                                                .get();
        
        setlistSongSnap.forEach(async (doc) => {
            const setlistSongPath = doc.ref.path;
            const modifiedSong = { ...song } as SetlistSong;
            await updateSetlistSong(setlistSongPath, modifiedSong);
        });
    }

    //Update the setlist count
    await updateParentSongSetlistRef(accountId, song.id);
    
    //Remove the doNotUpdateSetlistSongs flag
    const songRef = db.doc(`/accounts/${context.params.accountId}/songs/${song.id}`);
    songRef.update({ doNotUpdateSetlistSongs: false });
}

async function updateSetlistSong(setlistSongPath: string, modifiedSong: SetlistSong) {
    const setlistSongDoc = db.doc(setlistSongPath);
    const res = await setlistSongDoc.get();
    const setlistSongToUpdate = res.data();
    if (setlistSongToUpdate) {
        setlistSongDoc.update(modifiedSong);
    }
}
