import {db} from "../init";

export const countSongs = async (context) => {
    
    const songsRef = db.collection(`/accounts/${context.params.accountId}/songs`).where('deactivated', '==', false);
    
    const accountRef = db.doc(`/accounts/${context.params.accountId}`);
    
    //Get the snapshot count of lyrics for the song.
    const songCountSnap = await songsRef.count().get();
    
    //Update the lyric count on the master song
    accountRef.update({countOfSongs: songCountSnap.data().count});
    
}