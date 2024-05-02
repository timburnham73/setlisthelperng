import * as functions from "firebase-functions";
import { Song } from "../model/song";
import { countSongs } from "./song-utils";


export default async (snap, context) => {
    const song = snap.after.data() as Song;
    countSongs(context);
    functions.logger.debug(`Updating song ${snap.after.id} ${song.name}`);
}