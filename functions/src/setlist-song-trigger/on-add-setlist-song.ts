import { SetlistSong } from "../model/setlist-song";
import { isImportInProgress, updateParentSongSetlistRef } from "../utils";
import { updateSetlistSongStatistics } from "./setlist-song-util";

export default async (snap, context) => {
    const accountId = context.params.accountId;
    const setlistId = context.params.setlistId;
    if(await isImportInProgress(accountId)){
        return;
    }

    const setlistSong = snap.data() as SetlistSong;
    updateSetlistSongStatistics(setlistSong, accountId, setlistId);

    //Updates parent song from the setlist song with the setlist ids and arrays
    if (setlistSong.songId && setlistSong.isBreak === false) {
        await updateParentSongSetlistRef(accountId, setlistSong.songId);
    }
}

