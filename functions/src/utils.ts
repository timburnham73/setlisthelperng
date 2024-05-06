import * as functions from "firebase-functions";
import { db } from "./init";
import { SetlistRef } from "./model/setlist";
import { SetlistSong } from "./model/setlist-song";
export async function isImportInProgress(accountId: string){
    const accountDoc = db.doc(`/accounts/${accountId}`);
    const res = await accountDoc.get();
    const account = res.data();
    if (account && account.slhImportInProgress) {
        functions.logger.debug(`Trigger is paused until import is done.`);
        return  account.slhImportInProgress;
    }
    return false;
} 

////////////////////////////////////////////////////////////////////////////////////////////
//Updates parent song from the setlist song with the setlist ids and arrays
//Compiles the Setlists that contain the song (setlistSong.songId) and updatings that SetlistRef array in the song.
export async function updateParentSongSetlistRef(accountId, songId) {
    if (songId) {
        const setlistSongSnap = await db.collectionGroup(`songs`).where('songId', '==', songId).get();
        const setlistRefs = await getSetlistFromSetlistSongPath(setlistSongSnap);

        const songRef = db.doc(`/accounts/${accountId}/songs/${songId}`);
        songRef.update({ setlists: setlistRefs, doNotUpdateSetlistSongs: true });
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
//Get an array of setlist ids and names to put into a song object.
async function getSetlistFromSetlistSongPath(setlistSongSnap: any) {
    const setlistPaths: string[] = [];
    //Get the path to each setlist
    setlistSongSnap.forEach(async (doc) => {
        
        const splitSetlistSongPath = doc.ref.path.split('/');
        splitSetlistSongPath.splice(splitSetlistSongPath.length - 2, 2);
        
        const pathToSetlist = splitSetlistSongPath.join('/');
        
        setlistPaths.push(pathToSetlist);
    });

    const setlistRefs: SetlistRef[] = [];
    //Get the setlist from the path and return the id and name.
    for(const setlistPath of setlistPaths){
        const setlistBreakRef = db.doc(setlistPath);
        const setlistRef = await setlistBreakRef.get();
        const setlist = setlistRef.data();
        if(setlist && setlist.name && setlistRef && setlistRef.id){
            setlistRefs.push({name: setlist.name, id: setlistRef.id});
        }
    }

    return setlistRefs;
}

export const countSongs = async (accountId) => {
    
    const songsRef = db.collection(`/accounts/${accountId}/songs`).where('deactivated', '==', false);
    
    const accountRef = db.doc(`/accounts/${accountId}`);
    
    //Get the snapshot count of lyrics for the song.
    const songCountSnap = await songsRef.count().get();
    
    //Update the lyric count on the master song
    accountRef.update({countOfSongs: songCountSnap.data().count});
    
}

////////////////////////////////////////////////////////////////////////////////////////////
//This will update Song and Break count, Total Setlist time, songs in break, and time in set
export async function updateSetlistStatistics(accountId: string, setlistId: string) {
    
    let songCount = 0;
    let breakCount = 0;
    let totalTimeInSeconds = 0;
    let songCountBeforeBreaks = 0;
    let totalTimeInSecondsBeforeBreaks = 0;

    //Used to count the setlist songs
    const setlistSongCountSnap = await getSetlistSongsSnapshot(accountId, setlistId);

    //Loop through and update the songs. 
    setlistSongCountSnap.forEach((doc) => {
        const setlistSong = doc.data() as SetlistSong;
        //functions.logger.debug(`Setlist song sequence: ${setlistSong.sequenceNumber}`);
        if (setlistSong.isBreak === false) {
            songCount++;
            songCountBeforeBreaks++;
            totalTimeInSecondsBeforeBreaks += setlistSong.lengthMin ? setlistSong.lengthMin * 60 : 0;
            totalTimeInSecondsBeforeBreaks += setlistSong.lengthSec ? setlistSong.lengthSec : 0;

        }
        else {
            breakCount++;
            //Update the song count before a break and the total time. 
            const setlistBreakRef = db.doc(`/accounts/${accountId}/setlists/${setlistId}/songs/${doc.id}`);
            setlistBreakRef.update({ countOfSongs: songCountBeforeBreaks, totalTimeInSeconds: totalTimeInSecondsBeforeBreaks });
            //functions.logger.debug(`Updating setlist break with ${doc.id} countOfSongs:${songCountBeforeBreaks}, totalTimeInSeconds: ${totalTimeInSecondsBeforeBreaks}`);
            //Reset the counter
            songCountBeforeBreaks = 0;
            totalTimeInSecondsBeforeBreaks = 0;
        }
        totalTimeInSeconds += setlistSong.lengthMin ? setlistSong.lengthMin * 60 : 0;
        totalTimeInSeconds += setlistSong.lengthSec ? setlistSong.lengthSec : 0;
    });

    //Used to update the setlist with the song count. The setlist may be deleted and so do not try to update it. 
    const setlistDoc = db.doc(`/accounts/${accountId}/setlists/${setlistId}`);
    const res = await setlistDoc.get();
    const setlistToUpdate = res.data();
    if (setlistToUpdate) {
        setlistDoc.update({ countOfSongs: songCount, countOfBreaks: breakCount, totalTimeInSeconds: totalTimeInSeconds });
    }
}


////////////////////////////////////////////////////////////////////////////////////////////
//Gets the setlist songs in order

export async function getSongSnapshot(accountId) {
    const songRef = db.collection(`/accounts/${accountId}/songs`);
    const songCountSnap = await songRef.get();
    return songCountSnap;
}

export async function getSetlistSnapshot(accountId) {
    const setlistRef = db.collection(`/accounts/${accountId}/setlists`);
    const setlistCountSnap = await setlistRef.get();
    return setlistCountSnap;
}

async function getSetlistSongsSnapshot(accountId, setlistId) {
    const setlistSongsRef = db.collection(`/accounts/${accountId}/setlists/${setlistId}/songs`)
        .orderBy("sequenceNumber", "asc");
    const setlistSongCountSnap = await setlistSongsRef.get();
    return setlistSongCountSnap;
}