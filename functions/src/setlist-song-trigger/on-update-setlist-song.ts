import * as functions from "firebase-functions";
import { SetlistSong } from "../model/setlist-song";
import { updateSetlistSongStatistics } from "./setlist-song-util";
import { isImportInProgress } from "../utils";

export default async (snap, context) => {

    const accountId = context.params.accountId;
    const setlistId = context.params.setlistId;
    if(await isImportInProgress(context.params.accountId)){
        return;
    }
    const setlistSong = snap.after.data() as SetlistSong;
    updateSetlistSongStatistics(setlistSong, accountId, setlistId);
    functions.logger.debug(`Updating setlist song ${snap.after.id} ${setlistSong.name}`);
}