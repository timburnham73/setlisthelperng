/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import { syncSetlistHelperData } from "./sync-slh-data/sync-slh-data";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const syncSetlistHelper = functions.https.onRequest(syncSetlistHelperData);

export const onAddLyrics_UpdateSongLyricsCount =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/songs/{songId}/lyrics/{lyricId}")
    .onCreate(async (snap, context) => {
      //Dynamically import this function to reduce start up times.
      //When cloud functions are spun up all exported functions in the file will be loaded.
      //If all the code was below every function would load. 
      await (
        await import("./lyrics-count-trigger/on-add-lyrics"))
        .default(snap, context);
    });

    export const onAddAccoutImport_StartSLHSync =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/imports/{importId}")
    .onCreate(async (snap, context) => {
      //Dynamically import this function to reduce start up times.
      //When cloud functions are spun up all exported functions in the file will be loaded.
      //If all the code was below every function would load. 
      await (
        await import("./sync-slh-data/sync-slh-data"))
        .default(snap, context);
    });