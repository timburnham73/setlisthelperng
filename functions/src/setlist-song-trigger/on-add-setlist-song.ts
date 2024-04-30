import * as functions from "firebase-functions";
import { SetlistSong } from "../model/setlist-song";
import { updateSetlistSongStatistics } from "./setlist-song-util";

export default async (snap, context) => {
    functions.logger.debug(`Adding setlist song`);
    const setlistSong = snap.data() as SetlistSong;
    updateSetlistSongStatistics(setlistSong, context);
}

