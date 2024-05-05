import * as functions from "firebase-functions";
import { SetlistSong } from "../model/setlist-song";
import { updateSetlistSongStatistics, updateParentSongSetlistRef } from "./setlist-song-util";

export default async (snap, context) => {
    const setlistSong = snap.data() as SetlistSong;
    updateSetlistSongStatistics(setlistSong, context);

    //Updates parent song from the setlist song with the setlist ids and arrays
    await updateParentSongSetlistRef(setlistSong, context);
    
    functions.logger.debug(`Deleting setlist song ${snap.id} ${setlistSong}`);
}