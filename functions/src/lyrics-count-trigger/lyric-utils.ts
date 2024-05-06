import {db} from "../init";

export const updateCountOfLyricsInSongs = async (accountId, songId) =>{
    
    //Get the reference to Lyrics and Song
    const lyricsRef = db.collection(`/accounts/${accountId}/songs/${songId}/lyrics`);
    const songsRef = db.doc(`/accounts/${accountId}/songs/${songId}`);
    
    //Get the snapshot count of lyrics for the song.
    const lyricCountSnap = await lyricsRef.count().get();
    
    //Update the lyric count on the master song
    songsRef.update({countOfLyrics: lyricCountSnap.data().count});
    
    //Update all setlist songs with the lyric count
    //Find all the setlist songs
    const setlistSongSnap = await db.collectionGroup("songs").where('songId', '==', `${songId}`).get();
    
    //Loop through and update the songs. 
    setlistSongSnap.forEach((doc) => {
       doc.ref.update({countOfLyrics: lyricCountSnap.data().count});
    });
}