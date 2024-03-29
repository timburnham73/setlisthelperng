import * as functions from "firebase-functions";
import { db } from "../init";
import { AccountImport } from "../model/account-import";
import { SLHSong, SLHSongHelper, SongType } from "../model/SLHSong";
import { Lyric, LyricHelper } from "../model/lyric";
import { BaseUser } from "../model/user";
import { AccountImportEvent } from "../model/account-import-event";
import { Timestamp } from "firebase-admin/firestore";
import { SLHSetlist, SLHSetlistHelper } from "../model/SLHSetlist";
import { SetlistBreakHelper } from "../model/setlist-break";
import { SetlistSong } from "../model/setlist-song";

interface SlhSongToFirebaseSongId {
  SongId: number;
  FireBaseSongId: string;
}
//Entry point
export default async (accountImportSnap, context) => {
  const accountImport = accountImportSnap.data() as AccountImport;
  const accountId = context.params.accountId;
  functions.logger.debug(`Account jwtToken ${accountImport.jwtToken}`);

  startSync(accountImport.jwtToken, accountId, accountImportSnap.id, accountImport.createdByUser);
}
//Starting to Sync
export const startSync = async (jwtToken: string, accountId: string, accountImportId: string, importingUser: BaseUser) => {
  const songsRef = db.collection(`/accounts/${accountId}/songs`);
  const accountImportEventRef = db.collection(`/accounts/${accountId}/imports/${accountImportId}/events`);

  await addAccountEvent("System", "Starting import.", accountImportEventRef);
  await addAccountEvent("Songs", "Downloading songs and lyrics.", accountImportEventRef);
  const slhSongs: SLHSong[] = await getSongs(jwtToken);
  const mapSongIdToFirebaseSongId: SlhSongToFirebaseSongId[] = [];
  for (let slhSong of slhSongs) {
    //Do not import deleted songs. 
    if(slhSong.Deleted === true || slhSong.SongType === 1){
      continue;
    }

    const convertedSong = SLHSongHelper.slhSongToSong(slhSong, importingUser);
    const addedSong = await songsRef.add(convertedSong);
    mapSongIdToFirebaseSongId.push({SongId: slhSong.SongId, FireBaseSongId: addedSong.id });
    await addAccountEvent("Song", `Added song with name ${convertedSong.name}.`, accountImportEventRef);

    if (slhSong.SongType === SongType.Song && slhSong.Lyrics) {
      const lyricsRef = db.collection(`/accounts/${accountId}/songs/${addedSong.id}/lyrics`);
      const lyric = {
        name: "Version 1",
        key: convertedSong.key,
        tempo: convertedSong.tempo,
        notes: "",
        noteValue: convertedSong.noteValue,
        beatValue: convertedSong.beatValue,
        youTubeUrl: convertedSong.youTubeUrl,
        songId: addedSong.id,
        lyrics: slhSong.Lyrics,
        defaultLyric: "",
      } as Lyric;
      
      await addAccountEvent("Lyric", `Added lyric for the Song ${convertedSong.name}.`, accountImportEventRef);
      await lyricsRef.add(LyricHelper.getForAdd(lyric, importingUser));
    }
    else {
      await addAccountEvent("Lyric", `No lyrics found for the Song ${convertedSong.name}.`, accountImportEventRef);
    }
  }//End of song import
  
  await addAccountEvent("Setlists", "Downloading setlists.", accountImportEventRef);
  const setlistsRef = db.collection(`/accounts/${accountId}/setlists`);
  const slhSetlists = await getSetlists(jwtToken);

  await addAccountEvent("Setlists", "Processing setlists.", accountImportEventRef);
  for(let slhSetlist of slhSetlists){
    
    const setlist = SLHSetlistHelper.slhSetlistToSetlist(slhSetlist, importingUser);
    const addedSetlist = await setlistsRef.add(setlist);
    await addAccountEvent("Song", `Added setlist with name ${setlist.name}.`, accountImportEventRef);

    const setlistSongsRef = db.collection(`/accounts/${accountId}/setlists/${addedSetlist.id}/songs`);
    
    let sequenceNumber = 1;
    for(const setlistSongId of slhSetlist.songs){
      const setlistSLHSong = slhSongs.find((slhSong) => slhSong.SongId === setlistSongId);
      if(setlistSLHSong){
        const convertedSong = SLHSongHelper.slhSongToSong(setlistSLHSong, importingUser);
        const isDeleted = setlistSLHSong.Deleted;
        if(setlistSLHSong.SongType === 1){
          //Add Break
          const setBreakPartial = {
            sequenceNumber: sequenceNumber,
            isBreak: true,
            name: convertedSong.name,
            notes: convertedSong.notes,
            breakTime: convertedSong.songLength
          }
          const setBreak = SetlistBreakHelper.getSetlistBreakForAdd(setBreakPartial, importingUser);
          setlistSongsRef.add(setBreak);
          await addAccountEvent("Setlist Break", `Added setlist break with name ${setBreak.name}.`, accountImportEventRef);
        }
        else{
          //Find the Firebase songId
          const songIdMap = mapSongIdToFirebaseSongId.find((slhSongMap) => slhSongMap.SongId === setlistSLHSong.SongId);
          //Add Setlist Songs
          const setlistSong = {
            sequenceNumber: sequenceNumber, 
            saveChangesToRepertoire: !isDeleted,  
            songId: songIdMap ? songIdMap.FireBaseSongId : 0,
            ...convertedSong
          } as SetlistSong;
          setlistSongsRef.add(setlistSong);
          await addAccountEvent("Setlist Song", `Added setlist song with name ${setlistSong.name}.`, accountImportEventRef);
        }
        sequenceNumber++;
      }
    }
  }

  await addAccountEvent("System", `Finished importing data.`, accountImportEventRef);
  functions.logger.debug(`Finished importing data`);
}

async function addAccountEvent(eventType: string, message: string, accountImportEventRef){
  await accountImportEventRef.add({
    eventType: eventType, 
    message: message,
    eventTime: Timestamp.now()
  } as AccountImportEvent);
}

async function getSongs(accessToken: string) {
  const actionUrl = "https://setlisthelper.azurewebsites.net/api/v2.0/Song";
  // const startIndex = 0;
  // const numberOfSongsToGet = 100;
  // const orderByColumnName = 'name';
  // const orderByColumDirection = "asc";
  const jwt = accessToken;
  const songsUrl = actionUrl //+ `?start=${startIndex}&records=${numberOfSongsToGet}&orderbycol=${orderByColumnName}&orderbydirection=${orderByColumDirection}`;

  const headers: Headers = new Headers()
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', 'Bearer ' + jwt,)

  const request: RequestInfo = new Request(songsUrl, {
    // We need to set the `method` to `POST` and assign the headers
    method: 'GET',
    headers: headers,
  });

  // Send the request and print the response
  const response = await fetch(request);
  const data = await response.json();
  return data as SLHSong[];
}

async function getSetlists(accessToken: string) {
  const actionUrl = "https://setlisthelper.azurewebsites.net/api/v2.0/Setlist";
  const jwt = accessToken;
  const songsUrl = actionUrl;

  const headers: Headers = new Headers()
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', 'Bearer ' + jwt,)

  const request: RequestInfo = new Request(songsUrl, {
    // We need to set the `method` to `POST` and assign the headers
    method: 'GET',
    headers: headers,
  });

  // Send the request and print the response
  const response = await fetch(request);
  const data = await response.json();
  return data as SLHSetlist[];
}