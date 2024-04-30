import * as functions from "firebase-functions";
import { SetlistSong } from "../model/setlist-song";
import { updateSetlistSongStatistics } from "./setlist-song-util";

export default async (snap, context) => {
    const setlistSong = snap.after.data() as SetlistSong;
    updateSetlistSongStatistics(setlistSong, context);
    functions.logger.debug(`Updating setlist song ${snap.after.id} ${setlistSong.name}`);
}