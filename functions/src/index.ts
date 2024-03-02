/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {db} from "./init";

import * as functions from "firebase-functions";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const onAddLyricsUpdateSongLyricsCount = 
  functions
    .runWith({
      timeoutSeconds:300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/songs/{songId}/lyrics/{lyricId}")
    .onCreate(async (snap, context) => {
      functions.logger.debug(`Running the add lyrics trigger ${context.params.lyricId}`)
      const lyricsRef = db.collection(`/accounts/${context.params.accountId}/songs/${context.params.songId}/lyrics`);
      const songsRef = db.doc(`/accounts/${context.params.accountId}/songs/${context.params.songId}`);
      const lyricCountSnap = await lyricsRef.count().get();
      
      songsRef.update({countOfLyrics: lyricCountSnap.data().count});
      functions.logger.debug(`Update lyrics count for song ${context.params.songId}:${lyricCountSnap.data().count}`)
    
    });
