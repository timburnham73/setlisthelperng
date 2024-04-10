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
import { SLHTag, SLHTagHelper } from "../model/SLHTag";

interface SlhSongToFirebaseSongId {
  SongId: number;
  FireBaseSongId: string;
}

interface SlhSongIdToTagName {
  SLHSongId: number;
  TagName: string;
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
  const tagsRef = db.collection(`/accounts/${accountId}/tags`);
  const accountImportEventRef = db.collection(`/accounts/${accountId}/imports/${accountImportId}/events`);

  await addAccountEvent("System", "Starting import.", accountImportEventRef);
  
  //Tags
  await addAccountEvent("Tags", "Downloading tags.", accountImportEventRef);
  const tagDetails: string[] = [];
  
  const slhTags: SLHTag[] = await getTags(jwtToken);
  const mapSLHSongIdToTagName: SlhSongIdToTagName[] = [];
  for (let slhTag of slhTags) {
    if(!slhTag.Name){
      continue;//Do not add a tag with no name. 
    }

    //TAG: Add the tag to the database
    const convertedTag = SLHTagHelper.slhTagToTag(slhTag, importingUser);
    const alreadyAddedTag = mapSLHSongIdToTagName.find(tagName => tagName.TagName.toLowerCase() === convertedTag.name.toLowerCase());
    if(!alreadyAddedTag){
      await tagsRef.add(convertedTag);
      tagDetails.push(`Adding tag with name ${convertedTag.name}`);
    }

    //TAG: Create the mapping to the slh song id. 
    for(const songId of slhTag.songs){
      //If there was a duplicate tag name add the tag name that was already added first. 
      const tagName = alreadyAddedTag?.TagName? alreadyAddedTag?.TagName: slhTag.Name;
      mapSLHSongIdToTagName.push({SLHSongId: songId, TagName: tagName});
    }
  }

  const songDetails: string[] = [];//Account device details when the songs finish processing
  await addAccountEvent("Songs", "Downloading songs and lyrics.", accountImportEventRef);
  const slhSongs: SLHSong[] = await getSongs(jwtToken);

  await addAccountEvent("Songs", "Processing Songs, Lyrics, and Tags.", accountImportEventRef);
  const mapSongIdToFirebaseSongId: SlhSongToFirebaseSongId[] = [];
  for (let slhSong of slhSongs) {
    //Do not import deleted songs. 
    if(slhSong.Deleted === true || slhSong.SongType === 1){
      songDetails.push(`Not Adding song with name ${slhSong.Name}`);
      continue;
    }

    const convertedSong = SLHSongHelper.slhSongToSong(slhSong, importingUser);

    //ADD TAGS: Add tags to the converted song if there were any from seltist helper.
    const slhSongToTagNames = mapSLHSongIdToTagName.filter((slhSongIdToTagName) => slhSongIdToTagName.SLHSongId === slhSong.SongId);
    if(slhSongToTagNames.length > 0){
      const tagNames = slhSongToTagNames.map((slhSongIdToTagName) => slhSongIdToTagName.TagName);
      convertedSong.tags = tagNames;
      songDetails.push(`Added tags to Song ${convertedSong.name}: ${tagNames.join(',')}`);
    }

    const addedSong = await songsRef.add(convertedSong);
    songDetails.push(`Added song with name ${convertedSong.name}`);

    //Add the song ids to a map so we can find the song below in the setlist songs and associate the firebase id.
    mapSongIdToFirebaseSongId.push({SongId: slhSong.SongId, FireBaseSongId: addedSong.id });
    
    if (slhSong.SongType === SongType.Song && slhSong.Lyrics) {
      //Needed to updat the song with the default lyric
      const songUpdateRef = db.collection(`/accounts/${accountId}/songs`);
      const lyricsRef = db.collection(`/accounts/${accountId}/songs/${addedSong.id}/lyrics`);
      let versionNumber = 1;
      //let documentLyricCreated = false;
      if(slhSong.DocumentLocation){
        const lyricDocument = {
          name: `Version ${versionNumber++}`,
          key: convertedSong.key,
          tempo: convertedSong.tempo,
          notes: "",
          noteValue: convertedSong.noteValue,
          beatValue: convertedSong.beatValue,
          youTubeUrl: convertedSong.youTubeUrl,
          songId: addedSong.id,
          lyrics: "",
          audioLocation: slhSong.IosAudioLocation ? slhSong.IosAudioLocation : slhSong.SongLocation,
        } as Partial<Lyric>;
        const addLyric = await lyricsRef.add(LyricHelper.getForAdd(lyricDocument, importingUser));

        convertedSong.defaultLyricForUser.push({uid: importingUser.uid, lyricId: addLyric.id})
        songUpdateRef.doc(addedSong.id).update(convertedSong);
        //documentLyricCreated = true;
      }
      
      if(slhSong.Lyrics){
        const lyric = {
          name: `Version ${versionNumber++}`,
          key: convertedSong.key,
          tempo: convertedSong.tempo,
          notes: "",
          noteValue: convertedSong.noteValue,
          beatValue: convertedSong.beatValue,
          youTubeUrl: convertedSong.youTubeUrl,
          songId: addedSong.id,
          lyrics: slhSong.Lyrics,
          audioLocation: slhSong.IosAudioLocation ? slhSong.IosAudioLocation : slhSong.SongLocation,
          defaultLyric: "",
        } as Partial<Lyric>;
      
        await lyricsRef.add(LyricHelper.getForAdd(lyric, importingUser));
        songDetails.push(`Adding lyrics song with name ${slhSong.Name} - ${lyric.name}`);
      }
    }
  }//End of song import
  
