import * as functions from "firebase-functions";
import {db} from "../init";

export default async (snap, context) => {
    updateCountOfLyricsInSongs(snap, context);
}

export const updateCountOfLyricsInSongs = async (snap, context) =>{
    functions.logger.debug(`Running the add lyrics trigger ${context.params.lyricId}`)
    
    //Get the reference to Lyrics and Song
    const lyricsRef = db.collection(`/accounts/${context.params.accountId}/songs/${context.params.songId}/lyrics`);
    const songsRef = db.doc(`/accounts/${context.params.accountId}/songs/${context.params.songId}`);
    
    //Get the snapshot count of lyrics for the song.
    const lyricCountSnap = await lyricsRef.count().get();
    
    //Update the lyric count on the master song
    songsRef.update({countOfLyrics: lyricCountSnap.data().count});
    functions.logger.debug(`Update lyrics count for song ${context.params.songId}:${lyricCountSnap.data().count}`);

    //Update all setlist songs with the lyric count
    //Find all the setlist songs
    const setlistSongSnap = await db.collectionGroup("songs").where('songId', '==', `${context.params.songId}`).get();
    functions.logger.debug(`Updating lyric count in all setlist songs. Setlist Song cound with song Id ${context.params.songId}`, setlistSongSnap.size);
    
    //Loop through and update the songs. 
    setlistSongSnap.forEach((doc) => {
       doc.ref.update({countOfLyrics: lyricCountSnap.data().count});
    });
}