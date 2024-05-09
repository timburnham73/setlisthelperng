/**
 * Import function triggers from their respective submodules:
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 * 
 * The exported function name has the format of {Model}_{Event}_{Function Name}
 */

import * as functions from "firebase-functions";

//////////////////////////////////////////////////
//Lyrics
/*export const Lyrics_OnAdd_UpdateSongLyricsCount =
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

//////////////////////////////////////////////////
//Setlist Songs
export const SetlistSong_OnAdd_UpdateSetlistSongStatistics =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/setlists/{setlistId}/songs/{setlistSongId}")
    .onCreate(async (snap, context) => {
      await (
        await import("./setlist-song-trigger/on-add-setlist-song"))
        .default(snap, context);
    });

export const SetlistSong_onUpdate_UpdateSetlistSongStatistics =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/setlists/{setlistId}/songs/{setlistSongId}")
    .onUpdate(async (change, context) => {
      await (
        await import("./setlist-song-trigger/on-update-setlist-song"))
        .default(change, context);
    });

export const SetlistSong_onDelete_UpdateSetlistSongStatistics =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/setlists/{setlistId}/songs/{setlistSongId}")
    .onDelete(async (snap, context) => {
      await (
        await import("./setlist-song-trigger/on-delete-setlist-song"))
        .default(snap, context);
    });

//////////////////////////////////
//Song functions
export const Song_onAdd_UpdateSetlistCount =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/songs/{songId}")
    .onCreate(async (snap, context) => {
      await (
        await import("./songs-trigger/on-add-song"))
        .default(snap, context);
    });

export const Song_onUpdate_UpdateSetlistCount =
    functions
      .runWith({
        timeoutSeconds: 300,
        memory: "128MB"
      })
      .firestore.document("accounts/{accountId}/songs/{songId}")
      .onUpdate(async (snap, context) => {
        await (
          await import("./songs-trigger/on-update-song"))
          .default(snap, context);
      });

export const Song_onDelete_UpdateSetlistCount =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/songs/{songid}")
    .onDelete(async (snap, context) => {
      await (
        await import("./songs-trigger/on-delete-song"))
        .default(snap, context);
    });

//////////////////////////////////
//Setlist functions
export const Setlist_onAdd_UpdateSetlistCount =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/setlists/{setlistId}")
    .onCreate(async (snap, context) => {
      await (
        await import("./setlists-trigger/on-count-setlists"))
        .default(snap, context);
    });

export const Setlist_onDelete_RemoveSetlistSongs =
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: "128MB"
    })
    .firestore.document("accounts/{accountId}/setlists/{setlistId}")
    .onDelete(async (snap, context) => {
      await (
        await import("./setlists-trigger/on-delete-setlist"))
        .default(snap, context);
    });*/

//////////////////////////////////
//Sync functions
export const AccoutImport_OnAdd_StartSLHSync =
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