  await addAccountEventWithDetails("Song", `Finished processing songs.`, [...tagDetails,...songDetails], accountImportEventRef);

  await addAccountEvent("Setlists", "Downloading setlists.", accountImportEventRef);
  const setlistsRef = db.collection(`/accounts/${accountId}/setlists`);
  const slhSetlists = await getSetlists(jwtToken);

  const setlistDetails: string[] = [];
  await addAccountEvent("Setlists", "Processing setlists.", accountImportEventRef);
  for(let slhSetlist of slhSetlists){
    
    const convertedSetlist = SLHSetlistHelper.slhSetlistToSetlist(slhSetlist, importingUser);
    
    //Add Setlist
    const addedSetlist = await setlistsRef.add(convertedSetlist);
    setlistDetails.push(`Added setlist with name ${convertedSetlist.name}`);

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
          setlistDetails.push(`Added setlist break with name ${setBreak.name}`);
        }
        else{
          //Find the Firebase songId
          const songIdMap = mapSongIdToFirebaseSongId.find((slhSongMap) => slhSongMap.SongId === setlistSLHSong.SongId);
          //Add Setlist Songs
          const setlistSong = {
            sequenceNumber: sequenceNumber, 
            isBreak: false,
            saveChangesToRepertoire: !isDeleted,  
            songId: songIdMap ? songIdMap.FireBaseSongId : 0,
            ...convertedSong
          } as SetlistSong;

          setlistSongsRef.add(setlistSong);
          setlistDetails.push(`Added setlist song with name ${setlistSong.name}`);
        }
        sequenceNumber++;
      }
    }
  }
  await addAccountEventWithDetails("Setlists", "Finished processing setlists.", setlistDetails, accountImportEventRef);
  
  await addAccountEvent("System", `Finished importing data.`, accountImportEventRef);
  functions.logger.debug(`Finished importing data`);
}

async function addAccountEventWithDetails(eventType: string, message: string, details: string[], accountImportEventRef){
  const accountImportEvent = await accountImportEventRef.add({
    eventType: eventType, 
    message: message,
    eventTime: Timestamp.now(),
  } as AccountImportEvent);

  const accountImportEventDetailsRef = db.collection(accountImportEvent.path + `/details`);
  accountImportEventDetailsRef.add({details: details});
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

async function getTags(accessToken: string) {
  const actionUrl = "https://setlisthelper.azurewebsites.net/api/v2.0/Tag";
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
  return data as SLHTag[];
}