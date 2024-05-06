import * as functions from "firebase-functions";
import { SetlistSong } from "../model/setlist-song";
import { updateSetlistSongStatistics } from "./setlist-song-util";
import { isImportInProgress, updateParentSongSetlistRef } from "../utils";

export default async (snap, context) => {
    if(await isImportInProgress(context.params.accountId)){
        return;
    }
    const accountId = context.params.accountId;
    const setlistId = context.params.setlistId;
    const setlistSong = snap.data() as SetlistSong;
    updateSetlistSongStatistics(setlistSong, accountId, setlistId);

    //Updates parent song from the setlist song with the setlist ids and arrays
    if (setlistSong.songId && setlistSong.isBreak === false) {
        await updateParentSongSetlistRef(accountId, setlistSong.songId);
    }
    
    functions.logger.debug(`Deleting setlist song ${snap.id} ${setlistSong}`);
}