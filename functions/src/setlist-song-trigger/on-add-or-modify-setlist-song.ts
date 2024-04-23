//import * as functions from "firebase-functions";
import {db} from "../init";
import * as functions from "firebase-functions";
import { SetlistSong } from "../model/setlist-song";

export default async (snap, context) => {
    updateSetlistSongStatistics(snap, context);
}

export const updateSetlistSongStatistics = async (snap, context) => {
    const setlistSong = snap.data() as SetlistSong;
    //Used to update the setlist with the song count
    const setlistRef = db.doc(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}`);
    //Used to count the setlist songs
    const setlistSongsRef = db.collection(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}/songs`);
    
    
    functions.logger.debug(`Adding setlist song`);
    //Update all setlist songs with the lyric count
    //Find all the setlist songs
    //Get the snapshot count of lyrics for the song.
    const setlistSongCountSnap = await setlistSongsRef.get();
    const setlistSongSnap = await db.collectionGroup(`songs`)
                                    .where('songId', '==', setlistSong.songId).get();

    const setlistBreakRef = db.doc(`/accounts/${context.params.accountId}/songs/${setlistSong.songId}`);
    setlistBreakRef.update({countOfSetlistSongs: setlistSongSnap.size});

    let songCount = 0;
    let breakCount = 0;
    let totalTimeInSeconds = 0;
    let songCountBeforeBreaks = 0;
    let totalTimeInSecondsBeforeBreaks = 0;
    //Loop through and update the songs. 
    setlistSongCountSnap.forEach((doc) => {
        const setlistSong = doc.data() as SetlistSong;
        if(setlistSong.isBreak === false){
            songCount++;
            songCountBeforeBreaks++;
            totalTimeInSecondsBeforeBreaks += setlistSong.lengthMin ? setlistSong.lengthMin * 60 : 0;
            totalTimeInSecondsBeforeBreaks += setlistSong.lengthSec ? setlistSong.lengthSec : 0;
        }
        else{
            breakCount++;
            //Update the song count before a break and the total time. 
            const setlistBreakRef = db.doc(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}/songs/${doc.id}`);
            setlistBreakRef.update({countOfSongs: songCountBeforeBreaks, totalTimeInSeconds: totalTimeInSecondsBeforeBreaks});
            //Reset the counter
            songCountBeforeBreaks = 0;
            totalTimeInSecondsBeforeBreaks = 0;
        }
        totalTimeInSeconds += setlistSong.lengthMin ? setlistSong.lengthMin * 60 : 0;
        totalTimeInSeconds += setlistSong.lengthSec ? setlistSong.lengthSec : 0;
    });
    setlistRef.update({countOfSongs: songCount, countOfBreaks: breakCount, totalTimeInSeconds: totalTimeInSeconds});
}