import * as functions from "firebase-functions";
import { Song } from "../model/song";
import {db} from "../init";
import { countSongs } from "./song-utils";
import { SetlistSong } from "../model/setlist-song";


export default async (snap, context) => {
    const song = snap.after.data() as Song;
    song.id = snap.after.id;
    functions.logger.debug(`Song that was updated. ${song.id}`);
    countSongs(context);

    const setlistSongSnap = await db.collectionGroup(`songs`).where('songId', '==', song.id)
                                                             .where('saveChangesToRepertoire', '==', true)
                                                             .get();
    
    setlistSongSnap.forEach(async (doc) => {
        const setlistSongPath = doc.ref.path;
        const modifiedSong = { ...song } as SetlistSong;
        await updateSetlistSong(setlistSongPath, modifiedSong);
    });
    
}

async function updateSetlistSong(setlistSongPath: string, modifiedSong: SetlistSong) {
    const setlistSongDoc = db.doc(setlistSongPath);
    const res = await setlistSongDoc.get();
    const setlistSongToUpdate = res.data();
    if (setlistSongToUpdate) {
        setlistSongDoc.update(modifiedSong);
    }
}
