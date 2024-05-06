//import * as functions from "firebase-functions";
import { isImportInProgress } from "../utils";
import { updateCountOfLyricsInSongs } from "./lyric-utils";

export default async (snap, context) => {
    const accountId = context.params.accountId;
    const songId = context.params.songId;
    if(await isImportInProgress(accountId)){
        return;
    }
    
    updateCountOfLyricsInSongs(accountId, songId);
}