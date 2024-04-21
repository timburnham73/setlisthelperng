//import * as functions from "firebase-functions";
import {db} from "../init";
import * as functions from "firebase-functions";

export default async (snap, context) => {
    updateSetlistSongCount(snap, context);
}

export const updateSetlistSongCount = async (snap, context) =>{
    
    //Used to update the setlist with the song count
    const setlistRef = db.collection(`/accounts/${context.params.accountId}/setlists`);
    //Used to count the setlist songs
    //const setlistSongsRef = db.doc(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}/songs`);
    //Used to get the song ID.
    //const setlistSongRef = db.doc(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}/songs/${context.params.setlistId}`);
    
    
    functions.logger.debug(`Adding setlist song`);
    //Update all setlist songs with the lyric count
    //Find all the setlist songs
    const setlistSongSnap = await db.collectionGroup(`/accounts/${context.params.accountId}/setlists/${context.params.setlistId}/songs`)
                                    .where('SongType', '==', 0).get();

    //Update the lyric count on the master song
    setlistRef.update({countOfSongs: setlistSongSnap.data().count});
    
    
    //Loop through and update the songs. 
    // setlistSongSnap.forEach((doc) => {
    //    doc.ref.update({countOfLyrics: lyricCountSnap.data().count});
    // });
}