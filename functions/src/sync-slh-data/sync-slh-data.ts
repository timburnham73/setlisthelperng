import * as functions from "firebase-functions";
const express = require('express');
const cors = require('cors');
//const util = require('util');
const bodyParser = require('body-parser');
import { db } from "../init";
import { AccountImport } from "../model/account-import";
import { SLHSong, SLHSongHelper, SongType } from "../model/SLHSong";
import { Lyric, LyricHelper } from "../model/lyric";
import { BaseUser } from "../model/user";
import { AccountImportEvent } from "../model/account-import-event";
//import { Account } from "./account";
export const syncSetlistHelperData = express();

syncSetlistHelperData.use(bodyParser.json());
syncSetlistHelperData.use(cors({ origin: true }));

syncSetlistHelperData.post("/", async (req, res) => {
  const responseBody = req.body;
  const accountid = responseBody['accountid'];
  functions.logger.debug(`Account id passed in ${accountid}`);
  functions.logger.debug(`Calling Sync Setlist Helper Data.`);
  try {
    const accountRef = db.doc(`/accounts/${accountid}`);
    const accountSnap = await accountRef.get();
    const account = accountSnap.data();
    const songs = await getSongs(account.importToken);
    functions.logger.debug(`Account name ${songs}`);
    res.status(200).json(songs);
  }
  catch (err) {
    functions.logger.error(`Could not import Setlist Helper data.`, err);
    res.status(500).json({ message: "User create successuffly" })
  }
})

export default async (accountImportSnap, context) => {
  const accountImport = accountImportSnap.data() as AccountImport;
  const accountId = context.params.accountId;
  functions.logger.debug(`Account jwtToken ${accountImport.jwtToken}`);

  startSync(accountImport.jwtToken, accountId, accountImportSnap.id, accountImport.createdByUser);
}

export const startSync = async (jwtToken: string, accountId: string, accountImportId: string, importingUser: BaseUser) => {
  const slhSongs: SLHSong[] = await getSongs(jwtToken);
  functions.logger.debug(`Song count ${slhSongs.length}`);

  const songsRef = db.collection(`/accounts/${accountId}/songs`);
  const accountImportEventRef = db.collection(`/accounts/${accountId}/imports/${accountImportId}/events`);
  await accountImportEventRef.add({eventType: "Song", message: "Starting import of Songs"} as AccountImportEvent);
  for (let slhSong of slhSongs) {
    //Do not import deleted songs. 
    if(slhSong.Deleted === true){
      await accountImportEventRef.add({eventType: "Song", message: `Deleted song with name ${slhSong.Name} will not be imported`} as AccountImportEvent);
      continue;
    }

    const convertedSong = SLHSongHelper.slhSongToSong(slhSong, importingUser);
    const addedSong = await songsRef.add(convertedSong);
    await accountImportEventRef.add({eventType: "Song", message: `Added song with name ${convertedSong.name}.`} as AccountImportEvent);
    if (slhSong.SongType === SongType.Song && slhSong.Lyrics) {
      functions.logger.debug(`Adding lyrics for song ${convertedSong.name}`);
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
      await accountImportEventRef.add({eventType: "Lyric", message: `Added lyric for the Song ${convertedSong.name}.`} as AccountImportEvent);
      await lyricsRef.add(LyricHelper.getForAdd(lyric, importingUser));
    }
    else {
      await accountImportEventRef.add({eventType: "Lyric", message: `No lyrics found for the Song ${convertedSong.name}.`} as AccountImportEvent);
      functions.logger.debug(`No lyrics for song ${convertedSong.name}`);
    }
  }
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
  return data;
}